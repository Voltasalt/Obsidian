angular.module("obsidianApp").controller('PlayerCtrl', function ($scope, $interval, ModalService, $routeParams, Minecraft) {
    var player = $routeParams.name;
    $scope.ip = "0.0.0.0";

    $scope.name = player;

    var makeCommandModal = function(title, command) {
        return function() {
            ModalService.showModal({
                templateUrl: "modalContent.html",
                controller: "PlayerCtrlModal",
                inputs: {
                    title: title,
                    command: command
                }
            }).then(function(modal) {
                modal.element.modal();
            })
        }
    };

    var update = function () {
        Minecraft.call("players.name", [player])
            .then(function (data) {
                $scope.ip = data.ip.substr(1).split(":")[0];

                $scope.pm = makeCommandModal("Send PM to " + player, "msg " + player);
                $scope.kick = makeCommandModal("Kick " + player, "kick " + player);
                $scope.ban = makeCommandModal("Ban " + player, "ban " + player);
                $scope.ipban = makeCommandModal("Ban " + player + "'s IP (" + $scope.ip + ")", "banip " + $scope.ip);
            });
    };

    var interval = $interval(update, 2000);
    $scope.$on("$destroy", function () {
        $interval.cancel(interval);
    });

    update();
});

angular.module("obsidianApp").controller('PlayerCtrlModal', function($scope, Minecraft, title, command, close) {
    $scope.title = title;

    $scope.ok = function() {
        Minecraft.call("server.run_command", [command + ($scope.msg.length > 0 ? " " + $scope.msg : "")]);
    };

    $scope.cancel = function() {
        close(undefined, 200)
    };
});