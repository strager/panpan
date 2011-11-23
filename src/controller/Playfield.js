define([ 'model/block' ], function (blockModel) {
    function PlayfieldController(model, view) {
        this.model = model;
        this.view = view;

        model.blocks.forEach(function (block, i) {
            if (block === blockModel.EMPTY) {
                return;
            }

            view.placeBlock(
                model.indexToX(i),
                model.indexToY(i),
                block
            );
        });

        this.view.moveCursorTo(this.model.cursorX, this.model.cursorY);

        this.turnsTaken = 0;
        this.view.setTurnCount(this.turnsTaken);
        this.view.setMaxTurnCount(this.model.maxTurns);
    }

    PlayfieldController.prototype.moveCursorBy = function moveCursorBy(dx, dy) {
        this.model.moveCursorBy(dx, dy);
        this.view.moveCursorTo(this.model.cursorX, this.model.cursorY);
    };

    PlayfieldController.prototype.swapAtCursor = function swapAtCursor() {
        var x1 = this.model.cursorX;
        var y1 = this.model.cursorY;
        var x2 = x1 + 1;
        var y2 = y1;

        var index1 = this.model.xyToIndex(x1, y1);
        var index2 = this.model.xyToIndex(x2, y2);

        if (this.model.blocks[index1] === blockModel.EMPTY && this.model.blocks[index2] === blockModel.EMPTY) {
            // Don't do anything when swapping empty blocks
            return;
        }

        if (this.model.blockTimers[index1] === 0) {
            this.model.blockTimers[index1] = 200;
        }
        if (this.model.blockTimers[index2] === 0) {
            this.model.blockTimers[index2] = 200;
        }
        this.model.swapBlocks(x1, y1, x2, y2);
        this.view.swapBlocks(x1, y1, x2, y2);

        ++this.turnsTaken;
        this.view.setTurnCount(this.turnsTaken);
    };

    PlayfieldController.prototype.update = function update(dt) {
        var blocks = this.model.blocks;
        var blockTimers = this.model.blockTimers;
        var i;
        for (i = 0; i < blockTimers.length; ++i) {
            var t = blockTimers[i];
            var x = this.model.indexToX(i);
            var y = this.model.indexToY(i);

            if (t >= 0) {
                // (Potentially) falling block
                t = Math.max(0, t - dt);
                if (t === 0 && this.model.shouldBlockFall(i)) {
                    // Because the indices are sorted, we're
                    // falling from the bottom row.  We're safe
                    // from state conflicts.
                    this.model.fallBlock(i);
                    this.view.fallBlock(x, y);

                    var newIndex = this.model.xyToIndex(x, y - 1);
                    if (this.model.shouldBlockFall(newIndex)) {
                        // If we need to continue falling, reset the
                        // timer.
                        blockTimers[newIndex] = 50;
                    }
                }
            } else {
                // Destroying block
                t = Math.min(0, t + dt);
                if (t === 0) {
                    this.model.destroyBlock(x, y);
                    this.view.endDestroyBlock(x, y);
                }
            }
            blockTimers[i] = t;
        }

        var destroyedIndices = this.model.getDestroyedBlockIndices();
        destroyedIndices.forEach(function (index) {
            var x = this.model.indexToX(index);
            var y = this.model.indexToY(index);
            this.view.startDestroyBlock(x, y);
            this.model.blockTimers[index] = -500;
        }, this);
    };

    PlayfieldController.prototype.isSettled = function isSettled() {
        return this.model.isSettled();
    };

    PlayfieldController.prototype.isWin = function isWin() {
        var empty = this.model.blocks.every(function (x) {
            return x === blockModel.EMPTY;
        });

        if (empty) {
            return true;
        } else {
            if (this.turnsTaken === this.model.maxTurns) {
                // Some blocks remaining, and we hit the turn
                // limit
                return false;
            } else {
                // Some blocks remaining, but we haven't hit
                // the turn limit yet
                return false;
            }
        }
    };

    PlayfieldController.prototype.isLoss = function isLoss() {
        if (this.canMakeMove()) {
            return false;
        }

        var empty = this.model.blocks.every(function (x) {
            return x === blockModel.EMPTY;
        });

        // If there are any blocks left, we lost.
        return !empty;
    };

    PlayfieldController.prototype.canMakeMove = function canMakeMove() {
        return this.model.maxTurns === 0 || this.turnsTaken < this.model.maxTurns;
    };

    return PlayfieldController;
});
