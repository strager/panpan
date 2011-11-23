define([ 'asset' ], function (asset) {
    var classNames = {
        'failed': 'OverlayFailed',
    };

    function fromState(state, options) {
        var opts = extendDefault({ }, {
            themeFile: 'main.swf'
        }, options);

        var BlockMovieClip = asset.get(opts.themeFile + ':' + className);
        return new BlockMovieClip();
    }

    return {
        fromModel: fromModel
    };
});
