define([ 'config', 'q' ], function (config, Q) {
    var records = [ ];

    function record(name, data) {
        records.push([ Date.now(), name, data ]);
    }

    function recordStart(name, data) {
        records.push([ Date.now(), 'start:' + name, data ]);

        return {
            end: function end() {
                recordEnd(name, data);
            }
        };
    }

    function recordEnd(name, data) {
        records.push([ Date.now(), 'end:' + name, data ]);
    }

    function getSO() {
        return new sp.SharedObject(config.telemetry.sharedObjectName);
    }

    function getQueue() {
        var so = getSO();
        if (!so.data.queue) {
            so.data.queue = [ ];
        }
        return so.data.queue;
    }

    function flushQueue() {
        getSO().flush();
    }

    var pendingFlush = null;

    function flush() {
        var queue = getQueue();
        if (records.length) {
            queue.push(records.slice());
        }
        flushQueue();

        records.length = 0;

        function process() {
            var queue = getQueue();
            if (!queue.length) {
                // No data to send
                return;
            }

            // TODO Chunk reporting in case it's too large (4K limit?)

            var reports = queue.slice();
            console.log('TELEMETRY', JSON.stringify(reports).length, reports);

            var req = new sp.URLRequest(config.telemetry.url);
            req.method = 'POST';
            req.data = JSON.stringify(reports);

            var loader = new sp.URLLoader();
            loader.load(req);

            var defer = Q.defer();

            function success(event) {
                try {
                    // Remove reports from queue
                    var queue = getQueue();
                    reports.forEach(function (report) {
                        var index = queue.indexOf(report);
                        if (index >= 0) {
                            queue.splice(index, 1);
                        }
                    });
                    flushQueue();
                } finally {
                    defer.resolve(null);
                }
            }

            function failure(event) {
                defer.reject(new Error(event.text));
            }

            loader.addEventListener(sp.Event.COMPLETE, success);
            loader.addEventListener(sp.IOErrorEvent.IO_ERROR, failure);
            //loader.addEventListener(sp.SecurityErrorEvent.SECURITY_ERROR, failure);

            Q.when(defer.promise, loader.destroy.bind(), loader.destroy.bind());
            return defer.promise;
        }

        pendingFlush = Q.when(pendingFlush, process, process);
        return pendingFlush;
    }

    return {
        record: record,
        recordStart: recordStart,
        recordEnd: recordEnd,
        flush: flush
    };
});
