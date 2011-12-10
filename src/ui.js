define([ ], function () {
    function gotoAndPlay(mc, label) {
        var hasLabel = mc.currentLabels.some(function (label) {
            return label.name === label;
        });

        if (hasLabel) {
            mc.gotoAndPlay(label);
        }
    }

    function button(mc, clickCallback) {
        var tpid = null;
        var active = false;

        function removeListeners() {
            mc.stage.removeEventListener(sp.MouseEvent.MOUSE_UP, upOutside);
            mc.stage.removeEventListener(sp.TouchEvent.TOUCH_END, upOutside);
            mc.removeEventListener(sp.MouseEvent.MOUSE_UP, upInside);
            mc.removeEventListener(sp.TouchEvent.TOUCH_END, upInside);
        }

        function removeAllListeners() {
            removeListeners();
            mc.removeEventListener(sp.MouseEvent.MOUSE_DOWN, down);
            mc.removeEventListener(sp.TouchEvent.TOUCH_BEGIN, down);
        }

        function remove() {
            removeAllListeners();
            if (active) {
                gotoAndPlay(mc, 'up');
            }
        }

        function upOutside(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }

            active = false;
            event.stopPropagation();

            removeListeners();

            gotoAndPlay(mc, 'up');
        }

        function upInside(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }

            active = false;
            event.stopPropagation();

            removeListeners();

            gotoAndPlay(mc, 'click');
            clickCallback();
        }

        function down(event) {
            if (active || !mc.stage) {
                return;
            }
            active = true;
            tpid = event.touchPointID;

            gotoAndPlay(mc, 'down');

            mc.stage.addEventListener(sp.MouseEvent.MOUSE_UP, upOutside);
            mc.stage.addEventListener(sp.TouchEvent.TOUCH_END, upOutside);
            mc.addEventListener(sp.MouseEvent.MOUSE_UP, upInside);
            mc.addEventListener(sp.TouchEvent.TOUCH_END, upInside);
        }

        mc.addEventListener(sp.MouseEvent.MOUSE_DOWN, down);
        mc.addEventListener(sp.TouchEvent.TOUCH_BEGIN, down);

        return {
            remove: remove
        };
    }

    return {
        button: button
    };
});
