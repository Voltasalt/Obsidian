function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

angular.module("obsidianApp").controller('ConsoleCtrl', function($scope, $sce, Minecraft, Console, ansi2html) {
    $scope.lines = [];
    angular.element("#input").focus();

    Console.register(function(data) {
        var elem = angular.element("#console")[0];

        if (elem != null) {
            var anchorScroll = elem.scrollTop + elem.clientHeight == elem.scrollHeight;
        }

        var escaped = htmlEntities(data.line.substring(0, data.line.length - 1));
        var escapedWithAnsi = ansi2html.toHtml(escaped);
        var safe = $sce.trustAsHtml(escapedWithAnsi);

        $scope.lines.push(safe);

        if (anchorScroll) {
            setTimeout(function() {
                angular.element("#console").scrollTop(elem.scrollHeight - elem.clientHeight);
            }, 0);
        }
    }, "console", true);

    $scope.execute = function() {
        Minecraft.call("server.run_command", [$scope.command]);
        $scope.command = "";
    }
});