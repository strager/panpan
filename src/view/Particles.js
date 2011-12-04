define([ 'asset', 'util/PubSub', 'view/Animation', 'util/ease' ], function (asset, PubSub, Animation, ease) {
    // TODO Object pooling
    // (sounds like a good idea, right?)

    function ParticlesView(options) {
        extendDefault(this, {
            themeFile: 'main.swf'
        }, options);

        this.mc = new sp.Sprite();
        this.updateEvent = new PubSub();
    }

    ParticlesView.prototype.spawnDestroyParticle = function spawnDestroyParticle(x, y, n, spinEnd, holdEnd) {
        var ParticleStarMovieClip = asset.get(this.themeFile + ':ParticleStar');

        var mc = new ParticleStarMovieClip();
        this.mc.addChild(mc);

        var spinEndP = ease.scaleDown(0, holdEnd, spinEnd);
        var holdEndP = 1;

        var startAngle = Math.PI * 2 * n;
        var endAngle = startAngle + Math.PI * 1;

        var startRadius = 200;
        var endRadius = 0;

        var startAlpha = 0;
        var endAlpha = 1;

        var anim = new Animation(function refresh(p) {
            var spin = ease.clamp(ease.scaleDown(0, spinEndP, p));
            var hold = ease.clamp(ease.scaleDown(0, holdEndP, p));
            var close = ease.clamp(ease.scaleDown(spinEndP, holdEndP, p));

            var angle = ease.scaleUp(startAngle, endAngle, ease.lerp(hold));
            var radius = ease.scaleUp(startRadius, endRadius, ease.sinOut(spin));
            var alpha = p <= spinEndP
                ? ease.scaleUp(startAlpha, endAlpha, ease.sinOut(spin))
                : ease.scaleUp(endAlpha, startAlpha, ease.sinIn(close));

            mc.rotation = angle * 180 / Math.PI; // Fuck degrees!
            mc.x = x + Math.cos(angle) * radius;
            mc.y = y + Math.sin(angle) * radius;
            mc.alpha = alpha;
        }, holdEnd);

        var handle = this.updateEvent.subscribe(function updateDestroyParticle(dt) {
            anim.update(dt);
            if (!anim.isActive()) {
                mc.parent.removeChild(mc);
                handle.remove();
            }
        });

        return handle;
    };

    ParticlesView.prototype.update = function update(dt) {
        this.updateEvent.publish(dt);
    };

    return ParticlesView;
});
