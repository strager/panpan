define([ 'util/PubSub' ], function (PubSub) {
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

    var ACTION_KEYS = [ sp.Keyboard.X, sp.Keyboard.SPACE ];

    function Screen(stage) {
        this.stage = stage;

        this.popupLayerMc = new sp.Sprite();
        this.playfieldLayerMc = new sp.Sprite();

        this.mc = new sp.Sprite();
        this.mc.addChild(this.playfieldLayerMc);
        this.mc.addChild(this.popupLayerMc);

        stage.addChild(this.mc);

        this.popupX = stage.stageWidth / 2;
        this.popupY = stage.stageHeight / 2;

        this.playfieldX = stage.stageWidth / 2;
        this.playfieldY = stage.stageHeight;

        var ev = this.events = {
            moveLeft: new PubSub(),
            moveRight: new PubSub(),
            moveUp: new PubSub(),
            moveDown: new PubSub(),
            doAction: new PubSub()
        };

        this.addKeyHandler(sp.Keyboard.LEFT,  ev.moveLeft .publish.bind(ev.moveLeft ), 'down');
        this.addKeyHandler(sp.Keyboard.RIGHT, ev.moveRight.publish.bind(ev.moveRight), 'down');
        this.addKeyHandler(sp.Keyboard.UP,    ev.moveUp   .publish.bind(ev.moveUp   ), 'down');
        this.addKeyHandler(sp.Keyboard.DOWN,  ev.moveDown .publish.bind(ev.moveDown ), 'down');
        this.addKeyHandler(ACTION_KEYS, ev.doAction.publish.bind(ev.doAction));
    }

    Screen.prototype.setPlayfield = function setPlayfield(playfield) {
        var mc = playfield.mc;
        mc.x = this.playfieldX;
        mc.y = this.playfieldY;

        // Playfield scales to fill entire screen
        var scale = fitRectangleScale(this.stage.stageWidth, this.stage.stageHeight, mc.width, mc.height);
        mc.scaleX = mc.scaleY = scale;

        this.playfieldLayerMc.addChild(mc);
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

    Screen.prototype.addKeyHandler = function addKeyHandler(keys, callback, type, once) {
        if (!Array.isArray(keys)) {
            keys = [ keys ];
        }
        type = type || 'downup';
        once = !!once;

        var didDown = false;

        var stage = this.mc.stage;

        function down(event) {
            if (keys.indexOf(event.keyCode) < 0) {
                return;
            }

            didDown = true;
            if (type === 'down') {
                if (once) {
                    remove();
                }

                callback(event.keyCode);
            }
        }

        function up(event) {
            if (keys.indexOf(event.keyCode) < 0) {
                return;
            }

            if (type === 'up' || (type === 'downup' && didDown)) {
                if (once) {
                    remove();
                }

                callback(event.keyCode);
            }
            didDown = false;
        }

        function removeEventListeners() {
            stage.removeEventListener(sp.KeyboardEvent.KEY_DOWN, down);
            stage.removeEventListener(sp.KeyboardEvent.KEY_UP, up);
        }

        function remove() {
            removeEventListeners();
        }

        if (type === 'down' || type === 'downup') {
            stage.addEventListener(sp.KeyboardEvent.KEY_DOWN, down);
        }
        if (type === 'up' || type === 'downup') {
            stage.addEventListener(sp.KeyboardEvent.KEY_UP, up);
        }

        return {
            remove: remove
        };
    };

    return Screen;
});
