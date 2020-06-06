import { ReloadEmitter } from './reload-emitter';

/**
 * Level of STDOUT output this plugin produces.
 */
export const enum Verbosity {
    /**
     * No output at all.
     */
    Silent = 'silent',

    /**
     * Only output message about successfully starting LiveReload server.
     */
    Startup = 'startup',

    /**
     * Output everything.
     */
    Debug = 'debug',
}

/**
 * Plugin's options.
 */
export interface PluginOptions {
    /**
     * Object that emits events for reloading user's page.
     *
     * If you're writing your own emitter, note that you should emit `reload` event for each file that caused the reload (in
     * case there are several files), so that handler can respect the `watch` parameter accurately. All emissions of `reload`
     * events are buffered for the next macrotask, so it's fine to emit several events simultaneously.
     *
     * For example, if two files were changed simultaneously, but `reload` event was only emitted for one of them, if that
     * file didn't match the `watch` setting then user's page would not be reloaded. And otherwise, if two events were emitted
     * simultaneously, only one request to reload the page will be sent to the user.
     */
    reloadEmitter: ReloadEmitter;

    /**
     * Level of output verbosity.
     * Defaults to {@link Verbosity.Startup}.
     */
    verbosity?: Verbosity;

    /**
     * A single path or an array of paths that should be watched for changes for reloading the user's page.
     * Accepts both directories and specific files.
     * If not specified, any `reload` event emitted by {@link PluginOptions.reloadEmitter} will cause page refresh.
     * If relative path is specified, it's resolved relative to Rollup output directory (or directory in
     * which `output.file` resides; each output is checked).
     */
    watch?: string | string[];

    /**
     * Port that LiveReload WS server will listen to.
     * Defaults to `35729`.
     */
    port?: number;

    /**
     * URL of the client JS script that's supposed to connect to LiveReload WS server.
     */
    clientUrl?: string;
}
