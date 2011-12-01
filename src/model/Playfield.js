define([ 'model/block' ], function (blockModel) {
    // blocks is an array representing the grid of blocks.  The
    // array is 1-D, left to right, bottom up.
    //
    // The block___Timers arrays corresponds to blocks, just
    // like the blocks array.  Each element contains the number
    // of milliseconds left until the block should be checking
    // for a special condition:
    //
    // blockFallTimers: check for falling; piece remains
    //   floating while the time is non-zero.  Set when a piece
    //   is swapped or fallen.
    //
    // blockDestroyTimers: check for destruction; piece remains
    //   present while the time is non-zero.  (When the time
    //   reaches zero, the piece is destroyed; the piece is not
    //   destroyed if the time remains zero.)  Set when a piece
    //   begins destruction.
    function PlayfieldModel(width, height) {
        this.width = width;
        this.height = height;

        this.blocks = [ ];
        this.blockFallTimers = [ ];
        this.blockDestroyTimers = [ ];

        var i;
        for (i = 0; i < width * height; ++i) {
            this.blocks.push(blockModel.EMPTY);
            this.blockFallTimers.push(0);
            this.blockDestroyTimers.push(0);
        }

        this.cursorX = this.boundX(Math.floor((this.width - 1) / 2));
        this.cursorY = this.boundY(Math.floor((this.height - 1) / 2));

        this.maxTurns = 0;
        this.minStreakSize = 3;
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

    PlayfieldModel.prototype.boundX = function boundX(x) {
        return Math.min(Math.max(x, 0), this.width - 1);
    };

    PlayfieldModel.prototype.boundY = function boundY(y) {
        return Math.min(Math.max(y, 0), this.height - 1);
    };

    PlayfieldModel.prototype.moveCursorBy = function moveCursorBy(dx, dy) {
        this.cursorX = Math.min(Math.max(this.cursorX + dx, 0), this.width - 2);
        this.cursorY = Math.min(Math.max(this.cursorY + dy, 0), this.height - 1);
    };

    function swap(array, i1, i2) {
        var x = array[i1];
        array[i1] = array[i2];
        array[i2] = x;
    }

    PlayfieldModel.prototype.swapBlocks = function swapBlocks(x1, y1, x2, y2) {
        var i1 = this.xyToIndex(x1, y1);
        var i2 = this.xyToIndex(x2, y2);

        swap(this.blocks, i1, i2);
        swap(this.blockFallTimers, i1, i2);
        swap(this.blockDestroyTimers, i1, i2);
    };

    PlayfieldModel.prototype.fallBlock = function fallBlock(index) {
        var fellIndex = index - this.width;
        if (fellIndex < 0) {
            die("Cannot fall block off the edge");
        }
        if (this.blocks[fellIndex] !== blockModel.EMPTY) {
            die("Cannot fall block into living block");
        }

        this.blocks[fellIndex] = this.blocks[index];
        this.blocks[index] = blockModel.EMPTY;
    };

    PlayfieldModel.prototype.destroyBlock = function destroyBlock(x, y) {
        var index = this.xyToIndex(x, y);
        this.blocks[index] = blockModel.EMPTY;
        this.blockFallTimers[index] = 0;
        this.blockDestroyTimers[index] = 0;
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
        // TODO Clean up

        var destroyed = [ /* falsy values */ ];

        var blocks = this.blocks;
        var blockFallTimers = this.blockFallTimers;
        var blockDestroyTimers = this.blockDestroyTimers;
        var width = this.width;
        var height = this.height;
        var minStreakSize = this.minStreakSize;

        var streakBlock, streakIndices;

        var self = this;
        function visit(i) {
            var block = blocks[i];
            var canDestroy =
                block !== blockModel.EMPTY &&
                self.isBlockSettled(i);

            if (block === streakBlock && canDestroy) {
                streakIndices.push(i);

                if (streakIndices.length === minStreakSize) {
                    streakIndices.forEach(function (index) {
                        destroyed[index] = true;
                    });
                } else if (streakIndices.length > minStreakSize) {
                    destroyed[i] = true;
                }
            } else if (canDestroy) {
                streakBlock = block;
                streakIndices = [ i ];
            } else {
                streakBlock = blockModel.EMPTY;
                streakIndices = [ ];
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

    PlayfieldModel.prototype.shouldBlockFall = function shouldBlockFall(index) {
        if (this.blocks[index] === blockModel.EMPTY) {
            // No block here
            return false;
        }
        if (!this.isBlockSettled(index)) {
            // Something's going on with us
            return false;
        }

        var fellIndex = index - this.width;
        if (fellIndex < 0) {
            // Off edge of screen
            return false;
        }
        if (this.blocks[fellIndex] !== blockModel.EMPTY) {
            // Block is underneath us
            return false;
        }
        if (!this.isBlockSettled(fellIndex)) {
            // Something crazy happening below
            return false;
        }

        // We're clear for take-off
        return true;
    };

    PlayfieldModel.prototype.isSettled = function isSettled() {
        return this.blocks.every(function (_, i) {
            return this.isBlockSettled(i);
        }, this);
    };

    PlayfieldModel.prototype.isBlockSettled = function isBlockSettled(index) {
        return this.blockFallTimers[index] === 0 && this.blockDestroyTimers[index] === 0;
    };

    PlayfieldModel.prototype.canSwapBlock = function canSwapBlock(index) {
        return this.blockDestroyTimers[index] === 0;
    };

    PlayfieldModel.prototype.swapTimer = function swapTimer(index) {
        if (this.isBlockSettled(index)) {
            this.blockFallTimers[index] = 200;
        }
    };

    PlayfieldModel.fromJSON = function fromJSON(json) {
        var m = new PlayfieldModel(json.width, json.height);
        m.blocks = json.blocks.slice();
        m.maxTurns = json.maxTurns || m.maxTurns;
        m.minStreakSize = json.minStreakSize || m.minStreakSize;
        return m;
    };

    return PlayfieldModel;
});
