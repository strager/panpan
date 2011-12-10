define([ 'asset', 'util/PubSub', 'ui' ], function (asset, PubSub, ui) {
    function DialogView(options) {
        extendDefault(this, {
            themeFile: 'characters.swf'
        }, options);

        var ev = this.events = {
            page: new PubSub()
        };

        var DialogBoxMovieClip = asset.get(this.themeFile + ':DialogBox');
        this.mcDialogBox = new DialogBoxMovieClip();
        ui.button(this.mcDialogBox, function () {
            ev.page.publish();
        });

        this.mc = new sp.Sprite();
        this.mc.addChild(this.mcDialogBox);
    }

    DialogView.prototype.setTextNow = function setTextNow(text) {
        this.mcDialogBox.dialogText.text = text;
    };

    DialogView.prototype.transitionTextTo = function transitionTextTo(text) {
        // TODO
        this.setTextNow(text);
    };

    DialogView.prototype.showPageIndicator = function showPageIndicator() {
        this.mcDialogBox.continueButton.visible = true;
    };

    DialogView.prototype.hidePageIndicator = function hidePageIndicator() {
        this.mcDialogBox.continueButton.visible = false;
    };

    return DialogView;
});
