define([ 'view/block' ], function (blockView) {
    function PlayfieldView(model, options) {
        extendDefault(this, {
            blockWidth: 30,
            blockHeight: 30
        }, options);

        this.model = model;
        this.mc = new sp.Sprite();

        var blocks = model.blocks.map(function (block, i) {
            var view = blockView.fromModel(block);
            if (view) {
                this.position(i, view);
                this.mc.addChild(view);
            }
        }, this);
    }

    PlayfieldView.prototype.position = function position(index, mc) {
        var width = this.model.width;
        var xb = index % width;
        var yb = Math.floor(index / width);
        mc.x = xb * this.blockWidth;
        mc.y = yb * this.blockHeight;
    };

    return PlayfieldView;
});
