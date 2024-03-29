define([ 'view/block', 'asset', 'util/PubSub', 'util/Array2D', 'view/Animation', 'util/ease' ], function (blockView, asset, PubSub, Array2D, Animation, ease) {
    function PlayfieldView(options) {
        extendDefault(this, {
            blockWidth: null,
            blockHeight: null,
            themeFile: 'main.swf'
        }, options);

        this.blockOptions = extendDefault({ }, {
            themeFile: this.themeFile
        }, options && options.blockOptions);

        if (this.blockWidth === null || this.blockHeight === null) {
            var PositionsMovieClip = asset.get(this.themeFile + ':BlockPositions');
            var positions = new PositionsMovieClip();

            if (this.blockWidth === null) {
                this.blockWidth = positions.topRight.x - positions.topLeft.x;
            }
            if (this.blockHeight === null) {
                this.blockHeight = positions.bottomLeft.y - positions.topLeft.y;
            }
        }

        var PlayfieldMovieClip = asset.get(this.themeFile + ':Playfield');
        this.mc = new PlayfieldMovieClip();

        var cornerX = this.mc.corner.x;
        var cornerY = this.mc.corner.y;
        var cornerIndex = this.mc.getChildIndex(this.mc.corner);

        this.mcBlocks = new sp.Sprite();
        this.mcBlocks.x = cornerX;
        this.mcBlocks.y = cornerY;

        var CursorMovieClip = asset.get(this.themeFile + ':Cursor');
        this.cursor = new CursorMovieClip();

        this.mcOverlay = new sp.Sprite();
        this.mcOverlay.x = cornerX;
        this.mcOverlay.y = cornerY;
        this.mcOverlay.addChild(this.cursor);

        this.mc.addChildAt(this.mcOverlay, cornerIndex);
        this.mc.addChildAt(this.mcBlocks, cornerIndex);

        this.blocks = new Array2D();
        this.blockAnimations = new Array2D();

        this.turnCount = 0;
        this.maxTurnCount = 0;
        this.updateTurnCount();

        this.events = {
            blockHoldBegin: new PubSub(), // x, y
            blockHoldMove: new PubSub(),  // x, y
            blockHoldEnd: new PubSub()    // x, y
        };

        var tpid = null;
        var active = false;
        var blockX, blockY;
        var oldBlockX, oldBlockY;
        var self = this;

        function removeMouseListeners() {
            self.mcBlocks.stage.removeEventListener(sp.MouseEvent.MOUSE_UP, mouseUp);
            self.mcBlocks.stage.removeEventListener(sp.TouchEvent.TOUCH_END, mouseUp);
            self.mcBlocks.stage.removeEventListener(sp.MouseEvent.MOUSE_MOVE, mouseMove);
            self.mcBlocks.stage.removeEventListener(sp.TouchEvent.TOUCH_MOVE, mouseMove);
        }

        // We reuse this point to reduce allocations.
        // (Fuck your interfaces, Flash.  And fuck tupleless
        // languages.)
        var p = new sp.Point();

        // Sets blockX, blockY to equal the block's
        // (game-space) coordinates.
        function stagePointToBlock(stageX, stageY) {
            p.x = stageX;
            p.y = stageY;
            var local = self.mcBlocks.globalToLocal(p);
            blockX = Math.round(local.x / self.blockWidth);
            blockY = -Math.round(local.y / self.blockHeight);
        }

        function mouseUp(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }
            active = false;
            event.stopPropagation();

            stagePointToBlock(event.stageX, event.stageY);

            if (blockX !== oldBlockX) {
                self.events.blockHoldMove.publish(blockX, oldBlockY, oldBlockX, oldBlockY);
            }

            self.events.blockHoldEnd.publish(blockX, oldBlockY);
        }

        function mouseMove(event) {
            if (!active || event.touchPointID !== tpid) {
                return;
            }
            event.stopPropagation();

            stagePointToBlock(event.stageX, event.stageY);

            // We ignore Y changes here
            if (blockX !== oldBlockX) {
                self.events.blockHoldMove.publish(blockX, oldBlockY, oldBlockX, oldBlockY);
            }

            oldBlockX = blockX;
        }

        function mouseDown(event) {
            if (active || !self.mcBlocks.stage) {
                return;
            }
            active = true;
            tpid = event.touchPointID;

            event.stopPropagation();

            self.mcBlocks.stage.addEventListener(sp.MouseEvent.MOUSE_UP, mouseUp);
            self.mcBlocks.stage.addEventListener(sp.TouchEvent.TOUCH_END, mouseUp);
            self.mcBlocks.stage.addEventListener(sp.MouseEvent.MOUSE_MOVE, mouseMove);
            self.mcBlocks.stage.addEventListener(sp.TouchEvent.TOUCH_MOVE, mouseMove);

            stagePointToBlock(event.stageX, event.stageY);

            self.events.blockHoldBegin.publish(blockX, blockY);

            oldBlockX = blockX;
            oldBlockY = blockY;
        }

        this.mcBlocks.addEventListener(sp.MouseEvent.MOUSE_DOWN, mouseDown);
        this.mcBlocks.addEventListener(sp.TouchEvent.TOUCH_BEGIN, mouseDown);
    }

    PlayfieldView.prototype.placeBlock = function placeBlock(x, y, block) {
        var view = blockView.fromModel(block, this.blockOptions);
        this.position(view, x, y);
        this.blocks.set(x, y, view);
        this.mcBlocks.addChild(view);
    };

    PlayfieldView.prototype.getStagePosition = function getStagePosition(x, y) {
        return this.mcBlocks.localToGlobal(this.getLocalPosition(x, y));
    };

    PlayfieldView.prototype.getLocalPosition = function getLocalPosition(x, y) {
        return new sp.Point(
            x * this.blockWidth,
            -y * this.blockHeight
        );
    };

    PlayfieldView.prototype.position = function position(mc, x, y) {
        mc.x = x * this.blockWidth;
        mc.y = -y * this.blockHeight;
    };

    PlayfieldView.prototype.moveCursorTo = function moveCursorTo(x, y) {
        this.position(this.cursor, x, y);
    };

    PlayfieldView.prototype.swapBlocks = function swapBlocks(x1, y1, x2, y2) {
        var v1 = this.blocks.get(x1, y1, null);
        var v2 = this.blocks.get(x2, y2, null);

        this.haltAnimationsAt(x1, y1);
        this.haltAnimationsAt(x2, y2);

        if (v1) {
            this.blocks.remove(x1, y1);

            var end = this.getLocalPosition(x2, y2);
            var anim = Animation.move(v1, end.x, end.y, 200, ease.sinOut);
            this.blockAnimations.set(x2, y2, anim);
        }
        if (v2) {
            this.blocks.remove(x2, y2);

            var end = this.getLocalPosition(x1, y1);
            var anim = Animation.move(v2, end.x, end.y, 200, ease.sinOut);
            this.blockAnimations.set(x1, y1, anim);
        }

        if (v1) {
            this.blocks.set(x2, y2, v1);
        }
        if (v2) {
            this.blocks.set(x1, y1, v2);
        }
    };

    PlayfieldView.prototype.fallBlock = function fallBlock(x, y) {
        this.swapBlocks(x, y, x, y - 1);
    };

    PlayfieldView.prototype.haltBlock = function haltBlock(x, y) {
        var view = this.blocks.get(x, y);
        view.gotoAndPlay('halt');
    };

    PlayfieldView.prototype.startDestroyBlock = function startDestroyBlock(x, y) {
        var view = this.blocks.get(x, y);
        view.gotoAndPlay('destroy');
    };

    PlayfieldView.prototype.endDestroyBlock = function endDestroyBlock(x, y) {
        var view = this.blocks.get(x, y);
        this.mcBlocks.removeChild(view);
        this.blocks.remove(x, y);
    };

    PlayfieldView.prototype.resetBlocks = function resetBlocks() {
        this.blockAnimations.forEach(function (anim) {
            anim.halt();
        });
        this.blockAnimations.clear();

        this.blocks.clear();
        while (this.mcBlocks.children) {
            this.mcBlocks.removeChildAt(0);
        }
    };

    PlayfieldView.prototype.setMaxTurnCount = function setMaxTurnCount(maxTurnCount) {
        this.maxTurnCount = maxTurnCount;
        this.updateTurnCount();
    };

    PlayfieldView.prototype.setTurnCount = function setTurnCount(turnCount) {
        this.turnCount = turnCount;
        this.updateTurnCount();
    };

    PlayfieldView.prototype.setLevelName = function setLevelName(levelName) {
        this.mc.levelName.text = 'Level ' + levelName;
    };

    PlayfieldView.prototype.updateTurnCount = function updateTurnCount() {
        this.mc.turnCount.text = this.turnCount + '/' + this.maxTurnCount;
    };

    PlayfieldView.prototype.showCursor = function showCursor() {
        this.cursor.visible = true;
    };

    PlayfieldView.prototype.hideCursor = function hideCursor() {
        this.cursor.visible = false;
    };

    PlayfieldView.prototype.haltAnimationsAt = function haltAnimationsAt(x, y) {
        var anim = this.blockAnimations.get(x, y, null);
        if (anim) {
            anim.halt();
            this.blockAnimations.remove(x, y);
        }
    };

    PlayfieldView.prototype.update = function update(dt) {
        this.blockAnimations.forEach(function (anim) {
            anim.update(dt);
        });
    };

    return PlayfieldView;
});
