Log = module.require("../share/utils/Log.js");
ServerUtil = module.require("./utils/ServerUtil.js");
SocketCommandConstants = module.require("../share/constants/SocketCommandConstants.js");

SocketsServer = function(httpServer) {
	this._sockets = module.require("socket.io").listen(httpServer).sockets;
	this._commandhandlers = {};
};

SocketsServer.prototype.addCommandHander = function(command, handler) {
	assert.equal(this._commandhandlers.hasOwnProperty(command), false, "Duplicated handler can't be add");
	this._commandhandlers[command] = handler;
};

SocketsServer.prototype.start = function() {
	this._startSocket();
};

SocketsServer.prototype._startSocket = function(socket) {
	var context = this;
	var commandHanders = this._commandhandlers;

	var onConnected = function(socket) {
		Log.info(socket.id, " is connected");
		for (var command in commandHanders) {
			context._handleCommand(command, socket);
		}
	};

	this._sockets.on(SocketCommandConstants.CONNECTION, onConnected);
};

SocketsServer.prototype._handleCommand = function(command, socket) {
	serverUtil = ServerUtil.getInstance();
	var context = this;

	var handler = function(request) {
		context._commandhandlers[command](socket, request);
	};

	socket.on(command, handler)
};

module.exports = SocketsServer;
