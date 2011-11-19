define([ 'asset', 'game' ], function (asset, game) {
    function main(stage) {
        asset.load('main.swf').then(function () {
            game(stage);
        });
    }

    return main;
});
