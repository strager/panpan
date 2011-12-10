define([ 'model/Cutscene', 'q', 'view/Dialog' ], function (Cutscene, Q, DialogView) {
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
        intro: function intro(stage) {
            var dialog = new DialogView();
            stage.addChild(dialog.mc);

            return seq([
                function () {
                    dialog.setTextNow('Hello, world!');
                    dialog.showPageIndicator();
                    return Cutscene.waitForPublish(dialog.events.page);
                },
                function () {
                    dialog.transitionTextTo('This is a cool test');
                    return Cutscene.waitForPublish(dialog.events.page);
                }
            ]);
        }
    };
});
