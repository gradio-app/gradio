fs   = require 'fs'
path = require 'path'
ws   = require 'ws'
http  = require 'http'
https = require 'https'
url = require 'url'
chokidar = require 'chokidar'
EventEmitter = require('events')

protocol_version = '7'
defaultPort = 35729

defaultExts = [
  'html', 'css', 'js', 'png', 'gif', 'jpg',
  'php', 'php5', 'py', 'rb', 'erb', 'coffee'
]

defaultExclusions = [/\.git\//, /\.svn\//, /\.hg\//]

# Server accepts a Configuration object to configure the server.
#
# `version`: The protocol version to use.
# `port`: the LiveReload listen port
# `exts`: the extensions to watch. An array of extensions.
# `extraExts`: extensions in addition to the default extensions
# `exclusions`: array of regex patterns to exclude. Default is [/\.git\//, /\.svn\//, /\.hg\//]
# `filesToReload`: array of files that, when changed, should force the browser to reload
# `applyCSSLive`: should the css apply live? Default is true
# `originalPath`: the original path. Useful for proxy
# `usePolling`: Should we use polling instead of a file watcher? defaults to false.
# `delay`: seconds to wait
# `debug`: display debug mesages to stdout. Default is false
#
class Server extends EventEmitter
  constructor: (@config) ->
    @config ?= {}

    @config.version ?= protocol_version
    @config.port    ?= defaultPort

    @config.exts       ?= []
    @config.extraExts  ?= []
    @config.exclusions ?= []
    @config.filesToReload ?= []

    if @config.exts.length == 0
      @config.exts = defaultExts

    if @config.extraExts.length > 0
      @config.exts = @config.extraExts.concat defaultExts

    @config.exclusions = @config.exclusions.concat defaultExclusions

    @config.applyCSSLive ?= true

    @config.originalPath ?= ''
    @config.overrideURL ?= ''

    @config.usePolling ?= false

  listen: (callback) ->
    @debug "LiveReload is waiting for a browser to connect..."
    @debug """
      Protocol version: #{@config.version}
      Exclusions: #{@config.exclusions}
      Extensions: #{@config.exts}
      Polling: #{@config.usePolling}

    """

    if @config.server
      @config.server.listen @config.port
      @server = new ws.Server({server: @config.server})
    else
      @server = new ws.Server({port: @config.port})

    @server.on 'connection', @onConnection.bind @
    @server.on 'close',      @onClose.bind @
    @server.on 'error',      @onError.bind @

    if callback
      @server.once 'listening', callback

  # Bubble up the connection error to the parent process
  # Subscribe with server.on "error"
  onError: (err) ->
      @debug "Error #{err}"
      @emit "error", err

  onConnection: (socket) ->
    @debug "Browser connected."

    # Client sends various messages under the key 'command'
    #
    # 'hello': the handshake. Must reply with 'hello'
    # 'info' : info about the client script and any plugins it has enabled
    #
    socket.on 'message', (message) =>
      @debug "Client message: #{message}"

      request = JSON.parse(message)

      if request.command == "hello"
        @debug "Client requested handshake..."
        @debug "Handshaking with client using protocol #{@config.version}..."

        data = JSON.stringify {
          command: 'hello',
          protocols: [
              'http://livereload.com/protocols/official-7',
              'http://livereload.com/protocols/official-8',
              'http://livereload.com/protocols/official-9',
              'http://livereload.com/protocols/2.x-origin-version-negotiation',
              'http://livereload.com/protocols/2.x-remote-control'],
          serverName: 'node-livereload'
        }

        socket.send data

      # info messages are messages about the features the client server has, like
      # plugins. We don't support these but in debug mode we should at least
      # acknowledge them in the console for debugging purposes
      if request.command == "info"
        @debug "Server received client data. Not sending response."


    # handle error events from socket
    socket.on 'error', (err) =>
      @debug "Error in client socket: #{err}"

    socket.on 'close', (message) =>
      @debug "Client closed connection"


  onClose: (socket) ->
    @debug "Socket closed."

  watch: (paths) ->
    @debug "Watching #{paths}..."
    @watcher = chokidar.watch(paths,
      ignoreInitial: true
      ignored: @config.exclusions
      usePolling: @config.usePolling
    )
    .on 'add', @filterRefresh.bind(@)
    .on 'change', @filterRefresh.bind(@)
    .on 'unlink', @filterRefresh.bind(@)

  # Determine whether or not the file should trigger a reload.
  # Only reload if the changed file is in the list of extensions,
  # or if it's in the list of explicit file names.
  filterRefresh: (filepath) ->

    refresh = false
    @debug "Saw change to #{filepath}"

    # get just the extension         without the .
    fileext = path.extname(filepath).substring(1)

    # get the filename from the path
    filename = path.basename(filepath)

    # check if file extension is supposed to be watched
    if (@config.exts.indexOf(fileext) != -1)
      refresh = true

    # check to see if the file is explicitly listed
    if (@config.filesToReload.indexOf(filename) != -1)
      refresh = true

    if refresh
      if @config.delay
        delayedRefresh = setTimeout(
          =>
            clearTimeout(delayedRefresh)
            @refresh filepath
          @config.delay
        )
      else
        @refresh filepath

  refresh: (filepath) ->
    @debug "Reloading: #{filepath}"
    data = JSON.stringify {
      command: 'reload',
      path: filepath,
      liveCSS: @config.applyCSSLive,
      liveImg: @config.applyImgLive,
      originalPath: this.config.originalPath,
      overrideURL: this.config.overrideURL
    }
    @sendAllClients data

  alert: (message) ->
    @debug "Alert: #{message}"
    data = JSON.stringify {
      command: 'alert',
      message: message
    }
    @sendAllClients data

  sendAllClients: (data) ->
    @server.clients.forEach (socket) =>
      @debug "broadcasting to all clients: #{data}"
      socket.send data, (error) =>
        if error
          @debug error

  debug: (str) ->
    if @config.debug
      console.log "#{str}\n"

  close: ->
    if @watcher
      @watcher.close()
    # ensure ws server is closed
    @server._server.close()
    @server.close()

exports.createServer = (config = {}, callback) ->
  requestHandler = ( req, res )->
    if url.parse(req.url).pathname is '/livereload.js'
      res.writeHead(200, {'Content-Type': 'text/javascript'})
      res.end fs.readFileSync require.resolve 'livereload-js'
  if !config.https?
    app = http.createServer requestHandler
  else
    app = https.createServer config.https, requestHandler

  config.server ?= app

  server = new Server config

  unless config.noListen
    server.listen(callback)
  server
