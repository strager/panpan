define([ 'asset', 'util/PubSub', 'ui' ], function (asset, PubSub, ui) {
    function LevelSelectView(world, options) {
        extendDefault(this, {
            themeFile: 'main.swf'
        }, options);

        // TODO Only show levels in world

        var themeFile = this.themeFile;

        var LevelSelectPageMovieClip = asset.get(themeFile + ':LevelSelectPage');

        var page = new LevelSelectPageMovieClip();

        var re = /^level(\d+)$/;
        page.children.forEach(function (child) {
            var match = re.exec(child.name);
            if (match) {
                var levelID = +match[1] - 1;
                child.levelID = levelID;
                child.text.text = levelID + 1;
                child.mouseChildren = false;
                child.mouseEnabled = true;

                // TODO Delegate
                ui.button(child, function () {
                    events.select.publish(child.levelID);
                });
            }
        });

        this.mc = new sp.Sprite();
        this.mc.addChild(page);

        var events = this.events = {
            select: new PubSub()
        };
    }

    LevelSelectView.prototype.reorient = function reorient(screen) {
        screen.scaleElement(this.mc, 0.9);
        screen.alignElement(this.mc, 0.5, 0.5);
    };

    return LevelSelectView;
});
