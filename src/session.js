define([ ], function () {
    // TODO Find a better way to get a unique string
    var sessionID = Date.now() + '.' + Math.random();

    function getUserID() {
        // Let's hope Spaceport is initialized!

        // As you can tell, I'm really unsure
        // about this function...

        var so = new sp.SharedObject('session');
        // TODO Get iOS/Android device ID

        if (typeof so.data.userID === 'undefined') {
            // TODO Get user ID from server or something?
            so.data.userID = sessionID;
            so.flush();
        }

        return so.data.userID;
    }

    function getSessionID() {
        return sessionID;
    }

    function getSessionInformation() {
        return {
            stageWidth: sp.stage.stageWidth,
            stageHeight: sp.stage.stageHeight,
            sessionID: getSessionID(),
            userID: getUserID(),
            platform: sp.Capabilities.platform,
            // TODO More information
        };
    }

    return {
        getUserID: getUserID,
        getSessionID: getSessionID,
        getSessionInformation: getSessionInformation
    };
});
