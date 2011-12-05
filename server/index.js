var PORT = 3080;

var express = require('express');
var app = express.createServer();

app.configure(function () {
    app.use(express.logger());
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

        // TODO Send to database
        console.log({
            date: date,
            ip: req.connection.remoteAddress,
            userData: userData
        });
        res.end();
    });
});

app.listen(PORT);
console.log("Listening on :" + PORT);
