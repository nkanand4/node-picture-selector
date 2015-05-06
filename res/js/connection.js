/**
 * Created by nitesh on 5/5/15.
 */

angular.module('Connections', [])
.factory('connector', function($log) {
    // Open a WebSocket connection
    var socket = io();

    var collection = [];

    var methods = {
        send: function(type, message) {
            socket.emit(type, message);
        },
        getConnection: function() {
            return socket;
        }
    };

    return methods;
});