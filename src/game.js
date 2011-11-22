define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine', 'ui' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine, ui) {
    var GameStateMachine = stateMachine([
        { name: 'start',    from: 'none',    to: 'playing' },
        { name: 'fail',     from: 'playing', to: 'failed'  },
        { name: 'retry',    from: 'failed',  to: 'playing' },
        { name: 'win',      from: 'playing', to: 'won'     },
        { name: 'continue', from: 'won',     to: 'none'    }
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
                if (c.canMakeMove()) {
                    c.swapAtCursor();
                }
                break;

            default:
                // Unknown key; ignore
                break;
            }
        });

        var lastTime = null;
        setInterval(function () {
            if (!controller) {
                return;
            }

            var now = Date.now();
            if (lastTime !== null) {
                controller.update(now - lastTime);
            }
            lastTime = now;

            if (controller.isSettled()) {
                if (controller.isWin()) {
                    sm.win();
                } else if (controller.isLoss()) {
                    sm.fail();
                }
            }
        }, 20);

        function load() {
            view.resetBlocks();
            var level = levels[currentLevelIndex];
            if (!level) {
                die("Failed to load level " + currentLevelIndex);
            }

            var model = PlayfieldModel.fromJSON(level);
            controller = new PlayfieldController(model, view);
        }

        var sm = new GameStateMachine('none', {
            enter_failed: function enter_failed() {
                controller = null;

                view.mc.gotoAndPlay('failed');
                var button = ui.button(view.mc.retryButton, function () {
                    sm.retry();
                    button.remove();
                });
            },
            enter_won: function enter_won() {
                controller = null;

                view.mc.gotoAndPlay('won');
                var button = ui.button(view.mc.continueButton, function () {
                    sm.continue().then(function () {
                        sm.start();
                    });
                    button.remove();
                });
            },
            enter_playing: function enter_playing() {
                view.mc.gotoAndPlay('playing');
            },

            on_start: function on_start() {
                ++currentLevelIndex;
                load();
            },

            on_retry: function on_retry() {
                load();
            }
        });

        sm.start();
    }

    return game;
});
