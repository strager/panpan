define([ 'asset', 'util/PubSub', 'ui' ], function (asset, PubSub, ui) {
    function LevelSelectView(world, options) {
        extendDefault(this, {
            themeFile: 'main.swf'
        }, options);

        var themeFile = this.themeFile;

        var LevelSelectPageMovieClip = asset.get(themeFile + ':LevelSelectPage');

        var page = new LevelSelectPageMovieClip();

        var re = /^level(\d+)$/;
        page.children.forEach(function (child) {
            var match = re.exec(child.name);
            if (match) {
                var levelIndex = +match[1] - 1;
                var level = world.levels[levelIndex];
                if (!level) {
                    child.visible = false;
                    return;
                }

                child.levelIndex = levelIndex;
                child.text.text = levelIndex + 1; // Humans are 1-based
                child.mouseChildren = false;
                child.mouseEnabled = true;

                // TODO Delegate
                ui.button(child, function () {
                    events.select.publish(child.levelIndex);
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
