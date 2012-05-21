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
        try { 
            update_backend_status(this, action); 
        } catch(err){}
    };

    this.clearQueue = function() {
        this.action_queue = [];
    };
    
    this.disable = function(){
    	this.updateStatus('off', null);
    	this.machines = [];
    	update_machines_view(this);
        this.images = [];
        update_images_view(this);
        this.sizes = [];
        this.locations = [];
        this.processAction();
    }
    
    this.enable = function(){
    	this.updateStatus('on', 'list_machines');
        this.newAction(['list_sizes']);
        this.newAction(['list_locations']);
        this.newAction(['list_images']);
    }

    this.processAction = function(){
        if (this.action_queue.length == 0){
            return;
        }

        if (this.status == 'wait') {
            this.log('cannot process action when in wait status!');
            return;
        }
        
        if (this.status == 'off') {
            return;
        }

        action = this.action_queue.shift();

        if (this.status != 'unknown') {
            this.updateStatus('wait', action);
        }

        this.currentAction = action;
        var backend = this
        var backendIndex = backends.indexOf(backend);

        switch(action[0]) {
            case 'list_machines':
                this.log('updating machines', DEBUG);
                $.ajax({
                    url: 'backends/' + backendIndex + '/machines',
                    success: function(data) {
                        backend.updateStatus('online', 'list_machines');
                        backend.machines = data;
                        update_machines_view(backend);
                        backend.log('updated machines', DEBUG);
                        backend.processAction();
                        try { refresh_machines(backend) } catch(err) {}
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'list_machines');
                        backend.log("update machines failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_images':
                this.log('updating images', DEBUG);
                $.ajax({
                    url: 'backends/' + backendIndex + '/images',
                    success: function(data) {
                        backend.updateStatus('online', 'list_images');
                        backend.images = data;
                        update_images_view(backend);
                        backend.log('updated images', DEBUG);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'list_images');
                        backend.log("update images failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_sizes':
                this.log('updating sizes', DEBUG);
                $.ajax({
                    url: 'backends/' + backendIndex + '/sizes',
                    success: function(data) {
                        backend.updateStatus('online', 'list_sizes');
                        backend.sizes = data;
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'list_sizes');
                        backend.log("update sizes failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'list_locations':
                this.log('updating locations', DEBUG);
                $.ajax({
                    url: 'backends/' + backendIndex + '/locations',
                    success: function(data) {
                        backend.updateStatus('online', 'list_locations');
                        backend.locations = data;
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'list_locations');
                        backend.log("update locations failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'start':
                this.log('starting ' + action[1], INFO);
                $.ajax({
                    type: 'POST',
                    data: 'action=start',
                    url: 'backends/' + backendIndex + '/machines/'+action[1],
                    success: function(data) {
                        backend.updateStatus('online', 'start');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'start');
                        backend.log("start failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'reboot':
                this.log('rebooting ' + action[1], INFO);
                $.ajax({
                    type: 'POST',
                    data: 'action=reboot',
                    url: 'backends/' + backendIndex + '/machines/'+action[1],
                    success: function(data) {
                        backend.updateStatus('online', 'reboot');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'reboot');
                        backend.log("reboot failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'destroy':
                this.log('destroying ' + action[1], INFO);
                $.ajax({
                    type: 'POST',
                    data: 'action=destroy',
                    url: 'backends/' + backendIndex + '/machines/'+action[1],
                    success: function(data) {
                        backend.updateStatus('online', 'destroy');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'destroy');
                        backend.log("destroy failed - backend  offline\n ", ERROR);
                    }
                });
                break;
            case 'stop':
                this.log('stopping ' + action[1], INFO);
                $.ajax({
                    type: 'POST',
                    data: 'action=stop',
                    url: 'backends/' + backendIndex + '/machines/'+action[1],
                    success: function(data) {
                        backend.updateStatus('online', 'stop');
                        backend.processAction();
                        backend.log('stop command sent', DEBUG)
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'stop');
                        backend.log("stop failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'create':
                this.log('creating ' + action[1], INFO);
                var payload = {
                    "name": action[1],
                    "location" : action[2],
                    "image": action[3],
                    "size": action[4]
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    url: 'backends/' + backendIndex + '/machines',
                    success: function(data) {
                        backend.updateStatus('online', 'create');
                        backend.processAction();
                        backend.log('create command sent', DEBUG);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'start');
                        backend.log(jqXHR.responseText, ERROR);
                    }
                });
                break;
            case 'list_metadata':
                this.log('updating metadata', DEBUG);
                $.ajax({
                    url: 'backends/' + backendIndex + '/machines/' + action[1] + '/metadata',
                    success: function(data) {
                        backend.updateStatus('online', 'list_metadata');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'list_metadata');
                        backend.log("list metadata failed - backend  offline", ERROR);
                    }
                });
                break;
            case 'set_metadata':
                console.log('setting metadata ' + action[1], INFO);
                //FIXME: get from form
                var payload = {
                    "tags": {"something1" : 0, "something2" : 0}
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    url: 'backends/' + backendIndex + '/machines/' + action[1] + '/metadata',
                    success: function(data) {
                        backend.updateStatus('online', 'set_metadata');
                        backend.processAction();
                        backend.log('set metadata command sent', DEBUG);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('offline', 'set_metadata');
                        backend.log("backend  offline", ERROR);
                    }
                });
                break;
            default:
                this.log("invalid action", ERROR);
        }
    }
}

function add_backend(provider, apikey, apisecret){
    var payload = {
        "provider": provider,
        "apikey": apikey,
        "apisecret": apisecret
    };

    $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(payload),
        url: 'backends',
        success: function(data) {
            //FIXME: better handling
            b = new Backend(data['id'], data['title'], data['provider'], data['poll_interval'], '', log)
            backends.push(b);
            b.newAction(['list_machines']);
            b.newAction(['list_sizes']);
            b.newAction(['list_locations']);
            b.newAction(['list_images']);
            try { update_backends(); } catch(err) { alert(err); }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            //FIXME: better handling
            alert("service  offline");
        }
    });

}

//get machine, given backend and machineId
function get_machine(backendIndex, machineId) {
    for (var m in backends[backendIndex].machines){
        if (backends[backendIndex].machines[m].id == machineId) {
            return backends[backendIndex].machines[m];
        }
    }
}

//get image, given backend and machine
function get_image(backendIndex, machine) {
    for (var m in backends[backendIndex].images){
        if (backends[backendIndex].images[m].id == machine.imageId) {
            return backends[backendIndex].images[m];
        }
    }
}

//get size, given backend and machine
function get_size(backendIndex, machine) {
    for (var m in backends[backendIndex].sizes){
        if (backends[backendIndex].sizes[m].id == machine.extra.flavorId) {
            return backends[backendIndex].sizes[m];
        }
    }
}

// polling
function refresh_machines(backend){
    var i = backends.indexOf(backend);
    setTimeout("backends[" + i + "].newAction(['list_machines'])", backend.interval);
}
