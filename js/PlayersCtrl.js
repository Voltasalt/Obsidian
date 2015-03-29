angular.module("obsidianApp").controller('PlayersCtrl', function ($scope, $interval, $location, Minecraft) {
    $scope.players = [];

    var update = function() {
        Minecraft.call("players.online.names").then(function(res) {
            $scope.players = res;
            $scope.$apply();
        });
    };
    update();

    var interval = $interval(update, 2000);
    $scope.$on("$destroy", function () {
        $interval.cancel(interval);
    });

    $scope.showPlayer = function(player) {
        $location.path("/players/" + player);
    }
});