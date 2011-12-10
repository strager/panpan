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

    return CutsceneView;
});
