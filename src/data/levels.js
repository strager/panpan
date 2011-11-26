define([ ], function () {
    return [
        {
            width: 6,
            height: 6,
            maxTurns: 1,
            minStreakSize: 3,
            blocks: [
                0,2,2,1,0,1,
                0,0,0,2,0,1,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
            ]
        }, {
            width: 6,
            height: 6,
            minStreakSize: 3,
            maxTurns: 1,
            blocks: [
                0,2,3,4,0,0,
                0,0,4,3,0,0,
                0,0,3,4,0,0,
                0,0,2,2,0,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
            ]
        }, {
            width: 6,
            height: 6,
            minStreakSize: 3,
            maxTurns: 2,
            blocks: [
                0,1,1,2,3,0,
                0,0,2,3,1,0,
                0,0,0,2,3,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
                0,0,0,0,0,0,
            ]
        }, {
            width: 6,
            height: 6,
            minStreakSize: 3,
            maxTurns: 3,
            blocks: [
                0,0,2,1,1,0,
                0,0,4,2,2,0,
                0,0,3,4,1,0,
                0,0,3,2,4,0,
                0,0,0,0,3,0,
                0,0,0,0,0,0,
            ]
        }, {
            width: 6,
            height: 6,
            maxTurns: 3,
            minStreakSize: 3,
            blocks: [
                1,2,3,2,1,2,
                4,4,3,3,2,0,
                0,1,1,0,2,0,
                0,0,4,0,1,0,
                0,0,1,0,0,0,
                0,0,0,0,0,0,
            ]
        }
    ];
});
