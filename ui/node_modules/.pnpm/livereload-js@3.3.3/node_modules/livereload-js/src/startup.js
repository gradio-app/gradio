const CustomEvents = require('./customevents');
const LiveReload = (window.LiveReload = new (require('./livereload').LiveReload)(window));

for (const k in window) {
  if (k.match(/^LiveReloadPlugin/)) {
    LiveReload.addPlugin(window[k]);
  }
}

LiveReload.addPlugin(require('./less'));

LiveReload.on('shutdown', () => delete window.LiveReload);
LiveReload.on('connect', () => CustomEvents.fire(document, 'LiveReloadConnect'));
LiveReload.on('disconnect', () => CustomEvents.fire(document, 'LiveReloadDisconnect'));

CustomEvents.bind(document, 'LiveReloadShutDown', () => LiveReload.shutDown());
