function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

angular.module("obsidianApp").controller('ChatCtrl', function($scope, Minecraft, Chat) {
    $scope.lines = [];
    angular.element("#input").focus();

    Chat.register(function(data) {
        console.log(data);
        var elem = angular.element("#console")[0];

        if (elem != null) {
            var anchorScroll = elem.scrollTop + elem.clientHeight == elem.scrollHeight;
        }

        var obj = {
            text: data.message,
            sender: data.player
        };

        $scope.lines.push(obj);

        if (anchorScroll) {
            setTimeout(function() {
                angular.element("#console").scrollTop(elem.scrollHeight - elem.clientHeight);
            }, 0);
        }
    }, "chat", true);

    $scope.execute = function() {
        Minecraft.call("chat.broadcast", [$scope.command]);
        $scope.command = "";
    }
});