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
.controller('FolderCtrlr', function($scope, $log, connector, Lightbox, Collector) {

    $scope.folderpath = '/Users/nitesh/tmp/screenshots';
    $scope.filter = 'png';
    $scope.sendinfo = function() {
        Collector.reset();
        connector.send('setfolder', {
            path: $scope.folderpath,
            filter: $scope.filter
        });
    };
    $scope.getFiles = function() {
        return Collector.getFiles();
    };

    connector.getConnection().on('found', function(message) {
        $log.log('Getting messages');
        Collector.addFiles(message);
        $scope.$evalAsync();
    });

    connector.getConnection().on('removed', function(message) {
      Collector.removeFile(message);
      $scope.$evalAsync();
    });

    connector.getConnection().on('extensionsLocated', function(extensions) {
        $log.log('Extensions located', extensions);
        $scope.$evalAsync();
    });

    $scope.openLightboxModal = function (index) {
        Lightbox.openModal($scope.getFiles(), index);
    };

    $scope.isAdded = function() {
        return Collector.isAlreadyAdded(Lightbox.image);
    };
})
.factory('Collector', function($log) {
    var files = [];
    return {
        reset: function() {
            files = [];
        },
        addFiles: function(file) {
            files.push(file);
        },
        removeFile: function(file) {
            _.remove(files, file);
        },
        getFiles: function() {
            return files;
        },
        toggleCollect: function(file) {
            if(this.isAlreadyAdded(file)) {
                file.isAdded = false;
            }else {
                file.isAdded = true;
            }
        },
        isAlreadyAdded: function(file) {
            return !!file.isAdded;
        }
    };
})
.controller('OverlayController', function($scope, Lightbox, Collector, $log, $document, $timeout) {

    $scope.selectMe = function() {
        Collector.toggleCollect(Lightbox.image);
    };
    $scope.isAdded = function() {
        return Collector.isAlreadyAdded(Lightbox.image);
    };

    $document.bind('keypress', function (event) {
        if(event.which === 32) {
            $timeout(function() {
                $scope.selectMe();
            });
            event.preventDefault();
        }
    });

    $scope.$on('$destroy', function() {
        $log.log('I am killed');
        $document.unbind('keypress');
    });

});
