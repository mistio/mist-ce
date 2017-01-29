// ****

var DumbEventTarget = function() {
    this._listeners = {};
};
DumbEventTarget.prototype._ensure = function(type) {
    if(!(type in this._listeners)) this._listeners[type] = [];
};
DumbEventTarget.prototype.addEventListener = function(type, listener) {
    this._ensure(type);
    this._listeners[type].push(listener);
};
DumbEventTarget.prototype.on = function(type, listener) {
    info("Adding listener to " + this.name + " for event " + type);
    this.addEventListener(type, listener);
};
DumbEventTarget.prototype.off = function(type, listener) {
    info("Removing listener to " + this.name + " for event " + type);
    this.removeEventListener(type, listener);
};
DumbEventTarget.prototype.emit = function(type) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (args.length == 1) {
        var data = args[0]
        if (data.data){
            var keys = Object.keys(data.data);
            if (keys.length == 1) {
                type = keys[0];
                data = data.data[type];
                args = [data];
            }
        }
    }
    info("Channel " + this.name + " got event '" + type + "'.");
    this._ensure(type);
    if (!(('on' + type in this) || (this._listeners[type].length))) {
        warn("No listeners for '" + type + "' in " + this.name + ".");
    }
    if (this['on' + type]) this['on' + type].apply(this, args);
    for (var i=0; i < this._listeners[type].length; i++) {
        this._listeners[type][i].apply(this, args);
    }
};


// ****

var MultiplexedWebSocket = function(ws) {
    var that = this;
    this.ws = ws;
    this.channels = {};
    this.ws.addEventListener('heartbeat', function(e) {
        that.ws.send('h');
    });
    this.ws.addEventListener('message', function(e) {
        if (e.data.length < 5)
            console.warn(e.data);
        var t = e.data.split(',');
        var type = t.shift(), name = t.shift(), payload = t.join();
        if(!(name in that.channels)) {
            return;
        }
        var sub = that.channels[name];

        switch(type) {
            case 'uns':
                delete that.channels[name];
                sub.emit('close', {});
                break;
            case 'msg':
                sub.emit('message', {data: JSON.parse(payload)});
                break
            }
    });
};
MultiplexedWebSocket.prototype.channel = function(raw_name) {
    return this.channels[escape(raw_name)] =
        new Channel(this.ws, escape(raw_name), this.channels);
};


var Channel = function(ws, name, channels) {
    DumbEventTarget.call(this);
    var that = this;
    this.ws = ws;
    this.name = name;
    this.channels = channels;
    var onopen = function() {
        that.ws.send('sub,' + that.name);
        that.emit('open');
    };
    if(ws.readyState > 0) {
        setTimeout(onopen, 0);
    } else {
        this.ws.addEventListener('open', onopen);
    }
};
Channel.prototype = new DumbEventTarget()

Channel.prototype.send = function(data) {
    this.ws.send('msg,' + this.name + ',' + data);
};
Channel.prototype.close = function() {
    var that = this;
    this.ws.send('uns,' + this.name);
    delete this.channels[this.name];
    setTimeout(function(){that.emit('close', {})},0);
};
