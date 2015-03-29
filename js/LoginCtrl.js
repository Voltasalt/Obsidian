angular.module('obsidianApp').controller('LoginCtrl', function ($scope, $location, Minecraft, localStorageService) {
    $scope.server = {};

    if (localStorageService.get("ip")) {
        $scope.server.hostname = localStorageService.get("ip") + ":" + localStorageService.get("port");
        $scope.server.username = localStorageService.get("user");
        $scope.server.password = localStorageService.get("pass");
    }

    $scope.connecting = false;

    $scope.text = "Connect";

    $scope.connect = function () {
        var ip = ($scope.server.hostname || "localhost");
        var port = ip.split(":")[1] || 25565;
        ip = ip.split(":")[0];

        var username = $scope.server.username || "default";
        var password = $scope.server.password || "default";

        $scope.connecting = true;
        $scope.text = "Connecting";

        var ws = Minecraft.connect(ip, port);

        ws.onopen = function () {
            Minecraft.authenticate(username, password).then(function () {
                $scope.connecting = false;

                localStorageService.set("ip", ip);
                localStorageService.set("port", port);
                localStorageService.set("user", username);
                localStorageService.set("pass", password);

                $location.path("/");
                $scope.$apply();
            }, function () {
                $scope.connecting = false;
                $scope.text = "Error authenticating, username or password may be incorrect";
                $scope.$apply();
            });
        };

        ws.onerror = function () {
            $scope.connecting = false;
            $scope.text = "Error connecting, server may be offline or IP/port may be incorrect";
            $scope.$apply();
        };
    }
});