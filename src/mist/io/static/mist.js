var ERROR = 0, WARN = 1, ALERT = 2, INFO = 3, DEBUG = 4;
var LOGLEVEL = 4;

function MessageLog(){
    this.messages = [];
    this.timeout = 0;
    
    this.newMessage = function(message, level, backend){
        var now = new Date();
        if (typeof(level) == 'undefined') {
            level = 0;
        }
        if (typeof(backend) != 'undefined') {
            this.messages.push([level, now, backend.title, backend.currentAction, message]);
        } else {
            this.messages.push([level, now, '', '', message]);
        }
        try { update_message_notifier() } catch(err) { alert('Failed to update message widget: ' + err); }
    }
}

function Backend(id, title, provider, interval, host, log){
    this.title = title;
    this.provider = provider;
    this.id = id;
    this.interval = interval;
    this.host = host;
    this.action_queue = [];
    this.status = 'unknown';
    this.machines = [];
    this.sizes = [];
    this.images = [];
    this.locations = [];
    this.currentAction = '';
    this.log = function(message, level){ try{log.newMessage(message, level, this)} catch(err){} };    

    this.newAction = function(action){
        this.action_queue.push(action);
        if (this.status == 'on' || this.status == 'unknown') {
            this.processAction();
        }
    };

    this.updateStatus = function(new_status, action) {
        this.status = new_status;
        try { update_backend_status(this, action); } catch(err){}
    };

    this.clearQueue = function() {
        this.action_queue = [];
    };

    this.processAction = function(){
        if (this.action_queue.length == 0){
            return;
        }

        if (this.status == 'wait') {
            this.log('cannot process action when in wait status!');
            return;
        }

        action = this.action_queue.shift();

        this.updateStatus('wait', action);
        this.currentAction = action;
        var backend = this;
        switch(action[0]) {
            case 'list_machines':
                this.log('updating machines', DEBUG);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_machines');
                        backend.machines = jQuery.parseJSON(data);
                        update_machines_view(backend);
                        backend.log('updated machines', DEBUG);
                        backend.processAction();
                        try { refresh_machines(backend) } catch(err) {}
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_machines');
                        backend.log("update machines failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_images':
                this.log('updating images', DEBUG);
                $.ajax({
                    url: 'backends/'+this.id+'/images/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_images');
                        backend.images = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_images');
                        backend.log("update images failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_sizes':
                this.log('updating sizes', DEBUG);
                $.ajax({
                    url: 'backends/'+this.id+'/sizes/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_sizes');
                        backend.sizes = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_sizes');
                        backend.log("update sizes failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_locations':
                this.log('updating locations', DEBUG);
                $.ajax({
                    url: 'backends/'+this.id+'/locations/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_locations');
                        backend.locations = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_locations');
                        backend.log("update locations failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'start':
                this.log('starting ' + action[1], INFO);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/start',
                    success: function(data) {
                        backend.updateStatus('on', 'start');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'start');
                        backend.log("start failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'reboot':
                this.log('rebooting ' + action[1], INFO);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/reboot',
                    success: function(data) {
                        backend.updateStatus('on', 'reboot');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'reboot');
                        backend.log("reboot failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'destroy':
                this.log('destroying ' + action[1], INFO);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/destroy',
                    success: function(data) {
                        backend.updateStatus('on', 'destroy');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'destroy');
                        backend.log("destroy failed - backend  offline\n ", ERROR);
                    }
                });
                break;
            case 'stop':
                this.log('stopping ' + action[1], INFO);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/stop',
                    success: function(data) {
                        backend.updateStatus('on', 'stop');
                        backend.processAction();
                        backend.log('stop command sent', DEBUG)
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'stop');
                        backend.log("stop failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'create':
                this.log('creating ' + action[1], INFO);
                var payload = {
                    "name": action[1],
                    "size" : action[2],
                    "image": action[3],
                    "location": action[4]
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    url: 'backends/'+this.id+'/machines/create',
                    success: function(data) {
                        backend.updateStatus('on', 'create');
                        backend.processAction();
                        backend.log('create command sent', DEBUG);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'start');
                        backend.log("backend  offline", ERROR);
                    }
                });
                break;
            case 'list_metadata':
                this.log('updating metadata', DEBUG);
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/metadata',
                    success: function(data) {
                        backend.updateStatus('on', 'list_metadata');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_metadata');
                        backend.log("list metadata failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'set_metadata':
                this.log('setting metadata ' + action[1], INFO);
                //FIXME: get from form
                var payload = {
                    "var1": "something1",
                    "var2": "something2",
                    "var3": "something3",
                    "var4": "something4",
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/metadata/set',
                    success: function(data) {
                        backend.updateStatus('on', 'create');
                        backend.processAction();
                        backend.log('set metadata command sent', DEBUG);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'start');
                        backend.log("backend  offline", ERROR);
                    }
                });
                break;
            default:
                this.log("invalid action", ERROR);
        }
    }
}
