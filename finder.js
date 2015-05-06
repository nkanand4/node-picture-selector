/**
 * Created by nitesh on 5/5/15.
 */

var FindFiles = require("node-find-files");

var finder;

function init(base, filter) {
    filter = new RegExp(filter || 'js$', 'i');
    base = base || '/Users/nitesh/Developer/workspace/node-picture-selector/bower_components';
    finder = new FindFiles({
        rootFolder : base,
        filterFunction : function (path, stat) {
            return filter.test(path);
        }
    });
}

function beginSearch(handlers) {
    finder.on("match", function(strPath, stat) {
        //console.log(strPath + " - " + stat.mtime);
        handlers.match(strPath);
    });

    finder.on("complete", function() {
        console.log("Finished");
        handlers.finished();
    });

    finder.on("patherror", function(err, strPath) {
        console.log("Error for Path " + strPath + " " + err);  // Note that an error in accessing a particular file does not stop the whole show
        handlers.patherror();
    });

    finder.on("error", function(err) {
        console.log("Global Error " + err);
        handlers.error();
    });
}

var public = {
    configure: function(base, filter) {
        init(base, filter);
        return public;
    },
    beginSearch: function(handlers) {
        beginSearch({
            match: handlers.match || function() {},
            finished: handlers.finished || function() {},
            patherror: handlers.patherror || function() {},
            error: handlers.error || function() {}
        });
        finder.startSearch();
    }
};

module.exports = public;