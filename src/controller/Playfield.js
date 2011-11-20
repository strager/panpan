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

        this.model.swapBlocks(x1, y1, x2, y2);
        this.view.swapBlocks(x1, y1, x2, y2);

        ++this.turnsTaken;
    };

    PlayfieldController.prototype.destroyBlocks = function destroyBlocks() {
        var destroyedIndices = this.model.getDestroyedBlockIndices();
        destroyedIndices.forEach(function (index) {
            var x = this.model.indexToX(index);
            var y = this.model.indexToY(index);

            this.model.destroyBlock(x, y);
            this.view.destroyBlock(x, y);
        }, this);
    };

    PlayfieldController.prototype.fallBlocks = function fallBlocks() {
        var floatingIndices = this.model.getFloatingBlockIndices();
        floatingIndices.forEach(function (index) {
            // Because the indices are sorted, we're falling
            // from the bottom row.  We're safe from state
            // conflicts.
            var x = this.model.indexToX(index);
            var y = this.model.indexToY(index);

            this.model.fallBlock(x, y);
            this.view.fallBlock(x, y);
        }, this);
    };

    PlayfieldController.prototype.update = function update() {
        this.destroyBlocks();
        this.fallBlocks();
    };

    PlayfieldController.prototype.isSettled = function isSettled() {
        var isBlockFalling = this.model.getFloatingBlockIndices().length;
        var isBlockDestroying = this.model.getDestroyedBlockIndices().length;
        return !isBlockFalling && !isBlockDestroying;
    };

    PlayfieldController.prototype.isWin = function isWin() {
        if (this.turnsTaken > this.model.maxTurns) {
            // Probably should never happen
            return false;
        }

        var empty = this.model.blocks.every(function (x) {
            return x === blockModel.EMPTY;
        })

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
        if (this.turnsTaken > this.model.maxTurns) {
            // Probably should never happen
            return true;
        }

        if (this.turnsTaken !== this.model.maxTurns) {
            // We still have some turns left
            return false;
        }

        var empty = this.model.blocks.every(function (x) {
            return x === blockModel.EMPTY;
        });

        // If there are any blocks left, we lost.
        return !empty;
    };

    return PlayfieldController;
});
