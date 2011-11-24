define([ ], function () {
    function PubSub() {
        this.subscribers = [ ];
    }

    PubSub.prototype.publish = function publish() {
        var args = Array.prototype.slice.call(arguments);

        this.subscribers.forEach(function (subscriber) {
            if (!subscriber) {
                return;
            }

            subscriber.apply(null, args);
        });
    };

    PubSub.prototype.subscribe = function subscribe(callback, context) {
        var subscribers = this.subscribers;

        var index = subscribers.length;
        subscribers.push(callback.bind(context));

        return {
            unsubscribe: function unsubscribe() {
                delete subscribers[index];
            }
        };
    };

    PubSub.prototype.pipeTo = function pipeTo(otherPubSub) {
        return this.subscribe(function () {
            otherPubSub.publish.apply(otherPubSub, arguments);
        });
    };

    return PubSub;
});
