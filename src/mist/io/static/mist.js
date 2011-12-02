function Backend(id, title, provider, interval, host){
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
    this.currentAction = '';

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
            alert('waiterror!');
            return;
        }

        action = this.action_queue.shift();

        this.updateStatus('wait', action);
        this.currentAction = action;
        var backend = this;
        switch(action[0]) {
            case 'list_machines':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_machines');
                        backend.machines = jQuery.parseJSON(data);
                        update_machines_view(backend);
                        backend.processAction();
                        try { refresh_machines(backend) } catch(err) {}
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_machines');
                        alert("backend " + backend.id + " is offline\n "); // + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'list_images':
                $.ajax({
                    url: 'backends/'+this.id+'/images/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_images');
                        backend.images = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_images');
                        alert("backend " + backend.id + " is offline\n "); // + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'list_sizes':
                $.ajax({
                    url: 'backends/'+this.id+'/sizes/list',
                    success: function(data) {
                        backend.updateStatus('on', 'list_sizes');
                        backend.sizes = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'list_sizes');
                        alert("backend " + backend.id + " is offline\n ");// + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'start':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/start',
                    success: function(data) {
                        backend.updateStatus('on', 'start');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'start');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'reboot':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/reboot',
                    success: function(data) {
                        backend.updateStatus('on', 'reboot');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'reboot');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'destroy':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/destroy',
                    success: function(data) {
                        backend.updateStatus('on', 'destroy');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'destroy');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'stop':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/stop',
                    success: function(data) {
                        backend.updateStatus('on', 'stop');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'stop');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'create':
                var payload = {
                    "name": action[1],
                    "size" : action[2],
                    "image": action[3],
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
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off', 'start');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            default:
                alert('invalid action ' + action);
        }
    }
}
