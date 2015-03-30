angular.module("obsidianApp").controller('FilesCtrl', function($scope, $location, $routeParams, Minecraft) {
    $scope.path = $routeParams.file;
    $scope.breadcrumb = $scope.path.split("/");

    $scope.files = [];

    $scope.dirs = $scope.path == "/" ? [] : [{
        name: "..",
        fullPath: $scope.path.substr(0, $scope.path.lastIndexOf("/", $scope.path.length - 2) + 1)
    }];

    Minecraft.call("files.list_directory", ["." + $scope.path]).then(function(data) {
        data.forEach(function(file) {
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

    $scope.move = function(where) {
        $location.path("/files/view" + where)
    };

    $scope.edit = function(file) {
        $location.path("/files/edit" + file.fullPath);
    };
});