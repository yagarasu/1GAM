var MessageQueue = function () {
  this._messages = [];
};

MessageQueue.prototype.send = function (message) {
  this._messages.push(message);
};

MessageQueue.prototype.dispatch = function () {
  while (this._messages.length > 0) {
    var m = this._messages.splice(0, 1);
    if (m.to) {
      var e = m.to;
      if (e.onMessage) {
        e.onMessage(m);
      }
    }
  }
};

module.exports = new MessageQueue();