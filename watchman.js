/**
 * Created by nitesh on 5/7/15.
 */
var chokidar = require('chokidar');

var watcher;

function startWatching(path, handlers) {
  chokidar.watch(path, {
    ignored: /[\/\\]\./,
    ignoreInitial: true
  })
  .on('add', function(newfile) {
    console.log('File', newfile, 'has been added');
    (handlers.add||function() {})(newfile);
  })
  .on('unlink', function(deletedFile) {
    console.log('File', deletedFile, 'has been removed');
    (handlers.delete||function() {})(deletedFile);
  });
}


module.exports = {
  watch: startWatching
};

