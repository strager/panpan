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
                    if (sp.Capabilities.input.touchScreen) {
                        d.setTextNow("Slide blocks horizontally by\ndragging on the screen!\n(Tap to continue.)");
                    } else if (sp.Capabilities.input.keyboard) {
                        d.setTextNow("Use the arrow keys and the \"X\" key!\n(Press \"X\" to continue.)");
                    } else {
                        d.setTextNow("Well, I don't know what to tell you...");
                    }

                    d.showPageIndicator();
                    return Cutscene.waitForPublish(d.events.page);
                }
            ]);
        }
    };
});
