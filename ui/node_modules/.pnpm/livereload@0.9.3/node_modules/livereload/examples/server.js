const LiveReload = require('../lib/livereload');

const extensionsToWatch = [
  'md',
  'text'
];

const liveReloadServer = LiveReload.createServer({
  port: 35729,
  debug: true,
  exts: extensionsToWatch
});

// Listen for errors
/*
liveReloadServer.on('error', (err) => {
  if(err.code == "EADDRINUSE") {
    console.log("The port LiveReload wants to use is used by something else.");
    process.exit(1);
  }
});
*/

liveReloadServer.watch(__dirname);
