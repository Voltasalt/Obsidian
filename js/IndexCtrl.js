angular.module("obsidianApp").controller('IndexCtrl', function ($scope, Minecraft, Performance) {
    $scope.mem = {
        current: 0,
        max: 0
    };
    $scope.disk = {
        current: 0,
        max: 0
    };
    $scope.tps = 0;

    Performance.register(function (data) {
        $scope.mem.current = data.memoryUsage;
        $scope.mem.max = data.memoryMax;

        $scope.disk.current = data.diskUsage;
        $scope.disk.max = data.diskMax;

        $scope.tps = data.clockRate;
    }, "index", 1)
});