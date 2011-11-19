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

    PlayfieldModel.fromJSON = function fromJSON(json) {
        var m = new PlayfieldModel(json.width, json.height);
        m.blocks = json.blocks;
        return m;
    };

    return PlayfieldModel;
});
