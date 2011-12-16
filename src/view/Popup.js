define([ 'asset', 'ui' ], function (asset, ui) {
    var classNames = {
        'failed_moves': 'PopupFailedMoves',
        'failed_match': 'PopupFailedMatch',
        'won': 'PopupWon',
        'end': 'PopupEnd'
    };

    function PopupView(name, options) {
        if (!hasOwn(classNames, name)) {
            die("Invalid popup name: " + name);
        }

        extendDefault(this, {
            themeFile: 'main.swf'
        }, options);

        var PopupMovieClip = asset.get(this.themeFile + ':' + classNames[name]);
        this.mc = new PopupMovieClip();

        var buttonRe = /^(.*)Button$/;
        var buttonNames = Object.keys(this.mc).filter(buttonRe.test.bind(buttonRe));
        buttonNames.forEach(function (buttonName) {
            var actionName = 'on_' + buttonRe.exec(buttonName)[1];
            if (!hasOwn(options, actionName)) {
                die("Artwork has button " + buttonName + " but code does not");
            }

            ui.button(this.mc[buttonName], options[actionName]);
        }, this);
    }

    return PopupView;
});
