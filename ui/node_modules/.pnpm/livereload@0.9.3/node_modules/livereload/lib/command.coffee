runner = ->
  pjson      = require('../package.json')
  version    = pjson.version
  livereload = require './livereload'
  resolve    = require('path').resolve
  opts       = require 'opts'
  debug      = false;

  args = [
    {
      name     : 'path'
      required : false
    }
  ]

  options = [
    {
      short: "v"
      long:  "version"
      description: "Show the version"
      required: false
      callback: ->
        console.log version
        process.exit(1)
    }
    {
      short: "p"
      long:  "port"
      description: "Specify the port the server should listen on."
      value: true
      required: false
    }
    {
      short: "x"
      long: "exclusions"
      description: "Exclude files from being watched by specifying an array of regular expressions. Will be appended to default value which is [/\.git\//, /\.svn\//, /\.hg\//]",
      required: false,
      value: true
    }
    {
      short: "d"
      long: "debug"
      description: "See helpful debugging information",
      required: false,
      callback: -> debug = true
    }
    {
      short: "e"
      long: "exts",
      description: "A comma-separated list of extensions that should trigger a reload when changed. Replaces default extentions",
      required: false,
      value: true
    }
    {
      short: "ee"
      long: "extraExts",
      description: "A comma-separated list of extensions that should trigger a reload when changed, in addition to the defaults (html, css, js, png, gif, jpg, php, php5, py, rb, erb, coffee). If used with --exts, this overrides --exts.",
      required: false,
      value: true
    }
    {
      short: "f"
      long: "filesToReload",
      description: "A comma-separated list of filenames that should trigger a reload when changed.",
      required: false,
      value: true
    }
    {
      short: "u"
      long: "usepolling"
      description: "Poll for file system changes. Set this to true to successfully watch files over a network.",
      required: false,
      value: true
    }
    {
      short: "w"
      long: "wait"
      description: "Delay message of file system changes to browser by `delay` milliseconds"
      required: false
      value: true
    }
    {
      short: "op"
      long: "originalpath",
      description: "Set a URL you use for development, e.g 'http:/domain.com', then LiveReload will proxy this url to local path."
      required: false,
      value: true
    }
  ]

  opts.parse(options.reverse(), args,  true)

  path = (opts.arg('path') || '.')
    .split(/\s*,\s*/)
    .map((x)->resolve(x))

  port = opts.get('port') || 35729
  exclusions = if opts.get('exclusions') then opts.get('exclusions' ).split(',' ).map((s) -> new RegExp(s)) else []
  exts = if opts.get('exts') then opts.get('exts').split(',').map((ext) -> ext.trim()) else  []
  extraExts = if opts.get('extraExts') then opts.get('extraExts').split(',').map((ext) -> ext.trim()) else  []
  filesToReload = if opts.get('filesToReload') then opts.get('filesToReload').split(',').map((file) -> file.trim()) else  []
  usePolling = opts.get('usepolling') || false
  wait = opts.get('wait') || 0
  originalPath = opts.get('originalPath') || ''

  server = livereload.createServer({
    port: port
    debug: debug
    exclusions: exclusions,
    exts: exts
    extraExts: extraExts
    usePolling: usePolling
    filesToReload: filesToReload
    delay: wait
    originalPath: originalPath
  })

  console.log "Starting LiveReload v#{version} for #{path} on port #{port}."

  server.on 'error', (err) ->
    if err.code == "EADDRINUSE"
      console.log("The port LiveReload wants to use is used by something else.")
    else
      throw err
    process.exit(1)

  server.watch(path)

module.exports =
  run: runner
