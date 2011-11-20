define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine) {
    var GameStateMachine = stateMachine([
        { name: 'start', from: 'none', to: 'playing' },
        { name: 'fail',  from: 'playing', to: 'failed' },
        { name: 'continue', from: 'failed', to: 'playing' },
        { name: 'win', from: 'playing', to: 'won' },
        { name: 'continue', from: 'win', to: 'none' },
    ]);

    function game(stage) {
        var currentLevelIndex = -1;

        var view = new PlayfieldView();
        stage.addChild(view.mc);

        var controller;
        stage.addEventListener(sp.KeyboardEvent.KEY_DOWN, function (event) {
            if (!controller) {
                return;
            }

            var c = controller;

            switch (event.keyCode) {
            case sp.Keyboard.LEFT:  c.moveCursorBy(-1,  0); break;
            case sp.Keyboard.RIGHT: c.moveCursorBy(+1,  0); break;
            case sp.Keyboard.UP:    c.moveCursorBy( 0, +1); break;
            case sp.Keyboard.DOWN:  c.moveCursorBy( 0, -1); break;

            case sp.Keyboard.X:
                c.swapAtCursor();
                break;

            default:
                // Unknown key; ignore
                break;
            }
        });

        setInterval(function () {
            if (!controller) {
                return;
            }

            controller.update();

            if (controller.isSettled()) {
                if (controller.isWin()) {
                    console.log('win');
                    sm.win();
                } else if (controller.isLoss()) {
                    console.log('fail');
                    sm.fail();
                }
            }
        }, 500);

        var sm = new GameStateMachine('none', {
            enter_failed: function enter_failed() {
                view.mc.gotoAndPlay('failed');
            },
            enter_won: function enter_won() {
                view.mc.gotoAndPlay('won');
            },
            enter_playing: function enter_playing() {
                view.mc.gotoAndPlay('playing');
            },

            on_start: function on_start() {
                view.resetBlocks();

                ++currentLevelIndex;
                var level = levels[currentLevelIndex];
                if (!level) {
                    die("Failed to load level " + currentLevelIndex);
                }

                var model = PlayfieldModel.fromJSON(level);
                controller = new PlayfieldController(model, view);
            }
        });

        sm.start();
    }

    return game;
});
