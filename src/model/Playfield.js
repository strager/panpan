define([ 'model/block' ], function (blockModel) {
    function PlayfieldModel(width, height) {
        this.width = width;
        this.height = height;

        var i, blocks = [ ];
        var empty = blockModel.EMPTY;
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

    PlayfieldModel.prototype.swapBlocks = function swapBlocks(x1, y1, x2, y2) {
        var i1 = this.xyToIndex(x1, y1);
        var i2 = this.xyToIndex(x2, y2);

        var x = this.blocks[i1];
        this.blocks[i1] = this.blocks[i2];
        this.blocks[i2] = x;
    };

    PlayfieldModel.prototype.fallBlock = function fallBlock(x, y) {
        var currentIndex = this.xyToIndex(x, y);
        var fellIndex = this.xyToIndex(x, y - 1);
        if (y === 0 || this.blocks[fellIndex] !== blockModel.EMPTY) {
            die("Cannot fall block into living block");
        }

        this.blocks[fellIndex] = this.blocks[currentIndex];
        this.blocks[currentIndex] = blockModel.EMPTY;
    };

    PlayfieldModel.prototype.destroyBlock = function destroyBlock(x, y) {
        this.blocks[this.xyToIndex(x, y)] = blockModel.EMPTY;
    };

    PlayfieldModel.prototype.getFloatingBlockIndices = function getFloatingBlockIndices() {
        // All blocks on a column are floating if a lower row
        // of that column is empty.  Returns a sorted list.
        var floatingIndices = [ ];
        var holyColumns = [ /* falsy values */ ];

        var blocks = this.blocks;

        var i = 0;
        while (i < blocks.length) {
            var x;
            for (x = 0; x < this.width; ++x) {
                if (blocks[i] === blockModel.EMPTY) {
                    holyColumns[x] = true;
                } else if (holyColumns[x]) {
                    floatingIndices.push(i);
                }
                ++i;
            }
        }

        return floatingIndices;
    };

    PlayfieldModel.prototype.getDestroyedBlockIndices = function getDestroyedBlockIndices() {
        var destroyed = [ /* falsy values */ ];

        var blocks = this.blocks;
        var width = this.width;
        var height = this.height;

        var streakBlock, streakIndices;

        function visit(i) {
            var block = blocks[i];
            if (block === streakBlock && block !== blockModel.EMPTY) {
                streakIndices.push(i);

                if (streakIndices.length === 4) {
                    streakIndices.forEach(function (index) {
                        destroyed[index] = true;
                    });
                } else if (streakIndices.length > 4) {
                    destroyed[i] = true;
                }
            } else {
                streakBlock = block;
                streakIndices = [ i ];
            }
        }

        // Horizontal
        var x, y;
        for (y = 0; y < height; ++y) {
            streakBlock = blockModel.EMPTY;
            streakIndices = [ ];
            for (x = 0; x < width; ++x) {
                visit(this.xyToIndex(x, y));
            }
        }

        // Vertical
        for (x = 0; x < width; ++x) {
            streakBlock = blockModel.EMPTY;
            streakIndices = [ ];
            for (y = 0; y < height; ++y) {
                visit(this.xyToIndex(x, y));
            }
        }

        var destroyedIndices = [ ];
        destroyed.forEach(function (x, i) {
            if (x) {
                destroyedIndices.push(i);
            }
        });
        return destroyedIndices;
    };

    PlayfieldModel.fromJSON = function fromJSON(json) {
        var m = new PlayfieldModel(json.width, json.height);
        m.blocks = json.blocks;
        return m;
    };

    return PlayfieldModel;
});
