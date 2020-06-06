const path = require('path');
const fs = require('fs');

const projectBundlePath = path.join(__dirname, '../dist/index.cjs.js');
if (!fs.existsSync(projectBundlePath)) {
    console.error('Project must be built before running tests');
    process.exit(1);
}

const livereload = require(projectBundlePath);

const { EventEmitter } = require('events');
const WebSocket = require('ws');
const process = require('process');
const memfs = require('rollup-plugin-memory-fs');
const rollup = require('rollup');

const bundleOutputDir = path.join(__dirname, 'dist');

const port = 35777;
const reloadEmitter = new EventEmitter();

const pluginOptions = {
    port,
    watch: 'pass',
    reloadEmitter,
    verbosity: 'silent',
};

const livereloadPlugin = livereload(pluginOptions);

const watcher = rollup.watch({
    input: 'virtual-module',
    output: {
        format: 'esm',
        dir: bundleOutputDir,
    },
    plugins: [
        {
            name: 'virtual-entry',
            resolveId(source) {
                if (source === 'virtual-module') {
                    return source;
                }
                return null;
            },
            load(id) {
                if (id === 'virtual-module') {
                    return 'export default 1';
                }
                return null;
            },
        },
        memfs(),
        livereloadPlugin,
    ],
});

const watcherBuildEndPromise = new Promise((resolve, reject) => {
    watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
            resolve();
        } else if (event.code === 'ERROR') {
            reject(event.error);
        }
    });
});

beforeAll(() => watcherBuildEndPromise);
afterAll(() => {
    watcher.close();

    // In normal circumstances there would be no need to explicitly stop LiveReload server, since it
    // would be shut down with Rollup. However, here we do this to terminate any processes that prevent
    // Jest from shutting down
    livereloadPlugin.stop();
});

test('sends reload request on event', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('message', (data) => {
        expect(typeof data).toBe('string');

        const message = JSON.parse(data);
        expect(typeof message).toBe('object');
        expect(message).toHaveProperty('command', 'reload');
        expect(message).toHaveProperty('path', 'pass');

        ws.close();
        done();
    });

    ws.on('open', () => reloadEmitter.emit('reload', 'pass'));
});

test('buffers several reload events and sends only one request', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    let called = 0;
    ws.on('message', (data) => {
        expect(typeof data).toBe('string');

        const message = JSON.parse(data);
        expect(typeof message).toBe('object');
        expect(message).toHaveProperty('command', 'reload');
        expect(message).toHaveProperty('path', 'pass');

        called++;
    });

    ws.on('open', () => {
        reloadEmitter.emit('reload', 'pass');
        reloadEmitter.emit('reload', 'pass');
        reloadEmitter.emit('reload', 'pass');
        reloadEmitter.emit('reload', 'pass');
        reloadEmitter.emit('reload', 'pass');
        reloadEmitter.emit('reload', 'pass');

        setTimeout(() => {
            expect(called).toBe(1);

            ws.close();
            done();
        }, 1000);
    });
});

test("ignores files that don't match options", (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    let called = false;
    ws.on('message', () => {
        called = true;
    });

    ws.on('open', () => {
        reloadEmitter.emit('reload', 'not_pass');

        setTimeout(() => {
            expect(called).toBe(false);

            ws.close();
            done();
        }, 1000 /* Couldn't think of a better way to make sure that 'message' should have been received by a certain moment */);
    });
});

test('resolves watch paths relative to output directory', (done) => {
    const expectedPath = path.join(bundleOutputDir, 'pass');

    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('message', (data) => {
        expect(typeof data).toBe('string');

        const message = JSON.parse(data);
        expect(typeof message).toBe('object');
        expect(message).toHaveProperty('command', 'reload');
        expect(message).toHaveProperty('path', expectedPath);

        ws.close();
        done();
    });

    ws.on('open', () => reloadEmitter.emit('reload', expectedPath));
});
