import { ReloadService } from './reload-service';
import { PluginOptions } from './options';
import { Plugin } from 'rollup';

let reloadService: ReloadService;

/**
 * Plugin that allows reloading user's page from outside Rollup.
 */
export default function livereload(options: PluginOptions): Plugin {
    if (reloadService) {
        reloadService.stop();
    }

    reloadService = new ReloadService(options);
    reloadService.start();

    return reloadService;
}

export { Verbosity, PluginOptions } from './options';
export { ReloadEmitter } from './reload-emitter';

// This is needed so that Rollup includes type definitions in the bundle
import './options';
import './reload-emitter';
