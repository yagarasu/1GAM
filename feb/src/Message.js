var Message = function (to, from, type, data) {
  this.to = to;
  this.from = from;
  this.type = type;
  this.data = data;
};

module.exports = Message;