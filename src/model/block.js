define([ ], function () {
    var block = {
        EMPTY: 0,
        BLUE: 1,
        GREEN: 2,
        VIOLET: 3,
        YELLOW: 4
    };

    var nonEmpty = [ block.BLUE, block.GREEN, block.VIOLET, block.YELLOW ];
    block.randomNonEmpty = function block_randomNonEmpty() {
        return nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
    };

    return block;
});
