define([ 'asset' ], function (asset) {
    var classNames = [ null, 'BlockA', 'BlockB', 'BlockC', 'BlockD' ];

    function fromModel(block, options) {
        var className = classNames[block];
        if (!className) {
            return null;
        }

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
