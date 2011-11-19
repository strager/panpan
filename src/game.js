define([ 'model/Playfield', 'view/Playfield' ], function (PlayfieldModel, PlayfieldView) {
    function game(stage) {
        var pfm = new PlayfieldModel(8, 20);
        pfm.blocks[0] = 2;
        pfm.blocks[2] = 2;
        pfm.blocks[5] = 1;

        var pfv = new PlayfieldView(pfm);
        stage.addChild(pfv.mc);
    }

    return game;
});
