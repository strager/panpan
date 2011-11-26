define([ 'view/block', 'asset', 'util/PubSub' ], function (blockView, asset, PubSub) {
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

        this.blocks = [ ];

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
        this.setBlockViewAt(x, y, view);
        this.mcBlocks.addChild(view);
    };

    PlayfieldView.prototype.getBlockViewAt = function getBlockViewAt(x, y) {
        if (this.blocks.length <= y)    return null;
        if (this.blocks[y].length <= x) return null;
        return this.blocks[y][x];
    };

    PlayfieldView.prototype.removeBlockViewAt = function removeBlockViewAt(x, y) {
        if (this.getBlockViewAt(x, y)) {
            this.blocks[y][x] = null;
        }
    };

    PlayfieldView.prototype.setBlockViewAt = function setBlockViewAt(x, y, view) {
        var grid = this.blocks;
        while (grid.length <= y) {
            grid.push([ ]);
        }
        var row = grid[y];
        while (row.length <= x) {
            row.push(null);
        }

        if (row[x]) {
            die("Cannot insert block view; something already exists here");
        }

        row[x] = view;
    };

    PlayfieldView.prototype.position = function position(mc, x, y) {
        mc.x = x * this.blockWidth;
        mc.y = -y * this.blockHeight;
    };

    PlayfieldView.prototype.moveCursorTo = function moveCursorTo(x, y) {
        this.position(this.cursor, x, y);
    };

    PlayfieldView.prototype.swapBlocks = function swapBlocks(x1, y1, x2, y2) {
        var v1 = this.getBlockViewAt(x1, y1);
        var v2 = this.getBlockViewAt(x2, y2);

        if (v1) {
            this.removeBlockViewAt(x1, y1);
            this.position(v1, x2, y2);
        }
        if (v2) {
            this.removeBlockViewAt(x2, y2);
            this.position(v2, x1, y1);
        }

        if (v1) {
            this.setBlockViewAt(x2, y2, v1);
        }
        if (v2) {
            this.setBlockViewAt(x1, y1, v2);
        }
    };

    PlayfieldView.prototype.fallBlock = function fallBlock(x, y) {
        this.swapBlocks(x, y, x, y - 1);
    };

    PlayfieldView.prototype.haltBlock = function haltBlock(x, y) {
        var view = this.getBlockViewAt(x, y);
        view.gotoAndPlay('halt');
    };

    PlayfieldView.prototype.startDestroyBlock = function startDestroyBlock(x, y) {
        var view = this.getBlockViewAt(x, y);
        view.gotoAndPlay('destroy');
    };

    PlayfieldView.prototype.endDestroyBlock = function endDestroyBlock(x, y) {
        var view = this.getBlockViewAt(x, y);
        this.mcBlocks.removeChild(view);
        this.removeBlockViewAt(x, y);
    };

    PlayfieldView.prototype.resetBlocks = function resetBlocks() {
        this.blocks = [ ];
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

    PlayfieldView.prototype.updateTurnCount = function updateTurnCount() {
        this.mc.turnCount.text = this.turnCount + '/' + this.maxTurnCount;
    };

    PlayfieldView.prototype.showCursor = function showCursor() {
        this.cursor.visible = true;
    };

    PlayfieldView.prototype.hideCursor = function hideCursor() {
        this.cursor.visible = false;
    };

    return PlayfieldView;
});
