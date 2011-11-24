define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine', 'view/Popup', 'q', 'view/Screen', 'telemetry' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine, PopupView, Q, ScreenView, telemetry) {
    var GameStateMachine = stateMachine([
        { name: 'start',    from: 'none',    to: 'playing' },
        { name: 'fail',     from: 'playing', to: 'failed'  },
        { name: 'retry',    from: 'failed',  to: 'playing' },
        { name: 'win',      from: 'playing', to: 'won'     },
        { name: 'continue', from: 'won',     to: 'none'    }
    ]);

    var SWAP_KEYS = [ sp.Keyboard.X, sp.Keyboard.SPACE ];
    var NEXT_KEYS = SWAP_KEYS;

    function game(stage) {
        var screen = new ScreenView(stage);

        var currentLevelIndex = -1;

        var view = new PlayfieldView();
        screen.setPlayfield(view);

        function load() {
            telemetry.record('load_level', { level: currentLevelIndex });

            view.resetBlocks();
            var level = levels[currentLevelIndex];
            if (!level) {
                die("Failed to load level " + currentLevelIndex);
            }

            var model = PlayfieldModel.fromJSON(level);
            var c = new PlayfieldController(model, view);

            handlers.push(screen.addKeyHandler(sp.Keyboard.LEFT,  c.moveCursorBy.bind(c, -1,  0), 'down'));
            handlers.push(screen.addKeyHandler(sp.Keyboard.RIGHT, c.moveCursorBy.bind(c, +1,  0), 'down'));
            handlers.push(screen.addKeyHandler(sp.Keyboard.UP,    c.moveCursorBy.bind(c,  0, +1), 'down'));
            handlers.push(screen.addKeyHandler(sp.Keyboard.DOWN,  c.moveCursorBy.bind(c,  0, -1), 'down'));

            handlers.push(screen.addKeyHandler(SWAP_KEYS, function () {
                if (c.canMakeMove()) {
                    c.swapAtCursor();
                }
            }, 'down'));

            handlers.push(view.events.blockHoldMove.subscribe(function (x, y, oldX, oldY) {
                if (y !== oldY) {
                    die("Shouldn't get a block hold move with different Y values");
                }

                if (c.canMakeMove()) {
                    c.swapBlock(x, y, oldX);
                }
            }));

            var lastTime = null;
            var gameLoop = setInterval(function () {
                var now = Date.now();
                if (lastTime !== null) {
                    c.update(now - lastTime);
                }
                lastTime = now;

                if (c.isSettled()) {
                    if (c.isWin()) {
                        clearInterval(gameLoop);
                        Q.fail(sm.win(), die);
                    } else if (c.isLoss()) {
                        clearInterval(gameLoop);
                        Q.fail(sm.fail(), die);
                    }
                }
            }, 20);
        }

        var handlers = [ ];
        function clearKeyHandlers() {
            handlers.forEach(function (keyHandler) {
                keyHandler.remove();
            });
            handlers.length = 0;
        }

        var sm = new GameStateMachine('none', {
            enter_failed: function enter_failed() {
                telemetry.record('fail_level', { level: currentLevelIndex });

                clearKeyHandlers();

                function on_retry() {
                    Q.fail(sm.retry(), die);
                }

                handlers.push(screen.addKeyHandler(NEXT_KEYS, on_retry, 'down'));

                screen.setPopup(new PopupView('failed', {
                    on_retry: on_retry
                }));
            },
            enter_won: function enter_won() {
                telemetry.record('won_level', { level: currentLevelIndex });

                clearKeyHandlers();

                if (currentLevelIndex + 1 >= levels.length) {
                    screen.setPopup(new PopupView('end', { }));
                } else {
                    function on_continue() {
                        Q.when(
                            sm['continue'](),
                            sm.start.bind(sm),
                            die
                        );
                    }

                    handlers.push(screen.addKeyHandler(NEXT_KEYS, on_continue, 'down'));

                    screen.setPopup(new PopupView('won', {
                        on_continue: on_continue
                    }));
                }
            },
            enter_playing: function enter_playing() {
                screen.clearPopup();
            },

            on_start: function on_start() {
                clearKeyHandlers();

                ++currentLevelIndex;
                load();
            },

            on_retry: function on_retry() {
                clearKeyHandlers();

                load();
            }
        });

        Q.fail(sm.start(), die);
    }

    return game;
});
