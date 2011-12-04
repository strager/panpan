define('util/ease', [ ], function () {
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

    return {
        clamp: clamp,
        scaleUp: scaleUp,
        scaleDown: scaleDown,
        lerp: lerp,
        sinIn: sinIn,
        sinOut: sinOut,
        smoothstep: smoothstep
    }
});
