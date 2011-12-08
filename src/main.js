define([ 'asset', 'game', 'telemetry', 'q', 'session' ], function (asset, game, telemetry, Q, session) {
    function main(stage) {
        telemetry.record('session_info', session.getSessionInformation());

        stage.frameRate = 60;

        function flushTelemetryLoop() {
            Q.when(telemetry.flush(), function () {
                setTimeout(flushTelemetryLoop, 2000);
            }, function (err) {
                // Error happened; take a bit longer this time
                setTimeout(flushTelemetryLoop, 5000);
            });
        }

        flushTelemetryLoop();

        asset.load('main.swf').then(function () {
            game(stage);
        }).fail(die);
    }

    return main;
});
