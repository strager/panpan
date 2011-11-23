define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine', 'view/Popup', 'q' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine, PopupView, Q) {
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
                    Q.fail(sm.win(), die);
                } else if (controller.isLoss()) {
                    Q.fail(sm.fail(), die);
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

                var popup = new PopupView('failed', {
                    on_retry: function on_continue() {
                        Q.fail(sm.retry(), die);
                    }
                });
                stage.addChild(popup.mc);
            },
            enter_won: function enter_won() {
                controller = null;

                var popup = new PopupView('won', {
                    on_continue: function on_continue() {
                        Q.when(
                            sm.continue(),
                            sm.start.bind(sm),
                            die
                        );
                    }
                });
                stage.addChild(popup.mc);
            },
            enter_playing: function enter_playing() {
            },

            on_start: function on_start() {
                ++currentLevelIndex;
                load();
            },

            on_retry: function on_retry() {
                load();
            }
        });

        Q.fail(sm.start(), die);
    }

    return game;
});
