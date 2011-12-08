define([ 'util/PubSub', 'padControls', 'telemetry' ], function (PubSub, padControls, telemetry) {
    function fitRectangleScale(containerW, containerH, innerW, innerH) {
        var containerAR = containerW / containerH;
        var innerAR = innerW / innerH;

        var ratio = innerAR;
        var target_ratio = containerAR;

        if (ratio > target_ratio) {
            return containerW / ratio / innerH;
        } else {
            return containerH * ratio / innerW;
        }
    }

    function Screen(stage) {
        this.stage = stage;

        this.popupLayerMc = new sp.Sprite();
        this.particlesLayerMc = new sp.Sprite();
        this.playfieldLayerMc = new sp.Sprite();

        this.mc = new sp.Sprite();
        this.mc.addChild(this.playfieldLayerMc);
        this.mc.addChild(this.particlesLayerMc);
        this.mc.addChild(this.popupLayerMc);

        stage.addChild(this.mc);

        this.popupX = stage.stageWidth / 2;
        this.popupY = stage.stageHeight / 2;

        this.playfieldX = stage.stageWidth / 2;
        this.playfieldY = stage.stageHeight;

        var ev = this.events = {
            moveCursor: new PubSub(),
            doAction: new PubSub()
        };

        // NOTE: Block sliding controls are in view/Playfield, and D-pad
        // controls are in setPlayfield below.

        // Keyboard controls
        var ACTION_KEYS = [ sp.Keyboard.X, sp.Keyboard.SPACE ];
        stage.addEventListener(sp.KeyboardEvent.KEY_DOWN, function on_key_down(event) {
            telemetry.record('input', { type: 'keyboard', keyCode: event.keyCode });

            switch (event.keyCode) {
            case sp.Keyboard.LEFT:  ev.moveCursor.publish(-1,  0); break;
            case sp.Keyboard.RIGHT: ev.moveCursor.publish(+1,  0); break;
            case sp.Keyboard.UP:    ev.moveCursor.publish( 0, +1); break;
            case sp.Keyboard.DOWN:  ev.moveCursor.publish( 0, -1); break;

            default:
                if (ACTION_KEYS.indexOf(event.keyCode) >= 0) {
                    ev.doAction.publish();
                }

                break;
            }
        });
    }

    Screen.prototype.setParticleEngine = function setParticleEngine(particleEngine) {
        this.particlesLayerMc.addChild(particleEngine.mc);
    };

    Screen.prototype.setPlayfield = function setPlayfield(playfield) {
        var stageWidth = this.stage.stageWidth;
        var stageHeight = this.stage.stageHeight;

        var mc = playfield.mc;
        mc.x = this.playfieldX;
        mc.y = this.playfieldY;

        // Playfield scales to fill entire screen
        var scale = fitRectangleScale(stageWidth, stageHeight, mc.width, mc.height);
        mc.scaleX = mc.scaleY = scale;

        this.playfieldLayerMc.addChild(mc);

        // Touch controls (depends upon playfield and screen
        // dimensions)
        if (this.controls) {
            this.controls.remove();
        }

        var ev = this.events;

        var actionRegion = new sp.Rectangle(
            mc.getBounds().right, 0,
            stageWidth - mc.getBounds().right, stageHeight
        );
        function mouseDown(event) {
            if (actionRegion.contains(event.localX, event.localY)) {
                telemetry.record('input', { type: 'padAction' });

                ev.doAction.publish();
            }
        }
        this.stage.addEventListener(sp.MouseEvent.MOUSE_DOWN, mouseDown);
        this.stage.addEventListener(sp.TouchEvent.TOUCH_BEGIN, mouseDown);

        var controlsRegion = new sp.Rectangle(
            0, 0,
            mc.getBounds().left, stageHeight
        );
        this.controls = padControls(this.stage, {
            center: new sp.Point(
                (controlsRegion.left + controlsRegion.right) * 0.5,
                (controlsRegion.top + controlsRegion.bottom) * 0.7
            ),
            radius: controlsRegion.width * 0.4,
            ignoreRadius: 0,
            region: controlsRegion
        });
        this.controls.events.direction.subscribe(function (dx, dy) {
            ev.moveCursor.publish(dx, -dy);
        });
    };

    Screen.prototype.setPopup = function setPopup(popup) {
        this.clearPopup();

        var mc = popup.mc;
        mc.x = this.popupX;
        mc.y = this.popupY;

        // Pop-ups scale to fill at most 50% of the screen
        // WTB physical dimensions
        var scale = 0.5 * fitRectangleScale(this.stage.stageWidth, this.stage.stageHeight, mc.width, mc.height);
        mc.scaleX = mc.scaleY = scale;

        this.popupLayerMc.addChild(mc);
    };

    Screen.prototype.clearPopup = function clearPopup() {
        while (this.popupLayerMc.children) {
            this.popupLayerMc.removeChildAt(0);
        }
    };

    return Screen;
});
