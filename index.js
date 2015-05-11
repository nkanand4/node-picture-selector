/**
 * Created by nitesh on 5/5/15.
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var uuid = require('node-uuid');
var watchman = require('./watchman');
var finder = require('./finder');
var symlinker = require('./symlinker');
var fileio = require('./fileOperations');

var port = process.env.PORT || 8000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use('/res', express.static(__dirname + '/res'));
app.use('/vendor', express.static(__dirname + '/vendor'));


io.on('connection', function(socket){
    console.log('Opened a new connection');

    socket.on('setfolder', function(message){
        console.log('Data on event', message.path);
        symlinker.execute(message.path, function() {
            app.use('/download', express.static(__dirname + '/softlink'));
            // find out dynamic use of app.use works or not
            finder.configure(__dirname + '/softlink', message.filter).beginSearch({
                match: function(matchedFile) {
                    var downloadPath = matchedFile.replace(/.*\/softlink\//, '/download/');
                    var realPath = matchedFile.replace(/.*\/softlink\//, message.path + '/');
                    socket.emit('found', {url: downloadPath, realPath: realPath});
                },
                finished: function(exts) {
                    socket.emit('extensionsLocated', exts);
                    console.log('Extension located', exts);
                    watchman.watch(message.path, {
                      /*add: function(newFile) {
                        var downloadPath = newFile.replace(message.path, '/download/');
                        socket.emit('found', {url: downloadPath, realPath: newFile});
                        console.log('A file has been added', newFile);
                      },*/
                      delete: function(deletedFile) {
                        var downloadPath = deletedFile.replace(message.path, '/download/');
                        socket.emit('removed', {url: downloadPath, realPath: deletedFile});
                      }
                    });
                }
            });
        });
    });

    socket.on('prepDownload', function(){
        // delete existing zipinput
        if(socket.zipinput) {
            fileio.removeTmpZipFile(socket.zipinput);
        }
        socket.zipinput = uuid.v4();
        socket.zipoutput = socket.zipinput + '.tgz';
    });

    socket.on('disconnect', function(){
        console.log('Connection released');
        // delete zipinput file
        console.log('Delete file', socket.zipinput);
    });
});