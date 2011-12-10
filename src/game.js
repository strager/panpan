define([ 'data/cutscenes', 'model/Playfield', 'view/Playfield', 'controller/Playfield', 'data/levels', 'util/stateMachine', 'view/Popup', 'q', 'view/Screen', 'telemetry', 'view/Particles' ], function (cutscenes, PlayfieldModel, PlayfieldView, PlayfieldController, levels, stateMachine, PopupView, Q, ScreenView, telemetry, ParticleEngine) {
    var GameStateMachine = stateMachine([
        { name: 'start',    from: 'none',    to: 'playing' },
        { name: 'fail',     from: 'playing', to: 'failed'  },
        { name: 'retry',    from: 'failed',  to: 'playing' },
        { name: 'win',      from: 'playing', to: 'won'     },
        { name: 'continue', from: 'won',     to: 'none'    }
    ]);

    function game(stage) {
        var screen = new ScreenView(stage);
        screen.events.moveCursor.subscribe(function (dx, dy) {
            telemetry.record('move', { dx: dx, dy: dy });
        });
        screen.events.doAction.subscribe(function () {
            telemetry.record('doAction', { });
        });

        var particleEngine = new ParticleEngine();
        screen.setParticleEngine(particleEngine);

        var view = new PlayfieldView();
        view.events.blockHoldMove.subscribe(function (x, y, oldX, oldY) {
            telemetry.record('holdMove', { x: x, y: y, oldX: oldX, oldY: oldY });
        });
        screen.setPlayfield(view);

        var lastTime = null;
        stage.addEventListener(sp.Event.ENTER_FRAME, function () {
            var now = Date.now();
            if (lastTime !== null) {
                var dt = now - lastTime;
                particleEngine.update(dt);
                view.update(dt);
            }
            lastTime = now;
        });

        var currentLevelIndex = -1;

        function load() {
            telemetry.record('load_level', { level: currentLevelIndex });

            view.resetBlocks();
            var level = levels[currentLevelIndex];
            if (!level) {
                die("Failed to load level " + currentLevelIndex);
            }

            view.setLevelName(currentLevelIndex + 1); // Humans are 1-based

            var model = PlayfieldModel.fromJSON(level);
            var c = new PlayfieldController(model, view, particleEngine);

            handlers.push(screen.events.moveCursor.subscribe(function (dx, dy) {
                view.showCursor();
                c.moveCursorBy(dx, dy);
            }));
            handlers.push(screen.events.doAction.subscribe(function () {
                view.showCursor();
                if (c.canMakeMove()) {
                    c.swapAtCursor();
                }
            }));

            handlers.push(view.events.blockHoldMove.subscribe(function (x, y, oldX, oldY) {
                if (y !== oldY) {
                    die("Shouldn't get a block hold move with different Y values");
                }

                view.hideCursor();
                if (c.canMakeMove()) {
                    c.swapBlock(x, y, oldX);
                }
            }));

            var UPDATE_MS = 20;
            var lastTime = null;
            function step() {
                var timeout = setTimeout(step, UPDATE_MS);

                var now = Date.now();
                if (lastTime === null) {
                    lastTime = now;
                }

                // Fixed time step
                while (now - lastTime >= UPDATE_MS) {
                    c.update(UPDATE_MS);
                    lastTime += UPDATE_MS;
                }

                if (c.isSettled()) {
                    if (c.isWin()) {
                        clearTimeout(timeout);
                        Q.fail(sm.win(), die);
                    } else if (c.isLoss()) {
                        clearTimeout(timeout);
                        Q.fail(sm.fail(), die);
                    }
                }
            }
            step();
        }

        var handlers = [ ];
        function clearHandlers() {
            handlers.forEach(function (keyHandler) {
                keyHandler.remove();
            });
            handlers.length = 0;
        }

        var sm = new GameStateMachine('none', {
            enter_failed: function enter_failed() {
                telemetry.record('fail_level', { level: currentLevelIndex });

                clearHandlers();

                function on_retry() {
                    clearHandlers();

                    Q.fail(sm.retry(), die);
                }

                handlers.push(screen.events.doAction.subscribe(on_retry));

                screen.setPopup(new PopupView('failed', {
                    on_retry: on_retry
                }));
            },
            enter_won: function enter_won() {
                telemetry.record('won_level', { level: currentLevelIndex });

                clearHandlers();

                if (currentLevelIndex + 1 >= levels.length) {
                    screen.setPopup(new PopupView('end', { }));
                } else {
                    function on_continue() {
                        clearHandlers();

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
                clearHandlers();

                ++currentLevelIndex;
                load();
            },

            on_retry: function on_retry() {
                clearHandlers();

                load();
            }
        });

        Q.fail(sm.start(), die);
    }

    return game;
});
