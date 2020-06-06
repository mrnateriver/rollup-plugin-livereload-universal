import del from 'rollup-plugin-delete';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import progress from 'rollup-plugin-progress';
import typescript from 'rollup-plugin-typescript2';
import externals from 'rollup-plugin-node-externals';

export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/index.cjs.js', format: 'cjs' },
        { file: 'dist/index.es.js', format: 'esm' },
    ],
    plugins: [
        // Outputs current build progress
        progress({ clearLine: true }),

        // Removes files from destination directory before build
        del({ targets: 'dist/*' }),

        // Leave library dependencies out of the bundle
        externals({ deps: true }),

        // Allows resolving external dependencies in `node_modules`
        resolve(),

        // Transform CommonJS external modules into ES modules for tree-shaking
        commonjs(),

        // Transpiles TypeScript
        typescript(),
    ],
};
