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
.controller('FolderCtrlr', function($scope, $log, connector, Lightbox, Collector, $timeout) {

    $scope.folderpath = '/Users/nitesh/Public/pics';
    $scope.filter = '';
    $scope.downloadLink = '';
    $scope.sendinfo = function() {
        Collector.reset();
        $scope.downloadLink = '';
        connector.send('setfolder', {
            path: $scope.folderpath,
            filter: $scope.filter
        });
    };
    $scope.getFiles = function() {
        return Collector.getFiles();
    };

    connector.getConnection().on('found', function(message) {
        Collector.addFiles(message);
        $scope.$evalAsync();
    });

    connector.getConnection().on('downloadready', function(message) {
        $log.log('You can download the file from here.', message);
        $scope.downloadLink = message.link;
        $scope.$evalAsync();
    });

    connector.getConnection().on('removed', function(message) {
      Collector.removeFile(message);
      $scope.$evalAsync();
    });

    connector.getConnection().on('extensionsLocated', function(extensions) {
        var exts = _.keys(extensions);
        $log.log('Extensions located', extensions);
        _.forOwn(exts, function(key, i) {
            exts[i] = {
                name: key,
                count: extensions[key]
            }
        });
        $scope.extensions = angular.copy(exts);
        $scope.$evalAsync();
    });

    function informDownloadingFiles(files, index) {
        var filepath = _.pluck(files, 'realPath');
        if(index === 0) {
            connector.send('prepDownload');
        }

        if(filepath.length > 0) {
            connector.send('files2download', {
                files: filepath
            });
        }

        if(filepath.length < 50) {
            connector.send('downloadnow');
        }
    }

    $scope.openLightboxModal = function (index) {
        Lightbox.openModal($scope.getFiles(), index);
    };

    $scope.isAdded = function() {
        return Collector.isAlreadyAdded(Lightbox.image);
    };

    $scope.filterBy = function(item) {
        $scope.filter = item.name;
    };

    $scope.selectAll = function() {
        Collector.selectAll();
    };
    $scope.unSelectAll = function() {
        Collector.unSelectAll();
    };
    $scope.downloadSelected = function() {
        var index = 0;
        var sliceMe = function() {
            var list = _.slice(Collector.getSelectedFiles(), index * 50, (index * 50) + 50);
            informDownloadingFiles(list, index);
            if(list.length < 50) {
                // no more
            }else {
                // keep doing it.
                index += 1;
                sliceMe();
            }
        };
        $timeout(sliceMe, 50);
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
        },
        selectAll: function() {
            _.each(files, function(file) {
                file.isAdded = true;
            });
        },
        unSelectAll: function() {
            _.each(files, function(file) {
                file.isAdded = false;
            });
        },
        getSelectedFiles: function() {
            var selectedFiles = _.filter(files, {isAdded: true});
            $log.log('Selected files', selectedFiles);
            return selectedFiles;
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
