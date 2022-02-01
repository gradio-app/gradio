livereload = require '../lib/livereload'
should = require 'should'
request = require 'request'
http = require 'http'
url = require 'url'
fs = require 'fs'
path = require 'path'
WebSocket = require 'ws'
sinon = require 'sinon'

describe 'livereload config', ->

  it 'should remove default exts when provided new exts', (done) ->
    server = livereload.createServer({ port: 35729, exts: ["html"]}, ->
      server.close()
      done()
    )
    server.config.exts.should.eql(["html"])

  it 'should incldue default exts when provided extraExts', (done) ->
    server = livereload.createServer({ port: 35729, extraExts: ["foobar"]}, ->
      server.close()
      done()
    )

    extensionsList = [
      'foobar',
      'html', 'css', 'js', 'png', 'gif', 'jpg',
      'php', 'php5', 'py', 'rb', 'erb', 'coffee'
    ]
    server.config.exts.should.eql(extensionsList)

  it 'extraExts must override exts if both are given', (done) ->
    server = livereload.createServer({ port: 35729, exts: ["md"], extraExts: ["foobar"]}, ->
      server.close()
      done()
    )

    extensionsList = [
      'foobar',
      'html', 'css', 'js', 'png', 'gif', 'jpg',
      'php', 'php5', 'py', 'rb', 'erb', 'coffee'
    ]
    server.config.exts.should.eql(extensionsList)

  it 'should support filesToReload', (done) ->
    server = livereload.createServer({ port: 35729, filesToReload: ["index.html"]}, ->
      server.close()
      done()
    )
    server.config.filesToReload.should.eql(["index.html"])

describe 'livereload http file serving', ->

  it 'should serve up livereload.js', (done) ->
    server = livereload.createServer({port: 35729})

    fileContents = fs.readFileSync('./node_modules/livereload-js/dist/livereload.js').toString()

    request 'http://localhost:35729/livereload.js?snipver=1', (error, response, body) ->
      should.not.exist error
      response.statusCode.should.equal 200
      fileContents.should.equal body

      server.config.server.close()

      done()

  it 'should connect to the websocket server', (done) ->
    server = livereload.createServer({port: 35729})

    ws = new WebSocket('ws://localhost:35729/livereload')

    ws.on 'open', () ->
      data = JSON.stringify {
        command: 'hello',
        protocols: [
            'http://livereload.com/protocols/official-7',
            'http://livereload.com/protocols/official-8',
            'http://livereload.com/protocols/2.x-origin-version-negotiation']
        }
      ws.send data
    ws.on 'message', (data, flags) ->
      console.log "hello"

      data.should.equal JSON.stringify {
          command: 'hello',
          protocols: [
              'http://livereload.com/protocols/official-7',
              'http://livereload.com/protocols/official-8',
              'http://livereload.com/protocols/official-9',
              'http://livereload.com/protocols/2.x-origin-version-negotiation',
              'http://livereload.com/protocols/2.x-remote-control'],
          serverName: 'node-livereload'

      }

      server.config.server.close()
      ws.close()
      done()

  it 'should allow you to override the internal http server', (done) ->
    app = http.createServer (req, res) ->
      if url.parse(req.url).pathname is '/livereload.js'
        res.writeHead(200, {'Content-Type': 'text/javascript'})
        res.end '// nothing to see here'

    server = livereload.createServer({port: 35729, server: app})

    request 'http://localhost:35729/livereload.js?snipver=1', (error, response, body) ->
      should.not.exist error
      response.statusCode.should.equal 200
      body.should.equal '// nothing to see here'

      server.config.server.close()

      done()

  it 'should allow you to specify ssl certificates to run via https', (done)->
    server = livereload.createServer
      port: 35729
      https:
        cert: fs.readFileSync path.join __dirname, 'ssl/localhost.cert'
        key: fs.readFileSync path.join __dirname, 'ssl/localhost.key'

    fileContents = fs.readFileSync('./node_modules/livereload-js/dist/livereload.js').toString()

    # allow us to use our self-signed cert for testing
    unsafeRequest = request.defaults
      strictSSL: false
      rejectUnauthorized: false

    unsafeRequest 'https://localhost:35729/livereload.js?snipver=1', (error, response, body) ->
      should.not.exist error
      response.statusCode.should.equal 200
      fileContents.should.equal body

      server.config.server.close()

      done()

  it 'should support passing a callback to the websocket server', (done) ->
    server = livereload.createServer {port: 35729}, ->
      server.config.server.close()
      done()

describe 'livereload server startup', ->
  server = undefined
  new_server = undefined
  beforeEach (done) ->
    server = livereload.createServer {port: 35729, debug: false}
    setTimeout(done, 2000)

  afterEach (done) ->
    server.close()
    new_server.close()
    server = undefined
    new_server = undefined
    done()

  it 'should gracefully handle something running on the same port', (done) ->
    new_server = livereload.createServer({debug: false, port: 35729})
    new_server.on 'error', (err) ->
      err.code.should.be.equal("EADDRINUSE")

    done()


