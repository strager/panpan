var PORT = 3080;

function getRequestAddress(req) {
    var addr = req.connection.remoteAddress;
    if (/^127\.0\.0\.[0-9]{1,3}$/.test(addr)) {
        // If this is a local IP, X-Real-IP *may* contain the
        // proxied origin IP address
        addr = req.headers['x-real-ip'] || addr;
    }

    return addr;
}

var express = require('express');
var app = express.createServer();

app.configure(function () {
    app.use(express.logger());
    app.use(express.static(__dirname + '/pub'));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.post('/log', function _log(req, res, next) {
    var date = Date.now();

    var jsonData = '';
    req.on('data', function (data) {
        jsonData += data.toString('utf8');
    });

    req.on('end', function () {
        var userData;
        try {
            userData = JSON.parse(jsonData);
        } catch (e) {
            next(e);
            return;
        }

        var data = {
            date: date,
            ip: getRequestAddress(req),
            userData: userData
        };

        // TODO Send to database

        // Mark data so we can grep logs for them later
        // and stick them in a database
        console.log('>> ' + JSON.stringify(data));

        res.end();
    });
});

app.listen(PORT);
console.log("Listening on :" + PORT);
