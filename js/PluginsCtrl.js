angular.module('obsidianApp').controller('PluginsCtrl', function ($scope, $http, Minecraft) {
    var load = function () {
        Minecraft.call("plugins").then(function (res) {
            $scope.plugins = res;
            $scope.$apply();
        });
    };
    load();

    var nameToSlug = {};

    $scope.searchPlugins = function (plugin) {
        return $http.get("http://api.bukget.org/3/search/plugin_name/like/" + plugin + "?size=10&sort=-popularity.monthly").then(function (data) {
            return data.data.map(function (item) {
                nameToSlug[item["plugin_name"]] = item["slug"];

                return item["plugin_name"];
            });
        });
    };

    $scope.install = function () {
        if (nameToSlug[$scope.search]) {
            $http.get("https://api.bukget.org/3/plugins/bukkit/" + nameToSlug[$scope.search] + "/latest/").then(function (res) {
                var url = res.data.versions[0].download;
                Minecraft.call("plugins.install", [url]).then(function (res) {
                    $scope.$apply();
                })
            });
        }
    };

    $scope.enable = function (plugin) {
        Minecraft.call("plugins.name.enable", [plugin]).then(function () {
            load();
        })
    };

    $scope.disable = function (plugin) {
        Minecraft.call("plugins.name.disable", [plugin]).then(function () {
            load();
        })
    }
});