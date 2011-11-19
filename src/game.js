define([ 'model/Playfield', 'view/Playfield', 'data/levels' ], function (PlayfieldModel, PlayfieldView, levels) {
    function game(stage) {
        var currentLevel = levels[0];

        var pfm = PlayfieldModel.fromJSON(currentLevel);

        var pfv = new PlayfieldView(pfm);
        stage.addChild(pfv.mc);
    }

    return game;
});
