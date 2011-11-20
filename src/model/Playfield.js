define([ 'model/block' ], function (block) {
    function PlayfieldModel(width, height) {
        this.width = width;
        this.height = height;

        var i, blocks = [ ];
        var empty = block.EMPTY;
        for (i = 0; i < width * height; ++i) {
            blocks.push(empty);
        }
        this.blocks = blocks;

        this.cursorX = 0;
        this.cursorY = 0;
    }

    PlayfieldModel.prototype.indexToXY = function indexToXY(index) {
        return new sp.Point(
            this.indexToX(index),
            this.indexToY(index)
        );
    };

    PlayfieldModel.prototype.indexToX = function indexToX(index) {
        return index % this.width;
    };

    PlayfieldModel.prototype.indexToY = function indexToY(index) {
        return Math.floor(index / this.width);
    };

    PlayfieldModel.prototype.xyToIndex = function xyToIndex(x, y) {
        return x + y * this.width;
    };

    PlayfieldModel.prototype.moveCursorBy = function moveCursorBy(dx, dy) {
        this.cursorX = Math.min(Math.max(this.cursorX + dx, 0), this.width - 2);
        this.cursorY = Math.min(Math.max(this.cursorY + dy, 0), this.height - 1);
    };

    PlayfieldModel.fromJSON = function fromJSON(json) {
        var m = new PlayfieldModel(json.width, json.height);
        m.blocks = json.blocks;
        return m;
    };

    return PlayfieldModel;
});
