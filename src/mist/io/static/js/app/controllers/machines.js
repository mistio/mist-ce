define('app/controllers/machines', [
    'app/models/machine',
    'ember',
    'jquery'
    ],
    /**
     * Machines controller
     *
     * @returns Class
     */
    function(Machine) {
        return Ember.ArrayController.extend({
            backend: null,

            content: null,

            init: function() {
                this._super();
                this.set('content', []),
                this.refresh();
            },

            refresh: function(){

                if(this.backend.state == "offline" || !this.backend.enabled.value){
                    this.clear();
                    return;
                }

                var that = this;

                this.backend.set('state', 'waiting');

                $.getJSON('/backends/' + this.backend.index + '/machines', function(data) {

                    data.forEach(function(item){
                        var found = false;

                        log("item id: " + item.id);

                        that.content.forEach(function(machine){
                            if (machine.id == item.id || (machine.id == -1 && machine.name == item.name)) {
                                found = true;
                                // machine.set(item); //FIXME this does not change anything;
                                if (machine.id == -1) {
                                    machine.set('id', item.id);
                                }
                                machine.set('state', item.state);
                                machine.set('can_stop', item.can_stop);
                                machine.set('can_start', item.can_start);
                                machine.set('can_destroy', item.can_destroy);
                                machine.set('can_reboot', item.can_reboot);
                                machine.set('can_tag', item.can_tag);
                                //FIXME check for changes
                                machine.tags.set('content', item.tags)
                                machine.set('public_ips', item.public_ips);
                                machine.set('extra', item.extra);
                                return false;
                            }
                        });

                        if (!found) {
                            item.backend = that.backend;
                            var machine = Machine.create(item);
                            machine.tags.set('content', item.tags)
                            that.contentWillChange(that.content.length - 1, 0, 1);
                            that.content.push(machine);
                            that.contentDidChange(that.content.length - 1, 0, 1);
                        }
                    });

                    that.content.forEach(function(item) {
                        var found = false;

                        data.forEach(function(machine) {
                            log("machine id: " + machine.id);

                            if (machine.id == item.id) {
                                found = true;
                                return false;
                            }
                        });

                        if (!found && item.id != -1) {
                            log("not found, deleting");
                            that.contentWillChange();
                            that.removeObject(item);
                            that.contentDidChange();
                        }
                    });

                    that.backend.set('state', 'online');
                    Mist.backendsController.getMachineCount()

                    Ember.run.later(that, function(){
                        this.refresh();
                    }, that.backend.poll_interval);
                    
                }).error(function(e) {
                    Mist.notificationController.notify("Error loading machines for backend: " +
                                                        that.backend.title);
                    that.backend.set('state', 'offline');
                    log("Error loading machines for backend: " + that.backend.title);
                    log(e.state + " " + e.stateText);
                });
            },

            newMachine: function(name, image, size, location) {
                log('Creating machine', this.name, 'to backend', this.backend.title);

                // TODO: find a way to pass ember objects to JSON, so the
                // following will seem less messy. It will also be helpful for tags.
                // http://stackoverflow.com/questions/8669340/ember-model-to-json
                var payload = {
                        'name': name,
                        'image': image.id,
                        'size': size.id,
                        // these are only usefull for Linode
                        'image_extra': image.extra,
                        'disk': size.disk,
                        'location': location.id
                };

                var item = {};
                item.state = 'pending';
                item.can_stop = false;
                item.can_start = false;
                item.can_destroy = false;
                item.can_reboot = false;
                item.can_tag = false;
                item.backend = this.backend;
                item.name = name;
                item.image = image;
                item.id = -1;

                var machine = Machine.create(item);
                this.addObject(machine);

                var that = this;

                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully sent create machine', name, 'to backend',
                                    that.backend.title);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while sending create machine' +
                                name + ' to backend ' + that.backend.title);
                        error(textstate, errorThrown, 'while checking key of machine', that.name);
                        that.removeObject(machine);
                    }
                });
            }
        });
    }
);
