define([ 'q' ], function (Q) {
    function waitForPublish(pubSub) {
        var defer = Q.defer();

        var token = pubSub.subscribe(function (/* ... */) {
            token.remove();
            defer.resolve.apply(defer, arguments);
        });

        return defer.promise;
    }

    return {
        waitForPublish: waitForPublish
    };
});
