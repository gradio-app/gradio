const { Parser, PROTOCOL_6, PROTOCOL_7 } = require('./protocol');

const VERSION = process.env.npm_package_version;

class Connector {
  constructor (options, WebSocket, Timer, handlers) {
    this.options = options;
    this.WebSocket = WebSocket;
    this.Timer = Timer;
    this.handlers = handlers;
    const path = this.options.path ? `${this.options.path}` : 'livereload';
    this._uri = `ws${this.options.https ? 's' : ''}://${this.options.host}:${this.options.port}/${path}`;

    this._nextDelay = this.options.mindelay;
    this._connectionDesired = false;
    this.protocol = 0;

    this.protocolParser = new Parser({
      connected: protocol => {
        this.protocol = protocol;
        this._handshakeTimeout.stop();
        this._nextDelay = this.options.mindelay;
        this._disconnectionReason = 'broken';

        return this.handlers.connected(this.protocol);
      },
      error: e => {
        this.handlers.error(e);

        return this._closeOnError();
      },
      message: message => {
        return this.handlers.message(message);
      }
    });

    this._handshakeTimeout = new this.Timer(() => {
      if (!this._isSocketConnected()) {
        return;
      }

      this._disconnectionReason = 'handshake-timeout';

      return this.socket.close();
    });

    this._reconnectTimer = new this.Timer(() => {
      if (!this._connectionDesired) {
        // shouldn't hit this, but just in case
        return;
      }

      return this.connect();
    });

    this.connect();
  }

  _isSocketConnected () {
    return this.socket && (this.socket.readyState === this.WebSocket.OPEN);
  }

  connect () {
    this._connectionDesired = true;

    if (this._isSocketConnected()) {
      return;
    }

    // prepare for a new connection
    this._reconnectTimer.stop();
    this._disconnectionReason = 'cannot-connect';
    this.protocolParser.reset();

    this.handlers.connecting();

    this.socket = new this.WebSocket(this._uri);
    this.socket.onopen = e => this._onopen(e);
    this.socket.onclose = e => this._onclose(e);
    this.socket.onmessage = e => this._onmessage(e);
    this.socket.onerror = e => this._onerror(e);
  }

  disconnect () {
    this._connectionDesired = false;
    this._reconnectTimer.stop(); // in case it was running

    if (!this._isSocketConnected()) {
      return;
    }

    this._disconnectionReason = 'manual';

    return this.socket.close();
  }

  _scheduleReconnection () {
    if (!this._connectionDesired) {
      // don't reconnect after manual disconnection
      return;
    }

    if (!this._reconnectTimer.running) {
      this._reconnectTimer.start(this._nextDelay);
      this._nextDelay = Math.min(this.options.maxdelay, this._nextDelay * 2);
    }
  }

  sendCommand (command) {
    if (!this.protocol) {
      return;
    }

    return this._sendCommand(command);
  }

  _sendCommand (command) {
    return this.socket.send(JSON.stringify(command));
  }

  _closeOnError () {
    this._handshakeTimeout.stop();
    this._disconnectionReason = 'error';

    return this.socket.close();
  }

  _onopen (e) {
    this.handlers.socketConnected();
    this._disconnectionReason = 'handshake-failed';

    // start handshake
    const hello = { command: 'hello', protocols: [PROTOCOL_6, PROTOCOL_7] };

    hello.ver = VERSION;

    if (this.options.ext) {
      hello.ext = this.options.ext;
    }

    if (this.options.extver) {
      hello.extver = this.options.extver;
    }

    if (this.options.snipver) {
      hello.snipver = this.options.snipver;
    }

    this._sendCommand(hello);

    return this._handshakeTimeout.start(this.options.handshake_timeout);
  }

  _onclose (e) {
    this.protocol = 0;
    this.handlers.disconnected(this._disconnectionReason, this._nextDelay);

    return this._scheduleReconnection();
  }

  _onerror (e) {}

  _onmessage (e) {
    return this.protocolParser.process(e.data);
  }
};

exports.Connector = Connector;
