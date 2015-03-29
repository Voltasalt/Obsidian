angular.module("obsidianApp").controller('MainCtrl', function($scope, $rootScope, $location) {

    $scope.navigate = function(loc) {
        $location.path(loc);
    };

    $rootScope.$on("$routeChangeStart", function () {
        $scope.path = $location.path();
    });
});