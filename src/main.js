define([ 'asset', 'game', 'telemetry' ], function (asset, game, telemetry) {
    function main(stage) {
        setInterval(telemetry.flush, 5000);

        asset.load('main.swf').then(function () {
            game(stage);
        }, die);
    }

    return main;
});
