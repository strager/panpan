define([ 'view/block', 'asset' ], function (blockView, asset) {
    function PlayfieldView(options) {
        extendDefault(this, {
            blockWidth: null,
            blockHeight: null,
            themeFile: 'main.swf'
        }, options);

        this.blockOptions = extendDefault({ }, {
            themeFile: this.themeFile
        }, options.blockOptions);

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

        var cornerX = this.mc.corner.x;
        var cornerY = this.mc.corner.y;
        this.mc.removeChild(this.mc.corner);

        this.mcBlocks = new sp.Sprite();
        this.mcBlocks.x = cornerX;
        this.mcBlocks.y = cornerY;

        var CursorMovieClip = asset.get(this.themeFile + ':Cursor');
        this.cursor = new CursorMovieClip();

        this.mcOverlay = new sp.Sprite();
        this.mcOverlay.x = cornerX;
        this.mcOverlay.y = cornerY;
        this.mcOverlay.addChild(this.cursor);

        this.mc.addChild(this.mcBlocks);
        this.mc.addChild(this.mcOverlay);
    }

    PlayfieldView.prototype.placeBlock = function placeBlock(x, y, block) {
        var view = blockView.fromModel(block, this.blockOptions);
        view.x = x * this.blockWidth;
        view.y = -y * this.blockHeight;
        this.mcBlocks.addChild(view);
    };

    PlayfieldView.prototype.moveCursorTo = function moveCursorTo(x, y) {
        this.cursor.x = x * this.blockWidth;
        this.cursor.y = -y * this.blockHeight;
    };

    return PlayfieldView;
});
