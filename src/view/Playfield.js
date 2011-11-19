define([ 'view/block', 'asset' ], function (blockView, asset) {
    function PlayfieldView(model, options) {
        extendDefault(this, {
            blockWidth: null,
            blockHeight: null,
            themeFile: 'main.swf'
        }, options);

        this.model = model;

        if (this.blockWidth === null || this.blockHeight === null) {
            var PositionsMovieClip = asset.get(this.themeFile + ':BlockPositions');
            var positions = new PositionsMovieClip();

            if (this.blockWidth === null) {
                this.blockWidth = positions.topRight.x - positions.topLeft.x;
            }
            if (this.blockHeight === null) {
                this.blockHeight = positions.bottomLeft.y - positions.topLeft.y;
            }
        }

        var PlayfieldMovieClip = asset.get(this.themeFile + ':Playfield');
        this.mc = new PlayfieldMovieClip();
        this.cornerX = this.mc.corner.x;
        this.cornerY = this.mc.corner.y;
        this.mc.removeChild(this.mc.corner);

        var blocks = model.blocks.map(function (block, i) {
            var view = blockView.fromModel(block, options);
            if (view) {
                this.position(i, view);
                this.mc.addChild(view);
            }
        }, this);
    }

    PlayfieldView.prototype.position = function position(index, mc) {
        var width = this.model.width;
        var xb = index % width;
        var yb = Math.floor(index / width);
        mc.x = this.cornerX + xb * this.blockWidth;
        mc.y = this.cornerY - yb * this.blockHeight;
    };

    return PlayfieldView;
});
