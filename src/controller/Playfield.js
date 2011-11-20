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
    };

    return PlayfieldController;
});
