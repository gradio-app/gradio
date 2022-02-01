<div align="center">
  <img src="https://github.com/lukeed/sirv/raw/master/sirv-cli.png" alt="sirv-cli" width="350" />
</div>

<h1 align="center">sirv-cli</h1>

<div align="center">
  <a href="https://npmjs.org/package/sirv-cli">
    <img src="https://img.shields.io/npm/v/sirv-cli.svg" alt="version" />
  </a>
  <a href="https://github.com/lukeed/sirv/actions?query=workflow%3ACI+branch%3Anext">
    <img src="https://github.com/lukeed/sirv/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://npmjs.org/package/sirv-cli">
    <img src="https://img.shields.io/npm/dm/sirv-cli.svg" alt="downloads" />
  </a>
</div>

<div align="center">A lightweight CLI program to serve static sites~!</div>

<br />

Quickly start a server to preview the assets of _any_ directory!


## Install

```
$ npm install --save sirv-cli
```

> **Note:** This module can also be installed and used globally~!

## Usage

> **Important:** The `HOST` and `PORT` environment variables will override the `--host` and `--port` flags, respectively.

```
$ sirv --help

  Description
    Run a static file server

  Usage
    $ sirv [dir] [options]

  Options
    -D, --dev          Enable "dev" mode
    -e, --etag         Enable "ETag" header
    -d, --dotfiles     Enable dotfile asset requests
    -c, --cors         Enable "CORS" headers to allow any origin requestor
    -G, --gzip         Send precompiled "*.gz" files when "gzip" is supported  (default true)
    -B, --brotli       Send precompiled "*.br" files when "brotli" is supported  (default true)
    -m, --maxage       Enable "Cache-Control" header & define its "max-age" value (sec)
    -i, --immutable    Enable the "immutable" directive for "Cache-Control" header
    -k, --http2        Enable the HTTP/2 protocol. Requires Node.js 8.4.0+
    -C, --cert         Path to certificate file for HTTP/2 server
    -K, --key          Path to certificate key for HTTP/2 server
    -P, --pass         Passphrase to decrypt a certificate key
    -s, --single       Serve as single-page application with "index.html" fallback
    -I, --ignores      Any URL pattern(s) to ignore "index.html" assumptions
    -q, --quiet        Disable logging to terminal
    -H, --host         Hostname to bind  (default localhost)
    -p, --port         Port to bind  (default 5000)
    -v, --version      Displays current version
    -h, --help         Displays this message

  Examples
    $ sirv build --cors --port 8080
    $ sirv public --quiet --etag --maxage 31536000 --immutable
    $ sirv public --http2 --key priv.pem --cert cert.pem
    $ sirv public -qeim 31536000
    $ sirv --port 8080 --etag
    $ sirv --host --dev

```

## Network Access

For security reasons, `sirv-cli` **does not** expose your server to the network by default.
This means that your machine, _and only your machine_, will be able to access the `localhost` server.

If, however, your coworker wants to access the server from their computer, or you want to preview your work on a mobile device, you must use the `--host` flag. Only _then_ will your server be accessible to other devices on the same network.

Using `--host` without a value is equivalent to `--host 0.0.0.0`, which is makes it discoverable publicly. You may customize this by passing a different value – but you probably don't need to!

> **Important:** Only the `Network:` address is accessible to others. The `Local:` address is still private to you.


## HTTP/2

> **Note:** Requires Node.js v8.4.0 or later.

The `--key` and `--cert` flags are required since no browsers support [unencrypted HTTP/2](https://http2.github.io/faq/#does-http2-require-encryption).<br>These must be valid file paths (resolved from `process.cwd()`), which are read and passed into [`http2.createSecureServer`](https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler).

You can generate a certificate and key for local development quickly with:

```sh
$ openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-key.pem -out localhost-cert.pem

# Now we can run a HTTP/2 server
$ sirv --http2 --key localhost-key.pem --cert localhost-cert.pem
```

To bypass the "third party verification" error page, you may use [`mkcert`](https://github.com/FiloSottile/mkcert) to generate a locally-trusted development certificate:

```sh
$ mkcert -install
$ mkcert -key-file localhost-key.pem -cert-file localhost-cert.pem localhost 127.0.0.1

# Now we can run a HTTP/2 server with verified SSL
$ sirv --http2 --key localhost-key.pem --cert localhost-cert.pem
```


## Single Page Applications

You must pass the `--single` flag to enable single-page application ("SPA") mode. This will, for example, serve your directory's `index.html` file when an unknown _path_ (eg; `/foo/bar`) does not resolve to another page.

> **Note:** Please refer to [`opts.single`](https://github.com/lukeed/sirv/tree/master/packages/sirv#optssingle) for the lookup sequence.

Any asset requests (URLs that end with an extension) ignore `--single` behavior and will send a `404` response instead of the "index.html" fallback. To ignore additional paths, pass URL patterns to the `--ignores` argument.

```sh
# Don't include "/blog*" or "/portfolio*" pages into SPA
$ sirv public --single --ignores "^/blog" --ignores "^/portfolio"
```

You may pass a string to customize which file should be sent as fallback.<br>In other words, `--single shell.html` will send the directory's `shell.html` file instead of its `index.html` file.


## Production

When using `sirv-cli` for production file-serving, you should:

1) Ensure `--dev` is not used
2) Enable HTTP/2 (`--http2`) with valid key and cert
3) Precompile brotli and/or gzip file variants
4) Enable `--gzip` and/or `--brotli` flags

For maximum performance, you should also use `--quiet` to disable the I/O from logging.

> **Notice:**<br>
While `sirv-cli` is certainly "production ready", using a CDN in production is always recommended.<br>
Especially when performance is a concern, there are much better solutions than using Node.js as a file server.<br>
Most everything has HTTP/2 and "SPA" support nowadays – consider NGINX or [h2o](https://h2o.examp1e.net/).

## License

MIT © [Luke Edwards](https://lukeed.com)
