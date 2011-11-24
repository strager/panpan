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

        this.blockHaltTimers = model.blocks.map(function () {
            return 0;
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

    // Make the swaps so block at (x1,y) ends up at (x2,y)
    PlayfieldController.prototype.swapBlock = function swapBlock(x1, y, x2) {
        // FIXME FIXME This doesn't handle "jumps", e.g. (0,0) => (2,0)
        if (Math.abs(x1 - x2) !== 1) {
            die("FIXME Bad swap which shouldn't throw this error");
        }

        var index1 = this.model.xyToIndex(x1, y);
        var index2 = this.model.xyToIndex(x2, y);

        if (this.model.blocks[index1] === blockModel.EMPTY && this.model.blocks[index2] === blockModel.EMPTY) {
            // Don't do anything when swapping two empty blocks
            return;
        }

        if (!this.model.canSwapBlock(index1) || !this.model.canSwapBlock(index2)) {
            return;
        }

        this.model.swapTimer(index1);
        this.model.swapTimer(index2);

        this.model.swapBlocks(x1, y, x2, y);
        this.view.swapBlocks(x1, y, x2, y);

        ++this.turnsTaken;
        this.view.setTurnCount(this.turnsTaken);
    };

    PlayfieldController.prototype.swapAtCursor = function swapAtCursor() {
        this.swapBlock(
            this.model.cursorX,
            this.model.cursorY,
            this.model.cursorX + 1
        );
    };

    PlayfieldController.prototype.update = function update(dt) {
        this.model.blocks.forEach(function (block, index) {
            var x = this.model.indexToX(index);
            var y = this.model.indexToY(index);

            // Check for halting blocks
            var haltT = this.blockHaltTimers[index];
            var newHaltT = Math.max(0, haltT - dt);
            if (newHaltT === 0 && haltT !== 0) {
                this.view.startDestroyBlock(x, y);
            }
            this.blockHaltTimers[index] = newHaltT;

            // Check destroying blocks
            var destroyT = this.model.blockDestroyTimers[index];
            var newDestroyT = Math.max(0, destroyT - dt)
            if (newDestroyT === 0 && destroyT !== 0) {
                this.model.destroyBlock(x, y);
                this.view.endDestroyBlock(x, y);
            }
            this.model.blockDestroyTimers[index] = newDestroyT;

            // Check falling blocks
            var fallT = this.model.blockFallTimers[index];
            var newFallT = Math.max(0, fallT - dt);
            if (newFallT === 0 && this.model.shouldBlockFall(index)) {
                // Because the indices are sorted, we're
                // falling from the bottom row.  We're safe
                // from state conflicts.
                this.model.fallBlock(index);
                this.view.fallBlock(x, y);

                var newIndex = this.model.xyToIndex(x, y - 1);
                if (this.model.shouldBlockFall(newIndex)) {
                    // If we need to continue falling, reset
                    // the timer.
                    this.model.blockFallTimers[newIndex] = 50;
                }
            }
            this.model.blockFallTimers[index] = newFallT;
        }, this);

        var initHaltDuration = 400;
        var deltaHaltDuration = 300;
        var postHaltDuration = 300;

        var destroyedIndices = this.model.getDestroyedBlockIndices();
        var destroyDuration = initHaltDuration + postHaltDuration + deltaHaltDuration * destroyedIndices.length;
        destroyedIndices.forEach(function (index, i) {
            var x = this.model.indexToX(index);
            var y = this.model.indexToY(index);
            this.view.haltBlock(x, y);
            this.model.blockDestroyTimers[index] = destroyDuration;
            this.blockHaltTimers[index] = initHaltDuration + deltaHaltDuration * i;
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
