define([ ], function () {
    function button(mc, clickCallback) {
        var tpid = null;
        var active = false;

        function removeListeners() {
            mc.stage.removeEventListener(sp.MouseEvent.MOUSE_UP, upOutside, true);
            mc.stage.removeEventListener(sp.TouchEvent.TOUCH_END, upOutside, true);
            mc.removeEventListener(sp.MouseEvent.MOUSE_UP, upInside, true);
            mc.removeEventListener(sp.TouchEvent.TOUCH_END, upInside, true);

        }

        function upOutside(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }

            active = false;
            event.stopPropagation();

            removeListeners();

            mc.gotoAndPlay('up');
        }

        function upInside(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }

            active = false;
            event.stopPropagation();

            removeListeners();

            mc.gotoAndPlay('click');
            clickCallback();
        }

        function down(event) {
            if (active || !mc.stage) {
                return;
            }
            active = true;
            tpid = event.touchPointID;

            mc.gotoAndPlay('down');

            mc.stage.addEventListener(sp.MouseEvent.MOUSE_UP, upOutside, true);
            mc.stage.addEventListener(sp.TouchEvent.TOUCH_END, upOutside, true);
            mc.addEventListener(sp.MouseEvent.MOUSE_UP, upInside, true);
            mc.addEventListener(sp.TouchEvent.TOUCH_END, upInside, true);
        }

        mc.addEventListener(sp.MouseEvent.MOUSE_DOWN, down);
        mc.addEventListener(sp.TouchEvent.TOUCH_BEGIN, down);
    }

});
