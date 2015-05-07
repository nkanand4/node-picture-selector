/**
 * Created by nitesh on 5/5/15.
 */

angular.module('DataServices', [
    'Connections',
    'bootstrapLightbox'
])
.config(function (LightboxProvider) {
    // set a custom template
    LightboxProvider.templateUrl = '_partials/_lightbox.html';
})
.controller('FolderCtrlr', function($scope, $log, connector, Lightbox) {
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

    $scope.openLightboxModal = function (index) {
        Lightbox.openModal($scope.getFiles(), index);
    };
});
