define([ ], function () {
    var block = {
        EMPTY: 0,
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        //E: 5,
        SOLID: 6
    };

    var nonEmpty = [ block.A, block.B, block.C, block.D ];
    block.randomNonEmpty = function block_randomNonEmpty() {
        return nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
    };

    return block;
});
