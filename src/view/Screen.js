define([ ], function () {
    function Screen(stage) {
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
    }

    Screen.prototype.setPlayfield = function setPlayfield(playfield) {
        var mc = playfield.mc;
        mc.x = this.playfieldX;
        mc.y = this.playfieldY;
        this.playfieldLayerMc.addChild(mc);
    };

    Screen.prototype.setPopup = function setPopup(popup) {
        this.clearPopup();

        var mc = popup.mc;
        mc.x = this.popupX;
        mc.y = this.popupY;
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