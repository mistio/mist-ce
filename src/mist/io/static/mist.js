function Backend(id, title, provider, interval, host){
    this.title = title;
    this.provider = provider;
    this.id = id;
    this.interval = interval;
    this.host = host;
    this.action_queue = [];
    this.status = 'unknown';
    this.machines = [];

    this.new_action = function(action){
        this.action_queue.push(action);
        if (this.status == 'on' || this.status == 'unknown') {
            this.process_action();
        }
    }

    this.process_action = function(){
        if (this.action_queue.length == 0){
            return;
        }

        if (this.status == 'wait') {
            alert('waiterror!');
            return;
        }

        action = this.action_queue.shift();

        this.status = 'wait';
        var backend = this;
        switch(action[0]) {
            case 'list_machines':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/list',
                    success: function(data) {
                        backend.status = 'on';
                        backend.machines = jQuery.parseJSON(data);
                        update_machines_view(backend);
                        backend.process_action();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.status = 'off';
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            case 'reboot':
                $.ajax({
                    url: 'backends/'+this.id+'/machines/'+action[1]+'/reboot',
                    success: function(data) {
                        backend.status = 'on';
                        backend.process_action();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        backend.status = 'off';
                        alert("backend " + backend.id + " is offline: " + errorThrown);
                    }
                });
                break;
            default:
                alert('invalid action ' + action);
        }
    }
}
