import { Verbosity, PluginOptions } from './options';
import { createServer, Server } from 'livereload';
import { sanitizeUrl, green } from './helpers';
import { setImmediate } from 'timers';
import { Plugin, OutputOptions } from 'rollup';
import * as path from 'path';

export class ReloadService implements Plugin {
    /**
     * Name of the plugin for Rollup.
     */
    public readonly name = 'livereload-universal';

    /**
     * A queue of reload requests, which are processed at once in a single async task.
     */
    private readonly reloadQueue: string[] = [];

    /**
     * An ID of previously scheduled task for processing a number of emitted events.
     */
    private reloadTaskId: NodeJS.Immediate;

    /**
     * An instance of LiveReload WS server.
     */
    private server: Server;

    /**
     * Whether this service has started.
     */
    private started = false;

    /**
     * An array of directories where Rollup outputs artifacts.
     * Used in case relative file path is emitted in reload event.
     */
    private outputDirectories = new Set<string>();

    /**
     * An array of resolved paths that cause reload on update.
     */
    private resolvedWatchedPaths: Set<string>;

    /**
     * Create a new instance of this service with specified options.
     *
     * @param pluginOptions Well, options.
     */
    constructor(private pluginOptions: PluginOptions) {
        if (!pluginOptions?.reloadEmitter) {
            throw new TypeError('Reload event emitter must be specified');
        }
    }

    /**
     * Rollup hook that is triggered once output options have settled.
     */
    outputOptions = (options: OutputOptions): OutputOptions | null | undefined => {
        if (!this.resolvedWatchedPaths) {
            this.resolvedWatchedPaths = new Set();
        }

        if (this.pluginOptions.watch) {
            const outputDir = options.dir || (options.file ? path.resolve(path.dirname(options.file)) : '');
            this.outputDirectories.add(outputDir);

            const arrayedPaths = Array.isArray(this.pluginOptions.watch)
                ? this.pluginOptions.watch
                : [this.pluginOptions.watch];
            for (const watchedPath of arrayedPaths) {
                if (path.isAbsolute(watchedPath)) {
                    this.resolvedWatchedPaths.add(watchedPath);
                } else {
                    this.resolvedWatchedPaths.add(path.resolve(outputDir, watchedPath));
                }
            }
        }

        return null;
    };

    /**
     * Rollup hook for adding extra code to the bundle.
     * In this case, returns code that is prepended to the output bundle that loads LiveReload JS file that connects to WS server and listens for reload requests.
     */
    banner = () => {
        const snippetSrc = this.getLiveReloadClientSnippetSrc();
        return `(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = ${snippetSrc}; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);`;
    };

    /**
     * Rollup hook that is triggered when bundle is generated and ready to be output.
     */
    generateBundle = () => {
        if (!this.started) {
            if (this.pluginOptions.verbosity !== Verbosity.Silent) {
                console.log(green('✔') + ' LiveReload enabled');
            }

            this.started = true;
        }
    };

    /**
     * Starts the LiveReload server and starts listening for reload requests from the provided emitter.
     */
    start() {
        this.server = createServer({
            debug: this.pluginOptions.verbosity === Verbosity.Debug,
            port: this.getLiveReloadPort(),
        });

        this.pluginOptions.reloadEmitter.on('reload', this.triggerReload);
    }

    /**
     * Stops the LiveReload server and removes event listener for reload requests.
     */
    stop() {
        this.pluginOptions.reloadEmitter.off('reload', this.triggerReload);
        this.server?.close();
    }

    /**
     * Returns port that LiveReload WS server listens to (and client connects to).
     */
    protected getLiveReloadPort() {
        return (typeof this.pluginOptions.port === 'number' ? this.pluginOptions.port : 0) || 35729;
    }

    /**
     * Returns URL for loading client-side LiveReload code in the form of JSON (JS) string.
     * Returned value is supposed to be a valid JS code so that it can be inserted into other JS code.
     */
    protected getLiveReloadClientSnippetSrc() {
        const clientUrl = sanitizeUrl(this.pluginOptions.clientUrl);
        const port = this.getLiveReloadPort();

        return clientUrl
            ? JSON.stringify(clientUrl)
            : process.env.CODESANDBOX_SSE
            ? `'//' + (window.location.host.replace(/^([^.]+)-\\d+/, "$1").replace(/^([^.]+)/, "$1-${port}")).split(':')[0] + '/livereload.js?snipver=1&port=443'`
            : `'//' + (window.location.host || 'localhost').split(':')[0] + ':${port}/livereload.js?snipver=1'`;
    }

    /**
     * Checks whether specified path matches `watch` option.
     *
     * @param filePath File path.
     */
    private pathMatches(filePath: string) {
        if (!this.resolvedWatchedPaths) {
            // If watched paths set is not initialized yet, that means we can't determine whether emitted file path should be watched
            // However, it shouldn't even matter, since set is initialized at the very beginning of Rollup build, and user cannot use the bundle at that moment yet
            return false;
        } else if (this.resolvedWatchedPaths.size === 0) {
            return true;
        }

        if (path.isAbsolute(filePath)) {
            return this.resolvedWatchedPaths.has(filePath);
        } else {
            // If relative path is emitted, we'll try to find this file among output directories
            return Array.from(this.outputDirectories).reduce(
                (prev, cur) => prev || this.resolvedWatchedPaths.has(path.resolve(cur, filePath)),
                false,
            );
        }
    }

    /**
     * Handler for `reload` event that causes user's page refresh.
     * This function has to be bound because it's passed as an event listener.
     *
     * @param filePath Path of the file that caused the refresh.
     */
    private readonly triggerReload = (filePath: string) => {
        this.reloadQueue.push(filePath);

        if (this.reloadTaskId) {
            clearImmediate(this.reloadTaskId);
        }
        this.reloadTaskId = setImmediate(() => {
            const matchingPaths = this.reloadQueue.filter((p) => this.pathMatches(p));
            this.reloadQueue.length = 0; // clever and standards-compliant trick for emptying array (https://stackoverflow.com/a/1234337/5877243)

            if (matchingPaths.length > 0) {
                this.server?.refresh(matchingPaths[0]);
            }
        });
    };
}
