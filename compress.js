/**
 * Created by nitesh on 5/16/15.
 */
var lwip = require('lwip');
var future = require('q');

function readAndResize(path, size) {
    var defer = future.defer();
    size = size ? size : 80;
    lwip.open(path, function(err, image) {
        image.resize(size, function() {
            image.toBuffer('jpg', function(err, buffer){
                defer.resolve('data:image/jpeg;base64,' + buffer.toString('base64'));
            });
        })
    });
    return defer.promise;
}



module.exports = {
    compress: readAndResize
};