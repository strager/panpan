define([ 'util/PubSub', 'telemetry' ], function (PubSub, telemetry) {
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

            telemetry.record('input', { type: 'pad', x: x, y: y });

            events.action.publish();

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
                // Move the controls so the "hot zone" of the
                // hit region is centred on where the user
                // clicked.
                center.x = event.localX - radius * dirX * 0.5;
                center.y = event.localY - radius * dirY * 0.5;

                // Keep controls within the region
                if (center.x + radius / 2 > region.right) {
                    center.x = region.right - radius / 2;
                } else if (center.x - radius / 2 < region.left) {
                    center.x = region.left + radius / 2;
                }
                if (center.y + radius / 2 > region.bottom) {
                    center.y = region.right - radius / 2;
                } else if (center.y - radius / 2 < region.top) {
                    center.y = region.left + radius / 2;
                }

                events.direction.publish(dirX, dirY);
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
            direction: new PubSub(),
            action: new PubSub()
        };

        return {
            remove: remove,
            events: events
        };
    }

    return padControls;
});
