define([ 'util/PubSub', 'ui' ], function (PubSub, ui) {
    function DialogView(mc) {
        this.mc = mc;

        var ev = this.events = {
            page: new PubSub()
        };

        ui.button(this.mc, function () {
            ev.page.publish();
        });
    }

    DialogView.prototype.setTextNow = function setTextNow(text) {
        this.mc.dialogText.text = text;
    };

    DialogView.prototype.transitionTextTo = function transitionTextTo(text) {
        // TODO
        this.setTextNow(text);
    };

    DialogView.prototype.showPageIndicator = function showPageIndicator() {
        this.mc.continueButton.visible = true;
    };

    DialogView.prototype.hidePageIndicator = function hidePageIndicator() {
        this.mc.continueButton.visible = false;
    };

    return DialogView;
});
