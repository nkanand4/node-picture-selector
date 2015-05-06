/**
 * Created by nitesh on 5/5/15.
 */
var exec = require('child_process').exec;
var targetDir = '/Users/nitesh/tmp/screenshots';
var child;

module.exports = {
    execute: function(target, done, error) {
        child = exec('bash '+__dirname + '/create-symbolic-link ' + target);
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
            done();
        });
    }
};