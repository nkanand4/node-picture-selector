/**
 * Created by nitesh on 5/5/15.
 */

angular.module('DataServices', ['Connections'])
.controller('FolderCtrlr', function($scope, $log, connector) {
    var files = [];
    $scope.folderpath = '/Users/nitesh/tmp/screenshots';
    $scope.filter = 'png';
    $scope.sendinfo = function() {
        files = [];
        $scope.files = connector.send('setfolder', {
            path: $scope.folderpath,
            filter: $scope.filter
        });
    };
    $scope.getFiles = function() {
        return files;
    };

    connector.getConnection().on('found', function(message) {
        $log.log('Getting messages');
        files.push(message);
        $scope.$evalAsync();
    });
});
