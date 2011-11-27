define([ 'asset', 'util/PubSub' ], function (asset, PubSub) {
    // TODO Object pooling
    // (sounds like a good idea, right?)

    function clamp(x) {
        return Math.min(Math.max(x, 0), 1);
    }

    function scaleUp(a, b, value) {
        return value * (b - a) + a;
    }

    function scaleDown(a, b, value) {
        return (value - a) / (b - a);
    }

    function lerp(x) {
        return x;
    }

    function sinIn(x) {
        return 1 - Math.sin(Math.PI / 2 * (x + 1));
    }

    function sinOut(x) {
        return Math.sin(Math.PI / 2 * x);
    }

    function smoothstep(x) {
        return x * x * x * (x * (x * 6 - 15) + 10);
    }

    function ParticlesView(options) {
        extendDefault(this, {
            themeFile: 'main.swf'
        }, options);

        this.mc = new sp.Sprite();
        this.updateEvent = new PubSub();
    }

    ParticlesView.prototype.spawnDestroyParticle = function spawnDestroyParticle(x, y, n) {
        var ParticleStarMovieClip = asset.get(this.themeFile + ':ParticleStar');

        var mc = new ParticleStarMovieClip();
        this.mc.addChild(mc);

        var spent = 0;
        var spinEnd = 700;
        var holdEnd = 1500;

        var startAngle = Math.PI * 2 * n;
        var endAngle = startAngle + Math.PI * 1;

        var startRadius = 300;
        var endRadius = 0;

        var startAlpha = 0;
        var endAlpha = 1;

        function refresh() {
            var spin = clamp(scaleDown(0, spinEnd, spent));
            var hold = clamp(scaleDown(0, holdEnd, spent));
            var close = clamp(scaleDown(spinEnd, holdEnd, spent));

            var angle = scaleUp(startAngle, endAngle, lerp(hold));
            var radius = scaleUp(startRadius, endRadius, sinOut(spin));
            var alpha = spent <= spinEnd
                ? scaleUp(startAlpha, endAlpha, sinOut(spin))
                : scaleUp(endAlpha, startAlpha, sinIn(close));

            mc.rotation = angle * 180 / Math.PI; // Fuck degrees!
            mc.x = x + Math.cos(angle) * radius;
            mc.y = y + Math.sin(angle) * radius;
            mc.alpha = alpha;
        }

        refresh();

        var handle = this.updateEvent.subscribe(function updateDestroyParticle(dt) {
            spent += dt;

            if (spent >= holdEnd) {
                mc.parent.removeChild(mc);
                handle.remove();
            } else {
                refresh();
            }
        }.bind(this));

        return handle;
    };

    ParticlesView.prototype.update = function update(dt) {
        this.updateEvent.publish(dt);
    };

    return ParticlesView;
});
