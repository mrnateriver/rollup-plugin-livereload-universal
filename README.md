# Universal Rollup LiveReload Plugin

<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
</a>
<a href="https://github.com/mrnateriver/rollup-plugin-livereload-universal/issues">
  <img src="https://img.shields.io/github/issues/mrnateriver/rollup-plugin-livereload-universal.svg" alt="Issues" />
</a>
<a href="https://npmjs.org/package/rollup-plugin-livereload-universal">
  <img src="https://img.shields.io/npm/v/rollup-plugin-livereload-universal.svg?style=flat-squar" alt="NPM" />
</a>
<a href="https://github.com/mrnateriver/rollup-plugin-livereload-universal/releases">
  <img src="https://img.shields.io/github/release/mrnateriver/rollup-plugin-livereload-universal/all.svg" alt="Latest Version" />
</a>

This plugin allows manually triggering reload of the user's page via [LiveReload](https://github.com/napcs/node-livereload) WS connection. This plugin was conceived as a supplement for [rollup-plugin-memory-fs](https://github.com/mrnateriver/rollup-plugin-memory-fs), since it is the only way to provide live reloading while using that plugin. However, as the name implies, it's *universal*.

This plugin is **heavily** inspired by and partly taken from [rollup-plugin-livereload](https://github.com/thgh/rollup-plugin-livereload), so big kudos to [Thomas Ghysels](https://github.com/thgh) for that plugin. If you're not using [rollup-plugin-memory-fs](https://github.com/mrnateriver/rollup-plugin-memory-fs), there's a high probability his plugin will work for you just fine.

## Installation
```
# yarn
yarn add -D rollup-plugin-livereload-universal

# npm
npm install --save-dev rollup-plugin-livereload-universal
```

## Usage
```js
// rollup.config.js
import serve from 'rollup-plugin-serve';
import memfs from 'rollup-plugin-memory-fs'
import livereload from 'rollup-plugin-livereload-universal'

const memfsPlugin = memfs();
const livereloadPlugin = livereload({ reloadEmitter: memfsPlugin });

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: ...
  },
  plugins: [
    serve({ contentBase: ['./dist'] }),
    memfsPlugin,
    livereloadPlugin,
  ]
}
```

## Options


| Option        | Type           | Required | Default | Description |
| ------------- | -------------- | -------- | ------- | ----------- |
| reloadEmitter | [ReloadEmitter] | `true` | `undefined` | [EventEmitter] that emits `reload` event for reloading user's page. |
| verbosity | `"silent"` \| `"startup"` \| `"debug"` <br/>[Verbosity] | `false` | `"startup"` | Level of output verbosity.
| watch | `string` | `false` | `undefined` | A single path or an array of paths that should be watched for changes for reloading the user's page.<br/>Accepts both directories and specific files.<br/>If not specified, any `reload` event will cause page refresh.<br/>If relative path is specified, it's resolved relative to Rollup output directory (or directory in which `output.file` resides; each output is checked).
| port | `number` | `false` | `35729` | Port that LiveReload WS server will listen to.  |
| clientUrl | `string` | `false` | `undefined` | URL of a custom client JS script that's supposed to connect to LiveReload WS server. |


## ReloadEmitter

If you're writing your own emitter (as opposed to using, for example, [rollup-plugin-memory-fs](https://github.com/mrnateriver/rollup-plugin-memory-fs)), note that you should emit `reload` event for each file that caused the reload (in case there were several files), so that handler can respect the `watch` parameter accurately. All emissions of `reload` events are buffered for the next iteration of Node.js event loop, so it's fine to emit several events simultaneously.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Contributions and feedback are more than welcome.

To get it running:
  1. Clone the project;
  2. `npm install`;
  3. `npm run build`.

## Credits

- [Evgenii Dobrovidov](https://github.com/mrnateriver);
- [Thomas Ghysels](https://github.com/thgh) for original implementation;
- [All Contributors](https://github.com/mrnateriver/rollup-plugin-livereload-universal/graphs/contributors).

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

[ReloadEmitter]: https://github.com/mrnateriver/rollup-plugin-livereload-universal/blob/master/src/reload-emitter.ts
[EventEmitter]: https://nodejs.org/api/events.html#events_class_eventemitter
[Verbosity]: https://github.com/mrnateriver/rollup-plugin-livereload-universal/blob/master/src/options.ts
