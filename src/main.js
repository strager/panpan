define([ 'asset', 'game', 'telemetry' ], function (asset, game, telemetry) {
    function main(stage) {
        stage.frameRate = 60;

        setInterval(telemetry.flush, 5000);

        asset.load('main.swf').then(function () {
            game(stage);
        }).fail(die);
    }

    return main;
});
