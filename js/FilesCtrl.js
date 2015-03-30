angular.module("obsidianApp").controller('FilesCtrl', function ($scope, $rootScope, $http, $location, $routeParams, Minecraft) {
    $scope.path = $routeParams.file;
    $scope.breadcrumb = $scope.path.split("/");

    $rootScope.files_clipboard = $rootScope.files_clipboard || {
        mode: "none",
        file: ""
    };

    $scope.dirs = $scope.path == "/" ? [] : [{
        name: "..",
        fullPath: $scope.path.substr(0, $scope.path.lastIndexOf("/", $scope.path.length - 2) + 1)
    }];

    var load = function() {
        $scope.files = [];

        Minecraft.call("files.list_directory", ["." + $scope.path]).then(function (data) {
            data.forEach(function (file) {
                if (file.lastIndexOf("/") != file.length - 1) {
                    var name = file.substr(file.lastIndexOf("/") + 1);
                    $scope.files.push({
                        name: name,
                        fullPath: file.substr(1)
                    });
                } else {
                    var name = file.substr(file.lastIndexOf("/", file.length - 2) + 1);
                    $scope.dirs.push({
                        name: name,
                        fullPath: file.substr(1)
                    });
                }
            });

            $scope.$apply();
        });
    };
    load();

    $scope.move = function (where) {
        $location.path("/files/view" + where)
    };

    $scope.edit = function (file) {
        $location.path("/files/edit" + file.fullPath);
    };

    $scope.cut = function (file) {
        $rootScope.files_clipboard.mode = "cut";
        $rootScope.files_clipboard.file = file.fullPath;
    };

    $scope.copy = function (file) {
        $rootScope.files_clipboard.mode = "copy";
        $rootScope.files_clipboard.file = file.fullPath;
    };

    $scope.paste = function() {
        var from = $rootScope.files_clipboard.file;
        var to = $scope.path + from.substr(from.lastIndexOf("/", from.length - 2) + 1);
        Minecraft.call("files." + ($rootScope.files_clipboard.mode == "copy" ? "copy" : "move"), ["." + from, "." + to]).then(function() {
            $rootScope.files_clipboard.mode = "none";
            load();
        })
    };

    angular.element("#file-btn").change(function () {
        $scope.upload();
    });

    $scope.upload = function () {
        var file = angular.element("#file-btn").prop("files")[0];
        var fname = "." + $scope.path + file.name;

        Minecraft.call("files.delete", [fname]).then(function () {
            var callbacks = [];

            for (var s = 0; s < file.size; s += 16384) {
                function inner(ss) {
                    callbacks.push(function (callback) {
                        console.log("Starting section " + ss);

                        var slice = file.slice(ss, ss + 16384);
                        var fd = new FileReader();
                        fd.onload = function (data) {
                            console.log(data.target.result);
                            return Minecraft.call("files.append", [fname, data.target.result]).then(function () {
                                console.log("Ending section " + ss);

                                callback();
                            });
                        };
                        fd.readAsBinaryString(slice);
                    });
                }
                inner(s);
            }

            window.async.series(callbacks);
        });
    }
});