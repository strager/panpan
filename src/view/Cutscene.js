define([ 'asset', 'view/Dialog' ], function (asset, DialogView) {
    function CutsceneView(options) {
        extendDefault(this, {
            cutsceneName: 'Cutscene1',
            themeFile: 'characters.swf'
        }, options);

        this.events = {
        };

        var CutsceneMovieClip = asset.get(this.themeFile + ':' + this.cutsceneName);
        this.mc = new CutsceneMovieClip();

        this.dialog = new DialogView(this.mc.dialogBox);
    }

    CutsceneView.prototype.reorient = function reorient(screen) {
        screen.scaleElement(this.dialog.mc, 0.7);
        screen.alignElement(this.dialog.mc, 1, 1);
    };

    return CutsceneView;
});
