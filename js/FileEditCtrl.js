angular.module("obsidianApp").controller('FileEditCtrl', function($scope, $location, $routeParams, Minecraft) {
    var file = $routeParams.file;
    Minecraft.call("files.read", ["." + file]).then(function(data) {
        $scope.content = data;
        $scope.$apply();
    }, function(err) {
        console.log(err);
    });

    $scope.breadcrumb = file.split("/");

    $scope.cmOption = {
        lineNumbers: true,
        indentWithTabs: false,
        cursorHeight: 0.85,
        onLoad: function(_cm) {
            var info = window.CodeMirror.findModeByExtension(file.substr(file.lastIndexOf(".") + 1));
            if (info) {
                _cm.setOption("mode", info.mime);

                window.CodeMirror.modeURL = "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/%N/%N.js";
                window.CodeMirror.autoLoadMode(_cm, info.mode);
            }
        }
    };

    $scope.back = function() {
        $location.path("/files/view" + file.substr(0, file.lastIndexOf("/") + 1));
    };

    $scope.save = function() {
        Minecraft.call("files.write", ["." + file, $scope.content]);
        $scope.back();
    }
});