define([ 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine', 'view/Popup', 'q', 'view/Screen', 'telemetry', 'padControls' ], function (PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine, PopupView, Q, ScreenView, telemetry, padControls) {
    var GameStateMachine = stateMachine([
        { name: 'start',    from: 'none',    to: 'playing' },
        { name: 'fail',     from: 'playing', to: 'failed'  },
        { name: 'retry',    from: 'failed',  to: 'playing' },
        { name: 'win',      from: 'playing', to: 'won'     },
        { name: 'continue', from: 'won',     to: 'none'    }
    ]);

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

            handlers.push(screen.events.moveLeft .subscribe(c.moveCursorBy.bind(c, -1,  0)));
            handlers.push(screen.events.moveRight.subscribe(c.moveCursorBy.bind(c, +1,  0)));
            handlers.push(screen.events.moveUp   .subscribe(c.moveCursorBy.bind(c,  0, +1)));
            handlers.push(screen.events.moveDown .subscribe(c.moveCursorBy.bind(c,  0, -1)));

            handlers.push(screen.events.doAction.subscribe(function () {
                if (c.canMakeMove()) {
                    c.swapAtCursor();
                }
            }));

            handlers.push(view.events.blockHoldMove.subscribe(function (x, y, oldX, oldY) {
                if (y !== oldY) {
                    die("Shouldn't get a block hold move with different Y values");
                }

                if (c.canMakeMove()) {
                    c.swapBlock(x, y, oldX);
                }
            }));

            // TODO Move this to ScreenView or something
            var controlsRegion = new sp.Rectangle(
                0, 0,
                view.mc.getBounds().left, stage.stageHeight
            );
            var swapRegion = new sp.Rectangle(
                view.mc.getBounds().right, 0,
                stage.stageWidth - view.mc.getBounds().right, stage.stageHeight
            );
            function down(event) {
                if (swapRegion.contains(event.localX, event.localY)) {
                    if (c.canMakeMove()) {
                        c.swapAtCursor();
                    }
                }
            }
            stage.addEventListener(sp.MouseEvent.MOUSE_DOWN, down);
            stage.addEventListener(sp.TouchEvent.TOUCH_BEGIN, down);
            var controls = padControls(stage, {
                center: new sp.Point(
                    (controlsRegion.left + controlsRegion.right) * 0.5,
                    (controlsRegion.top + controlsRegion.bottom) * 0.7
                ),
                radius: controlsRegion.width * 0.4,
                ignoreRadius: 0,
                region: controlsRegion
            });
            handlers.push(controls.events.direction.subscribe(function (dx, dy) {
                c.moveCursorBy(dx, -dy);
            }));
            handlers.push(controls);

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

                handlers.push(screen.events.doAction.subscribe(on_retry));

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

                    handlers.push(screen.events.doAction.subscribe(on_continue));

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
