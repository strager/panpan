define([ 'asset' ], function (asset) {
    function main(stage) {
        asset.load('main.swf:').then(function (content) {
            stage.addChild(content);
        });
    }

    return main;
});
