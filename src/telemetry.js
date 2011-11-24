define([ ], function () {
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

    function flush() {
        if (!records.length) {
            return;
        }

        // TODO Actual communication with server
        console.log("Telemetry report from " + Date.now() + ":", records.slice());
        records.length = 0;
    }

    return {
        record: record,
        recordStart: recordStart,
        recordEnd: recordEnd,
        flush: flush
    };
});
