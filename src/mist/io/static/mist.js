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

    this.newAction = function(action){
        this.action_queue.push(action);
        if (this.status == 'on' || this.status == 'unknown') {
            this.processAction();
        }
    };

    this.updateStatus = function(new_status) {
        this.status = new_status;
        try { update_backend_status(this); } catch(err){}
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

        this.updateStatus('wait');
        var backend = this;
        switch(action[0]) {
            case 'list_machines':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/list',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.machines = jQuery.parseJSON(data);
                        update_machines_view(backend);
                        backend.processAction();
                        try { refresh_machines(backend) } catch(err) {}
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline\n " + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'list_images':
                $.ajax({
                    url: 'backends/'+this.id+'/images/list',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.images = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline\n " + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'list_sizes':
                $.ajax({
                    url: 'backends/'+this.id+'/sizes/list',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.sizes = jQuery.parseJSON(data);
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline\n " + jqXHR.statusText + ": " + jqXHR.responseText);
                    }
                });
                break;
            case 'start':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/start',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'reboot':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/reboot',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'destroy':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/destroy',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'stop':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/stop',
                    success: function(data) {
                        backend.updateStatus('on');
                        backend.processAction();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.updateStatus('off');
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            default:
                alert('invalid action ' + action);
        }
    }
}
