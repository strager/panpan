define([ ], function () {
    function Screen(stage) {
        this.popupLayerMc = new sp.Sprite();
        this.playfieldLayerMc = new sp.Sprite();

        this.mc = new sp.Sprite();
        this.mc.addChild(this.playfieldLayerMc);
        this.mc.addChild(this.popupLayerMc);

        stage.addChild(this.mc);

        this.popupX = stage.stageWidth / 2;
        this.popupY = stage.stageHeight / 2;

        this.playfieldX = stage.stageWidth / 2;
        this.playfieldY = stage.stageHeight;
    }

    Screen.prototype.setPlayfield = function setPlayfield(playfield) {
        var mc = playfield.mc;
        mc.x = this.playfieldX;
        mc.y = this.playfieldY;
        this.playfieldLayerMc.addChild(mc);
    };

    Screen.prototype.setPopup = function setPopup(popup) {
        this.clearPopup();

        var mc = popup.mc;
        mc.x = this.popupX;
        mc.y = this.popupY;
        this.popupLayerMc.addChild(mc);
    };

    Screen.prototype.clearPopup = function clearPopup() {
        while (this.popupLayerMc.children) {
            this.popupLayerMc.removeChildAt(0);
        }
    };

    return Screen;
});