describe 'livereload file watching', ->
  describe "file watching behavior", ->
    jsFile = cssFile = specificFile = extraFile = server = refresh = undefined

    beforeEach (done) ->
      jsFile = path.join(__dirname, "tmpfile.js")
      cssFile = path.join(__dirname, "tmpfile.css")
      specificFile = path.join(__dirname, "tmpfile")
      extraFile = path.join(__dirname, "tmpfile.ex")
      fs.writeFileSync(jsFile, "use strict;", "utf-8")
      fs.writeFileSync(cssFile, "/* some css */")
      fs.writeFileSync(specificFile, "watch me")
      # ample time for files to have been written in between tests
      setTimeout(done, 1000)


    afterEach (done) ->
      server.close()
      server = undefined
      # ample time for chokidar process to die in between tests
      setTimeout(done, 1000)

    after ->
      fs.unlinkSync(jsFile)
      fs.unlinkSync(cssFile)
      fs.unlinkSync(specificFile)
      fs.unlinkSync(extraFile)

    describe "with no extensions specified, so defaults are used", ->

      beforeEach (done) ->
        server = livereload.createServer({port: 22345})
        refresh = sinon.spy(server, "refresh")
        server.watch(__dirname)
        server.watcher.on('ready', done)

      it "reloads js file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(jsFile, "use strict; var a = 1;", "utf-8")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

      it "reloads css file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(cssFile, "")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

    describe "with default exts overridden", ->
      beforeEach (done) ->
        server = livereload.createServer({exts: ["js"], port: 22345})
        refresh = sinon.spy(server, "refresh")
        server.watch(__dirname)
        server.watcher.on('ready', done)

      it "reloads js file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(jsFile, "use strict; var a = 1;", "utf-8")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

      it "does not reload css file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(cssFile, "")

        setTimeout(->
          refresh.callCount.should.be.exactly(0)
          done()
        , 500)

    describe "with extraexts added", ->
      beforeEach (done) ->
        server = livereload.createServer({extraExts: ["ex"], port: 22345})
        refresh = sinon.spy(server, "refresh")
        server.watch(__dirname)
        server.watcher.on('ready', done)

      it "reloads the ex file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(extraFile, "use strict; var a = 1;", "utf-8")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

      it "still reloads js file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(jsFile, "use strict; var a = 1;", "utf-8")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

    describe "with filesToReload specified", ->
      beforeEach (done) ->
        server = livereload.createServer({filesToReload: ["tmpfile"], port: 22345})
        refresh = sinon.spy(server, "refresh")
        server.watch(__dirname)
        server.watcher.on('ready', done)

      it "reloads specific file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(specificFile, "testing")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

      it "still reloads js file", (done) ->
        refresh.callCount.should.be.exactly(0)
        fs.writeFileSync(jsFile, "use strict; var a = 1;", "utf-8")

        setTimeout(->
          refresh.callCount.should.be.exactly(1)
          done()
        , 500)

  # describe "config.delay", ->
    # tmpFile = tmpFile2 = clock = server = refresh = undefined

    # beforeEach (done) ->
      # tmpFile = path.join(__dirname, "tmpfile.js")
      # tmpFile2 = path.join(__dirname, "tmpfile2.js")
      # fs.writeFileSync(tmpFile, "use strict;", "utf-8")
      # fs.writeFileSync(tmpFile2, "use strict;", "utf-8")
      # # ample time for files to have been written in between tests
      # setTimeout(done, 1000)


    # afterEach (done) ->
      # server.close()
      # server = undefined
      # # ample time for chokidar process to die in between tests
      # setTimeout(done, 1000)

    # after ->
      # fs.unlinkSync(tmpFile)
      # fs.unlinkSync(tmpFile2)

      # it 'should send a refresh message near immediately if `config.delay` is falsey`', (done) ->
        # refresh.callCount.should.be.exactly(0)
        # fs.writeFileSync(tmpFile, "use strict; var a = 1;", "utf-8")

        # # still called after next tick, but without artificial delay
        # setTimeout(->
          # refresh.callCount.should.be.exactly(1)
          # done()
        # , 500)

    # describe 'when set', ->
      # beforeEach (done) ->
        # server = livereload.createServer({delay: 2000, port: 12345})
        # refresh = sinon.spy(server, "refresh")
        # server.watch(__dirname)
        # server.watcher.on('ready', done)

      # it 'should send a refresh message after `config.delay` milliseconds', (done) ->
        # refresh.callCount.should.be.exactly(0)
        # fs.writeFileSync(tmpFile, "use strict; var a = 1;", "utf-8")

        # # not called yet
        # setTimeout(->
          # refresh.callCount.should.be.exactly(0)
        # , 1500)

        # # called after set delay
        # setTimeout(->
          # refresh.callCount.should.be.exactly(1)
          # done()
        # , 3000)

      # it 'should only set the timeout/refresh for files that have been changed', (done) ->
        # refresh.callCount.should.be.exactly(0)
        # fs.writeFileSync(tmpFile2, "use strict; var a = 2;", "utf-8")

        # setTimeout(->
          # refresh.callCount.should.be.exactly(1)
          # done()
        # , 3000)

    # describe 'when not set or set to 0', ->
      # beforeEach (done) ->
        # server = livereload.createServer({delay: 0, port: 22345})
        # refresh = sinon.spy(server, "refresh")
        # server.watch(__dirname)
        # server.watcher.on('ready', done)

      # it 'should send a refresh message near immediately if `config.delay` is falsey`', (done) ->
        # refresh.callCount.should.be.exactly(0)
        # fs.writeFileSync(tmpFile, "use strict; var a = 1;", "utf-8")

        # # still called after next tick, but without artificial delay
        # setTimeout(->
          # refresh.callCount.should.be.exactly(1)
          # done()
        # , 500)


  it 'should correctly ignore common exclusions', ->
    # TODO check it ignores common exclusions

  it 'should not exclude a dir named git', ->
    # cf. issue #20
