define([ 'util/ease' ], function (ease) {
    function Animation(refreshFn, duration, context) {
        this.refreshFn = refreshFn;
        this.duration = duration;
        this.context = context;
        this.spent = 0;

        this.refreshFn.call(this.context, 0);
    }

    Animation.prototype.isActive = function isActive() {
        return !!this.refreshFn;
    };

    Animation.prototype.update = function update(dt) {
        if (dt < 0) {
            // XXX THIS MAY HAPPEN IF USER CLOCK CHANGES
            // (DST?).  WE MUST DEFEND AGAINST THIS!!!
            // XXX FIXME TODO XXX
            die("Negative dt");
        }
        if (dt === 0) {
            return;
        }
        if (!this.isActive()) {
            return;
        }

        this.spent += dt;
        if (this.spent >= this.duration) {
            this.remove();
        } else {
            this.refreshFn.call(this.context, this.spent / this.duration);
        }
    };

    // Stop the animation at the final position, with no chance of recovery
    Animation.prototype.remove = function remove() {
        if (!this.isActive()) {
            return;
        }

        this.refreshFn.call(this.context, 1);
        this.refreshFn = null;
    };

    // Stop the animation abruptly, with no chance of recovery
    Animation.prototype.halt = function halt() {
        this.refreshFn = null;
    };

    Animation.move = function move(mc, endX, endY, duration, easing) {
        var startX = mc.x;
        var startY = mc.y;
        return new Animation(function refresh(p) {
            mc.x = ease.scaleUp(startX, endX, easing(p));
            mc.y = ease.scaleUp(startY, endY, easing(p));
        }, duration);
    };

    return Animation;
});
