/**
 * Created by nitesh on 5/10/15.
 */
var opertingFolder = '/tmp/node-picture-selector/';
var exec = require('child_process').exec;
var future = require('q');
var folderReady = future.defer();
var folderIsReady = folderReady.promise;
var child = exec('mkdir -p ' + opertingFolder, function(error, stdout, stderr) {
    if(!error) {
        folderReady.resolve();
    }
});

module.exports = {
    writeToZipInputFile: function(filename) {

    },
    removeZipInputFile: function(filename) {
        folderIsReady.then(function() {
            exec('rm ' + opertingFolder + filename);
        });
    },
    createZipFile: function(tgz, input) {
        var createdZipFile = future.defer();
        folderIsReady.then(function() {
            exec('tar -cvzf ' + opertingFolder + tgz + ' -T ' + opertingFolder + input, function(error, stdout, stderr) {
                if(!error) {
                    createdZipFile.resolve();
                }
            });
        });
        return createdZipFile.promise;
    },
    removeZipFile: function(input) {
        folderIsReady.then(function() {
            exec('rm ' + opertingFolder + input, function(error, stdout, stderr) {
                if(!error) {
                    createdZipFile.resolve();
                }
            });
        });
    }
};