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
    }

    return PlayfieldModel;
});
