define([ 'util/PubSub', 'padControls', 'telemetry' ], function (PubSub, padControls, telemetry) {
    var DOTS_PER_INCH = 92; // TODO
    var DOTS_PER_CM = DOTS_PER_INCH / 2.54;

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

    function center(x, align, width) {
        return (x + width / 2) - width * align;
    }

    function align(containerW, innerW, alignment) {
        // Returns center after alignment
        // 0   => innerW / 2
        // 0.5 => containerW / 2
        // 1   => containerW - innerW / 2
        return containerW * alignment + (innerW / 2 + -alignment * innerW);
    }

    function Screen(stage) {
        this.stage = stage;

        this.popupLayerMc = new sp.Sprite();
        this.particlesLayerMc = new sp.Sprite();
        this.playfieldLayerMc = new sp.Sprite();
        this.cutsceneLayerMC = new sp.Sprite();

        this.mc = new sp.Sprite();
        this.mc.addChild(this.playfieldLayerMc);
        this.mc.addChild(this.particlesLayerMc);
        this.mc.addChild(this.cutsceneLayerMC);
        this.mc.addChild(this.popupLayerMc);

        stage.addChild(this.mc);

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

    Screen.prototype.alignElement = function alignElement(mc, alignX, alignY) {
        this.alignElementX(mc, alignX);
        this.alignElementY(mc, alignY);
    };

    Screen.prototype.alignElementX = function alignElementX(mc, alignX) {
        var bounds = mc.getBounds();
        var cx = align(this.stage.stageWidth, bounds.width, alignX);
        mc.x += cx - bounds.left - bounds.width / 2;
    };

    Screen.prototype.alignElementY = function alignElementY(mc, alignY) {
        var bounds = mc.getBounds();
        var cy = align(this.stage.stageHeight, bounds.height, alignY);
        mc.y += cy - bounds.top - bounds.height / 2;
    };

    Screen.prototype.scaleElement = function scaleElement(mc, screenScale) {
        var scale = screenScale * fitRectangleScale(this.stage.stageWidth, this.stage.stageHeight, mc.width, mc.height);
        mc.scaleX *= scale;
        mc.scaleY *= scale;
    };

    Screen.prototype.setPlayfield = function setPlayfield(playfield) {
        var mc = playfield.mc;
        this.scaleElement(mc, 1);
        this.alignElementY(mc, 0.5);
        mc.x = this.stage.stageWidth / 2;
        this.playfieldLayerMc.addChild(mc);

        // Touch controls (depends upon playfield and screen
        // dimensions)
        if (this.actionControls) {
            this.actionControls.remove();
        }
        if (this.directionControls) {
            this.directionControls.remove();
        }

        var ev = this.events;

        var stageWidth = this.stage.stageWidth;
        var stageHeight = this.stage.stageHeight;
        var bounds = mc.getBounds();

        var actionControlsRegion = new sp.Rectangle(
            bounds.right, 0,
            stageWidth - bounds.right, stageHeight
        );
        this.actionControls = padControls(this.stage, {
            region: actionControlsRegion
        });
        this.actionControls.events.action.subscribe(function () {
            ev.doAction.publish();
        });

        var directionControlsRegion = new sp.Rectangle(
            0, 0,
            bounds.left, stageHeight
        );
        this.directionControls = padControls(this.stage, {
            center: new sp.Point(
                (directionControlsRegion.left + directionControlsRegion.right) * 0.5,
                (directionControlsRegion.top + directionControlsRegion.bottom) * 0.7
            ),
            radius: directionControlsRegion.width * 0.4,
            ignoreRadius: 0,
            region: directionControlsRegion
        });
        this.directionControls.events.direction.subscribe(function (dx, dy) {
            ev.moveCursor.publish(dx, -dy);
        });
    };

    Screen.prototype.clearPlayfield = function clearPlayfield() {
        while (this.playfieldLayerMc.children) {
            this.playfieldLayerMc.removeChildAt(0);
        }
    };

    Screen.prototype.setPopup = function setPopup(popup) {
        this.clearPopup();

        var mc = popup.mc;
        this.scaleElement(mc, 0.5);
        this.alignElement(mc, 0.5, 0.5);
        this.popupLayerMc.addChild(mc);
    };

    Screen.prototype.clearPopup = function clearPopup() {
        while (this.popupLayerMc.children) {
            this.popupLayerMc.removeChildAt(0);
        }
    };

    Screen.prototype.setCutscene = function setCutscene(cutscene) {
        this.clearCutscene();

        cutscene.reorient(this);
        this.cutsceneLayerMC.addChild(cutscene.mc);
    };

    Screen.prototype.clearCutscene = function clearCutscene() {
        while (this.cutsceneLayerMC.children) {
            this.cutsceneLayerMC.removeChildAt(0);
        }
    };

    return Screen;
});
