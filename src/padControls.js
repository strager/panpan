define([ 'util/PubSub' ], function (PubSub) {
    function padControls(mc, options) {
        options = extendDefault({ }, {
            center: null,
            radius: 30,
            ignoreRadius: 10,
            region: null
        }, options);

        if (!options.region) {
            die("Need a region, bro");
        }

        var region = options.region.clone();
        var center = options.center
            ? options.center.clone()
            : new sp.Point(
                (region.left + region.right) / 2,
                (region.top + region.bottom) / 2
            );

        var radius = options.radius;
        var radius2 = radius * radius;
        var ignoreRadius2 = options.ignoreRadius * options.ignoreRadius;

        if (radius > region.width || radius > region.height) {
            die("Region is smaller than padControls radius");
        }
        if (ignoreRadius2 > radius2) {
            die("ignoreRadius is larger than radius");
        }

        function down(event) {
            if (!region.contains(event.localX, event.localY)) {
                return;
            }

            var x = event.localX - center.x;
            var y = event.localY - center.y;

            var dirX = 0, dirY = 0;
            if (Math.abs(x) > Math.abs(y)) {
                dirX = x > 0 ? 1 : -1;
            } else {
                dirY = y > 0 ? 1 : -1;
            }

            var dist2 = x * x + y * y;
            if (dist2 < ignoreRadius2) {
                // Porridge is too cold
                // Ignore
            } else if (dist2 > radius2) {
                // Porridge is too hot
                // TODO
            } else {
                // Porridge is just right
                events.direction.publish(dirX, dirY);
            }
        }

        function removeEventListeners() {
            mc.removeEventListener(sp.MouseEvent.MOUSE_DOWN, down);
            mc.removeEventListener(sp.TouchEvent.TOUCH_BEGIN, down);
        }

        function remove() {
            removeEventListeners();
        }

        mc.addEventListener(sp.MouseEvent.MOUSE_DOWN, down);
        mc.addEventListener(sp.TouchEvent.TOUCH_BEGIN, down);

        var events = {
            direction: new PubSub()
        };

        return {
            remove: remove,
            events: events
        };
    }

    return padControls;
});
