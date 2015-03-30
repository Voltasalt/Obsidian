(function () {
    var obsidianApp = angular.module('obsidianApp', ['ngRoute', 'LocalStorageModule', 'ansiToHtml', 'angularModalService', 'ui.codemirror']);
    obsidianApp.config(function ($routeProvider) {
        $routeProvider
            .when("/console", {
                templateUrl: 'partials/console.html',
                controller: 'ConsoleCtrl'
            })
            .when("/files/edit:file*", {
                templateUrl: 'partials/edit.html',
                controller: 'FileEditCtrl'
            })
            .when("/files/view:file*", {
                templateUrl: 'partials/files.html',
                controller: 'FilesCtrl'
            })
            .when("/chat", {
                templateUrl: 'partials/chat.html',
                controller: 'ChatCtrl'
            })
            .when("/connect", {
                templateUrl: 'partials/connect.html',
                controller: 'LoginCtrl'
            })
            .when("/players/:name", {
                templateUrl: 'partials/player.html',
                controller: 'PlayerCtrl'
            })
            .when("/players", {
                templateUrl: 'partials/players.html',
                controller: 'PlayersCtrl'
            })
            .when("/", {
                templateUrl: 'partials/server.html',
                controller: 'IndexCtrl'
            })
            .otherwise({
                redirectTo: "/"
            });
    });

    obsidianApp.factory("Minecraft", function ($rootScope) {
        var dataStream, username, password, tag, handlers, isLoggedIn;
        handlers = {};
        tag = 0;

        var methods = {
            connect: function (ip, port) {
                port = port || 25565;
                dataStream = new WebSocket("ws://" + ip + ":" + port + "/api/2/websocket");

                dataStream.onmessage = (function (data) {
                    var jsonData = JSON.parse(data.data);
                    if (jsonData instanceof Array) {
                        jsonData.forEach(function (resp) {
                            var handler = handlers[resp.tag];
                            if (resp.is_success) {
                                handler.success(resp.success);
                            } else {
                                handler.fail(resp.error);
                            }
                            $rootScope.$apply();
                        });
                    } else if (jsonData instanceof Object) {
                        if (jsonData.result == "success") {
                            handlers[jsonData.tag].success(jsonData.success);
                        } else {
                            handlers[jsonData.tag].fail(jsonData.error);
                        }
                    }
                });

                return dataStream;
            },
            createKey: function (action) {
                var plain = username + action + password;
                return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(plain));
            },
            call: function (action, args) {
                arguments |= [];
                var req = [
                    {
                        "name": action,
                        "key": methods.createKey(action),
                        "username": username,
                        "arguments": args,
                        "tag": (++tag).toString()
                    }
                ];

                dataStream.send("/api/2/call?json=" + encodeURIComponent(JSON.stringify(req)));

                return new Promise(function (resolve, reject) {
                    handlers[(tag).toString()] = {
                        "success": resolve,
                        "fail": reject
                    }
                });
            },
            subscribe: function (stream, get_backlog, callback, error) {
                error = error || function() {};
                var req = [
                    {
                        "name": stream,
                        "key": methods.createKey(stream),
                        "username": username,
                        "arguments": [],
                        "show_previous": get_backlog,
                        "tag": (++tag).toString()
                    }
                ];

                dataStream.send("/api/2/subscribe?json=" + encodeURIComponent(JSON.stringify(req)));

                handlers[(tag).toString()] = {
                    "success": callback,
                    "fail": error
                };
            },
            authenticate: function (user, pass) {
                username = user;
                password = pass;
                return new Promise(function (resolve, reject) {
                    methods.call("server").then(function () {
                        isLoggedIn = true;
                        resolve();
                    }, function () {
                        reject();
                    });
                });
            },
            isLoggedIn: function () {
                return isLoggedIn;
            }
        };
        return methods;
    });

    var generateStreamFactory = function(stream, backlog) {
        return function($rootScope, Minecraft) {
            var buffer = [];
            var callbacks = {};

            Minecraft.subscribe(stream, backlog, function(data) {
                buffer.push(data);
                Object.keys(callbacks).forEach(function(key) {
                    callbacks[key](data);
                });

                $rootScope.$apply();
            });

            return {
                register: function(cd, listenerTag, replay) {
                    callbacks[listenerTag] = cd;

                    if (replay) {
                        if (replay instanceof Number) {
                            buffer.slice(-replay).forEach(cd);
                        } else {
                            buffer.forEach(cd);
                        }
                    }
                }
            };
        }
    };

    obsidianApp.factory("Performance", generateStreamFactory("performance", true));
    obsidianApp.factory("Console", generateStreamFactory("console", true));
    obsidianApp.factory("Chat", generateStreamFactory("chat", true));

    obsidianApp.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    obsidianApp.run(function ($rootScope, $location, Minecraft) {
        $rootScope.$on("$routeChangeStart", function () {
            if ($location.path() != "/connect") {
                if (!Minecraft.isLoggedIn()) {
                    $location.path("/connect");
                }
            }
        });
    });
})();