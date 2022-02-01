#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// serving script file
app.use(serveStatic(__dirname + '/public', {
    maxAge: '1d'
}))

// serving script file
app.get('/code-snippet.js', function(req, res) {
    fs.createReadStream('../../code-snippet.js').pipe(res);
});

// post target
app.post('/target', function(req, res) {
    res.send('data received: ' + JSON.stringify(req.body));
});

app.listen(3000);
