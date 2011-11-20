define([ 'q' ], function (Q) {
    function stateMachine(transitions) {
        function validateTransitions() {
            transitions.forEach(function (t) {
                if (!t.from || !t.to || !t.name) {
                    throw new Error('Invalid transition: ' + JSON.stringify(t));
                }
            });
        }

        validateTransitions();

        function findTransitions(currentState, name) {
            return transitions.filter(function (transition) {
                return transition.name === name && transition.from === currentState;
            });
        }

        function isTransition(name) {
            return transitions.some(function (transition) {
                return transition.name === name;
            });
        }

        function StateMachine(initialState, callbacks) {
            extend(this, callbacks);

            var currentState = initialState;
            var transitionQueue = Q.ref(null);
            var inBadState = false;

            function checkBadState() {
                if (inBadState) {
                    throw new Error('State machine is in a bad state');
                }
            }

            var self = this;
            function call(fnName, args) {
                if (typeof self[fnName] === 'function') {
                    return self[fnName].apply(null, args);
                }

                // return undefined
            }

            transitions.forEach(function (transition) {
                var name = transition.name;
                this[name] = function () {
                    checkBadState();

                    var args = arguments;

                    if (!this.isTransition(name)) {
                        throw new Error('Invalid transition "' + name + '"');
                    }

                    var t;

                    transitionQueue = transitionQueue
                        .then(function () {
                            var ts = findTransitions(currentState, name);

                            if (ts.length > 1) {
                                var destinations = ts.map(function (t) { return t.to; });
                                throw new Error('Cannot transition "' + name + '" with multiple possible destinations from "' + currentState + '" (' + destinations.join(', '));
                            }

                            if (ts.length === 0) {
                                throw new Error('Cannot transition "' + name + '" with no possible destination from "' + currentState + '"');
                            }

                            t = ts[0];
                        })
                        .then(function () {
                            return call('exit_' + t.from, args);
                        })
                        .then(function () {
                            return call('on_' + t.name, args);
                        })
                        .then(function () {
                            return call('enter_' + t.to, args);
                        })
                        .then(function () {
                            currentState = t.to;
                        });

                    // Run in a separate thread as to not disturb user code
                    Q.fail(transitionQueue, function (err) {
                        inBadState = true;
                    });

                    return transitionQueue;
                };
            }, this);

            this.getCurrentState = function () {
                checkBadState();

                return currentState;
            };
        }

        StateMachine.prototype = {
            isTransition: isTransition,
            canMakeTransition: function (name) {
                return findTransitions(this.getCurrentState(), name).length > 0;
            }
        };

        return StateMachine;
    }

    return stateMachine;
});
