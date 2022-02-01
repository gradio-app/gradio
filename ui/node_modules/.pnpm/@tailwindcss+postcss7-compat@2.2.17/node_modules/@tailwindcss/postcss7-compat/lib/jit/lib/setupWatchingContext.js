"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setupWatchingContext;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _tmp = _interopRequireDefault(require("tmp"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _quickLru = _interopRequireDefault(require("quick-lru"));

var _normalizePath = _interopRequireDefault(require("normalize-path"));

var _hashConfig = _interopRequireDefault(require("../../util/hashConfig"));

var _log = _interopRequireDefault(require("../../util/log"));

var _getModuleDependencies = _interopRequireDefault(require("../../lib/getModuleDependencies"));

var _resolveConfig = _interopRequireDefault(require("../../../resolveConfig"));

var _resolveConfigPath = _interopRequireDefault(require("../../util/resolveConfigPath"));

var _setupContextUtils = require("./setupContextUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is used to trigger rebuilds. Just updating the timestamp
// is significantly faster than actually writing to the file (10x).
function touch(filename) {
  let time = new Date();

  try {
    _fs.default.utimesSync(filename, time, time);
  } catch (err) {
    _fs.default.closeSync(_fs.default.openSync(filename, 'w'));
  }
}

let watchers = new WeakMap();

function getWatcher(context) {
  if (watchers.has(context)) {
    return watchers.get(context);
  }

  return null;
}

function setWatcher(context, watcher) {
  return watchers.set(context, watcher);
}

let touchFiles = new WeakMap();

function getTouchFile(context) {
  if (touchFiles.has(context)) {
    return touchFiles.get(context);
  }

  return null;
}

function setTouchFile(context, touchFile) {
  return touchFiles.set(context, touchFile);
}

let configPaths = new WeakMap();

function getConfigPath(context, configOrPath) {
  if (!configPaths.has(context)) {
    configPaths.set(context, (0, _resolveConfigPath.default)(configOrPath));
  }

  return configPaths.get(context);
}

function rebootWatcher(context, configPath, configDependencies, candidateFiles) {
  let touchFile = getTouchFile(context);

  if (touchFile === null) {
    touchFile = _tmp.default.fileSync().name;
    setTouchFile(context, touchFile);
    touch(touchFile);
  }

  let watcher = getWatcher(context);
  Promise.resolve(watcher ? watcher.close() : null).then(() => {
    _log.default.info(['Tailwind CSS is watching for changes...', 'https://tailwindcss.com/docs/just-in-time-mode#watch-mode-and-one-off-builds']);

    watcher = _chokidar.default.watch([...candidateFiles, ...configDependencies], {
      ignoreInitial: true,
      awaitWriteFinish: process.platform === 'win32' ? {
        stabilityThreshold: 50,
        pollInterval: 10
      } : false
    });
    setWatcher(context, watcher);
    watcher.on('add', file => {
      let changedFile = _path.default.resolve('.', file);

      let content = _fs.default.readFileSync(changedFile, 'utf8');

      let extension = _path.default.extname(changedFile).slice(1);

      context.changedContent.push({
        content,
        extension
      });
      touch(touchFile);
    });
    watcher.on('change', file => {
      // If it was a config dependency, touch the config file to trigger a new context.
      // This is not really that clean of a solution but it's the fastest, because we
      // can do a very quick check on each build to see if the config has changed instead
      // of having to get all of the module dependencies and check every timestamp each
      // time.
      if (configDependencies.has(file)) {
        for (let dependency of configDependencies) {
          delete require.cache[require.resolve(dependency)];
        }

        touch(configPath);
      } else {
        let changedFile = _path.default.resolve('.', file);

        let content = _fs.default.readFileSync(changedFile, 'utf8');

        let extension = _path.default.extname(changedFile).slice(1);

        context.changedContent.push({
          content,
          extension
        });
        touch(touchFile);
      }
    });
    watcher.on('unlink', file => {
      // Touch the config file if any of the dependencies are deleted.
      if (configDependencies.has(file)) {
        for (let dependency of configDependencies) {
          delete require.cache[require.resolve(dependency)];
        }

        touch(configPath);
      }
    });
  });
}

let configPathCache = new _quickLru.default({
  maxSize: 100
});
let configDependenciesCache = new WeakMap();

function getConfigDependencies(context) {
  if (!configDependenciesCache.has(context)) {
    configDependenciesCache.set(context, new Set());
  }

  return configDependenciesCache.get(context);
}

let candidateFilesCache = new WeakMap();

function getCandidateFiles(context, tailwindConfig) {
  if (candidateFilesCache.has(context)) {
    return candidateFilesCache.get(context);
  }

  let purgeContent = Array.isArray(tailwindConfig.purge) ? tailwindConfig.purge : tailwindConfig.purge.content;
  let candidateFiles = purgeContent.filter(item => typeof item === 'string').map(purgePath => (0, _normalizePath.default)(_path.default.resolve(purgePath)));
  return candidateFilesCache.set(context, candidateFiles).get(context);
} // Get the config object based on a path


function getTailwindConfig(configOrPath) {
  let userConfigPath = (0, _resolveConfigPath.default)(configOrPath);

  if (userConfigPath !== null) {
    let [prevConfig, prevModified = -Infinity, prevConfigHash] = configPathCache.get(userConfigPath) || [];

    let modified = _fs.default.statSync(userConfigPath).mtimeMs; // It hasn't changed (based on timestamp)


    if (modified <= prevModified) {
      return [prevConfig, userConfigPath, prevConfigHash, [userConfigPath]];
    } // It has changed (based on timestamp), or first run


    delete require.cache[userConfigPath];
    let newConfig = (0, _resolveConfig.default)(require(userConfigPath));
    let newHash = (0, _hashConfig.default)(newConfig);
    configPathCache.set(userConfigPath, [newConfig, modified, newHash]);
    return [newConfig, userConfigPath, newHash, [userConfigPath]];
  } // It's a plain object, not a path


  let newConfig = (0, _resolveConfig.default)(configOrPath.config === undefined ? configOrPath : configOrPath.config);
  return [newConfig, null, (0, _hashConfig.default)(newConfig), []];
}

function resolvedChangedContent(context, candidateFiles) {
  var _context$tailwindConf, _context$tailwindConf2;

  let changedContent = (Array.isArray(context.tailwindConfig.purge) ? context.tailwindConfig.purge : context.tailwindConfig.purge.content).filter(item => typeof item.raw === 'string').concat(((_context$tailwindConf = (_context$tailwindConf2 = context.tailwindConfig.purge) === null || _context$tailwindConf2 === void 0 ? void 0 : _context$tailwindConf2.safelist) !== null && _context$tailwindConf !== void 0 ? _context$tailwindConf : []).map(content => {
    if (typeof content === 'string') {
      return {
        raw: content,
        extension: 'html'
      };
    }

    if (content instanceof RegExp) {
      throw new Error("Values inside 'purge.safelist' can only be of type 'string', found 'regex'.");
    }

    throw new Error(`Values inside 'purge.safelist' can only be of type 'string', found '${typeof content}'.`);
  })).map(({
    raw,
    extension
  }) => ({
    content: raw,
    extension
  }));

  for (let changedFile of resolveChangedFiles(context, candidateFiles)) {
    let content = _fs.default.readFileSync(changedFile, 'utf8');

    let extension = _path.default.extname(changedFile).slice(1);

    changedContent.push({
      content,
      extension
    });
  }

  return changedContent;
}

let scannedContentCache = new WeakMap();

function resolveChangedFiles(context, candidateFiles) {
  let changedFiles = new Set(); // If we're not set up and watching files ourselves, we need to do
  // the work of grabbing all of the template files for candidate
  // detection.

  if (!scannedContentCache.has(context)) {
    let files = _fastGlob.default.sync(candidateFiles);

    for (let file of files) {
      changedFiles.add(file);
    }

    scannedContentCache.set(context, true);
  }

  return changedFiles;
} // DISABLE_TOUCH = FALSE
// Retrieve an existing context from cache if possible (since contexts are unique per
// source path), or set up a new one (including setting up watchers and registering
// plugins) then return it


function setupWatchingContext(configOrPath) {
  return ({
    tailwindDirectives,
    registerDependency
  }) => {
    return (root, result) => {
      let [tailwindConfig, userConfigPath, tailwindConfigHash, configDependencies] = getTailwindConfig(configOrPath);
      let contextDependencies = new Set(configDependencies); // If there are no @tailwind rules, we don't consider this CSS file or it's dependencies
      // to be dependencies of the context. Can reuse the context even if they change.
      // We may want to think about `@layer` being part of this trigger too, but it's tough
      // because it's impossible for a layer in one file to end up in the actual @tailwind rule
      // in another file since independent sources are effectively isolated.

      if (tailwindDirectives.size > 0) {
        // Add current css file as a context dependencies.
        contextDependencies.add(result.opts.from); // Add all css @import dependencies as context dependencies.

        for (let message of result.messages) {
          if (message.type === 'dependency') {
            contextDependencies.add(message.file);
          }
        }
      }

      let [context, isNewContext] = (0, _setupContextUtils.getContext)(tailwindDirectives, root, result, tailwindConfig, userConfigPath, tailwindConfigHash, contextDependencies);
      let candidateFiles = getCandidateFiles(context, tailwindConfig);
      let contextConfigDependencies = getConfigDependencies(context);

      for (let file of configDependencies) {
        registerDependency({
          type: 'dependency',
          file
        });
      }

      context.disposables.push(oldContext => {
        let watcher = getWatcher(oldContext);

        if (watcher !== null) {
          watcher.close();
        }
      });
      let configPath = getConfigPath(context, configOrPath);

      if (configPath !== null) {
        for (let dependency of (0, _getModuleDependencies.default)(configPath)) {
          if (dependency.file === configPath) {
            continue;
          }

          contextConfigDependencies.add(dependency.file);
        }
      }

      if (isNewContext) {
        rebootWatcher(context, configPath, contextConfigDependencies, candidateFiles);
      } // Register our temp file as a dependency ‚Äî we write to this file
      // to trigger rebuilds.


      let touchFile = getTouchFile(context);

      if (touchFile) {
        registerDependency({
          type: 'dependency',
          file: touchFile
        });
      }

      if (tailwindDirectives.size > 0) {
        for (let changedContent of resolvedChangedContent(context, candidateFiles)) {
          context.changedContent.push(changedContent);
        }
      }

      return context;
    };
  };
}