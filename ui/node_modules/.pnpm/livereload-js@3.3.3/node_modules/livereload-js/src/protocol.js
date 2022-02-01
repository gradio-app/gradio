let PROTOCOL_6, PROTOCOL_7;
exports.PROTOCOL_6 = (PROTOCOL_6 = 'http://livereload.com/protocols/official-6');
exports.PROTOCOL_7 = (PROTOCOL_7 = 'http://livereload.com/protocols/official-7');

class ProtocolError {
  constructor (reason, data) {
    this.message = `LiveReload protocol error (${reason}) after receiving data: "${data}".`;
  }
};

class Parser {
  constructor (handlers) {
    this.handlers = handlers;
    this.reset();
  }

  reset () {
    this.protocol = null;
  }

  process (data) {
    try {
      let message;

      if (!this.protocol) {
        // eslint-disable-next-line prefer-regex-literals
        if (data.match(new RegExp('^!!ver:([\\d.]+)$'))) {
          this.protocol = 6;
        } else if ((message = this._parseMessage(data, ['hello']))) {
          if (!message.protocols.length) {
            throw new ProtocolError('no protocols specified in handshake message');
          } else if (Array.from(message.protocols).includes(PROTOCOL_7)) {
            this.protocol = 7;
          } else if (Array.from(message.protocols).includes(PROTOCOL_6)) {
            this.protocol = 6;
          } else {
            throw new ProtocolError('no supported protocols found');
          }
        }

        return this.handlers.connected(this.protocol);
      }

      if (this.protocol === 6) {
        message = JSON.parse(data);

        if (!message.length) {
          throw new ProtocolError('protocol 6 messages must be arrays');
        }

        const [command, options] = Array.from(message);

        if (command !== 'refresh') {
          throw new ProtocolError('unknown protocol 6 command');
        }

        return this.handlers.message({
          command: 'reload',
          path: options.path,
          liveCSS: options.apply_css_live != null ? options.apply_css_live : true
        });
      }

      message = this._parseMessage(data, ['reload', 'alert']);

      return this.handlers.message(message);
    } catch (e) {
      if (e instanceof ProtocolError) {
        return this.handlers.error(e);
      }

      throw e;
    }
  }

  _parseMessage (data, validCommands) {
    let message;

    try {
      message = JSON.parse(data);
    } catch (e) {
      throw new ProtocolError('unparsable JSON', data);
    }

    if (!message.command) {
      throw new ProtocolError('missing "command" key', data);
    }

    if (!validCommands.includes(message.command)) {
      throw new ProtocolError(`invalid command '${message.command}', only valid commands are: ${validCommands.join(', ')})`, data);
    }

    return message;
  }
};

exports.ProtocolError = ProtocolError;
exports.Parser = Parser;
