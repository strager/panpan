define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels) {
    function game(stage) {
        var currentLevel = levels[0];

        var pfm = PlayfieldModel.fromJSON(currentLevel);

        var pfv = new PlayfieldView(pfm);
        stage.addChild(pfv.mc);

        var pfc = new PlayfieldController(pfm, pfv);
        stage.addEventListener(sp.KeyboardEvent.KEY_DOWN, function (event) {
            var dx = 0, dy = 0;

            switch (event.keyCode) {
            case sp.Keyboard.LEFT:  dx = -1; break;
            case sp.Keyboard.RIGHT: dx = +1; break;
            case sp.Keyboard.UP:    dy = +1; break;
            case sp.Keyboard.DOWN:  dy = -1; break;
            }

            pfc.moveCursorBy(dx, dy);
        });
    }

    return game;
});
