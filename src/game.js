define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels) {
    function game(stage) {
        var currentLevel = levels[0];

        var pfm = PlayfieldModel.fromJSON(currentLevel);

        var pfv = new PlayfieldView(pfm);
        stage.addChild(pfv.mc);

        var pfc = new PlayfieldController(pfm, pfv);
        stage.addEventListener(sp.KeyboardEvent.KEY_DOWN, function (event) {
            switch (event.keyCode) {
            case sp.Keyboard.LEFT:  pfc.moveCursorBy(-1,  0); break;
            case sp.Keyboard.RIGHT: pfc.moveCursorBy(+1,  0); break;
            case sp.Keyboard.UP:    pfc.moveCursorBy( 0, +1); break;
            case sp.Keyboard.DOWN:  pfc.moveCursorBy( 0, -1); break;

            case sp.Keyboard.X:
                pfc.swapAtCursor();
                break;

            default:
                // Unknown key; ignore
                break;
            }
        });

        stage.addEventListener(sp.Event.ENTER_FRAME, function () {
            pfc.fallBlocks();
        });
    }

    return game;
});
