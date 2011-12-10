define([ 'model/Cutscene', 'q' ], function (Cutscene, Q) {
    function seq(fns) {
        // Sequences promise functions together serially
        // like Q.when(fns[0]())
        //       .then(fns[1])
        //       .then([fns[2])
        //       ...
        return fns.reduce(function (acc, fn) {
            return Q.when(acc, fn);
        }, null);
    }

    return {
        intro: function intro(cutscene) {
            var d = cutscene.dialog;

            return seq([
                function () {
                    d.setTextNow('Hello, world!');
                    d.showPageIndicator();
                    return Cutscene.waitForPublish(d.events.page);
                },
                function () {
                    d.transitionTextTo('This is a cool test');
                    return Cutscene.waitForPublish(d.events.page);
                }
            ]);
        }
    };
});
