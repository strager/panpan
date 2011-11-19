define([ 'q' ], function (Q) {
    var ASSET_ROOT = 'assets/';
    var loads = { };

    var ASSET_NAME_RE = /^([^:]*)(:(.*))?$/;

    function pullAsset(containerPromise, assetName) {
        if (typeof assetName === 'undefined') {
            return containerPromise;
        }

        function pullAsset2(container) {
            if (assetName === '') {
                return container.content;
            } else {
                return container.applicationDomain.getDefinition(assetName);
            }
        }

        // Try to load the asset as soon as possible; don't
        // wait for Q to do its thing.
        if (Q.isResolved(containerPromise)) {
            return Q.ref(pullAsset2(containerPromise.valueOf()));
        } else {
            return Q.when(containerPromise, pullAsset2);
        }
    }

    function load(name) {
        var match = ASSET_NAME_RE.exec(name);
        var containerFilename = ASSET_ROOT + match[1];
        var assetName = match[3];

        if (hasOwn(loads, containerFilename)) {
            return pullAsset(loads[name], assetName);
        }

        var containerDefer = Q.defer();

        var loader = new sp.Loader();
        loader.contentLoaderInfo.addEventListener(sp.Event.COMPLETE, function handler(event) {
            containerDefer.resolve(event.target);

            event.target.removeEventListener(event.type, handler);
        });
        // TODO Error events
        loader.load(new sp.URLRequest(containerFilename));

        return pullAsset(containerDefer.promise, assetName);
    }

    function get(name) {
        var result = load(name);
        if (!Q.isResolved(result)) {
            die("Asset " + name + " must be preloaded");
        }

        return result.valueOf();
    }

    return {
        load: load,
        get: get
    };
});
