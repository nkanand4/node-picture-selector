/**
 * Created by nitesh on 5/10/15.
 */
var opertingFolder;
var exec = require('child_process').exec;
var future = require('q');
var fs = require('fs');
var folderReady = future.defer();
var folderIsReady = folderReady.promise;

module.exports = {
    writeToZipInputFile: function(filename, list) {
        var defer = future.defer();
        folderIsReady.then(function() {
            fs.appendFile(opertingFolder + filename, list.join('\n'), function (err) {
                if (err) throw err;
                console.log('Writing to the ' + filename);
                defer.resolve();
            });
        });
        return defer.promise;
    },
    writeToFlattenZipInputFile: function(filename, list) {
        var defer = future.defer();
        var strin = '';
        list.forEach(function(file) {
            strin += '-C ' + _path.dirname(file) + ' ' +_path.basename(file) + '\n';
        });
        fs.appendFile(opertingFolder + filename, strin, function (err) {
            if (err) throw err;
            console.log('Writing to the ' + filename);
            defer.resolve();
        });
        return defer.promise;
    },
    removeFile: function(filename) {
        folderIsReady.then(function() {
            exec('rm ' + opertingFolder + filename);
        });
    },
    createZipFile: function(tgz, input) {
        var createdZipFile = future.defer();
        folderIsReady.then(function() {
            var outfile = opertingFolder + tgz;
            exec('tar -cvzf ' + outfile + ' -T ' + opertingFolder + input, function(error, stdout, stderr) {
                if(!error) {
                    createdZipFile.resolve(outfile);
                }
            });
        });
        return createdZipFile.promise;
    },
    setOperatingFolder: function(folder) {
        opertingFolder = folder;
        exec('mkdir -p ' + opertingFolder, function(error, stdout, stderr) {
            if(!error) {
                folderReady.resolve();
            }
        });
    }
};