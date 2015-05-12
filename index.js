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
var tmpFolder = __dirname + '/tmp/node-picture-selector/';
fileio.setOperatingFolder(tmpFolder);

var port = process.env.PORT || 8000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use('/res', express.static(__dirname + '/res'));
app.use('/vendor', express.static(__dirname + '/vendor'));

app.get('/zip/:fileId', function(req, res) {
    console.log('Will hand over file:: ', tmpFolder + req.params.fileId + '.tgz');
    res.download(tmpFolder + req.params.fileId + '.tgz');
});


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
            fileio.removeFile(socket.zipinput);
        }
        socket.zipinput = uuid.v4();
        socket.zipoutput = socket.zipinput + '.tgz';
    });

    socket.on('files2download', function(message){
        if(socket.zipinputReady) {
            socket.zipinputReady.then(function() {
                socket.zipinputReady = fileio.writeToZipInputFile(socket.zipinput, message.files);
                return socket.zipinputReady;
            });
        }else {
            socket.zipinputReady = fileio.writeToZipInputFile(socket.zipinput, message.files);
        }
    });

    function createZipFile(sck) {
        return sck.zipinputReady.then(function() {
            return fileio.createZipFile(socket.zipoutput, socket.zipinput);
        });
    }

    socket.on('downloadnow', function(){
        createZipFile(socket).then(function(file) {
            console.log('Creating zip file for download', file);
            socket.emit('downloadready', {link: '/zip/'+socket.zipinput});
        });
    });

    socket.on('disconnect', function(){
        console.log('Connection released');
        // delete zipinput file
        fileio.removeFile(socket.zipinput);
        fileio.removeFile(socket.zipoutput);
        console.log('Delete file', socket.zipinput);
    });
});