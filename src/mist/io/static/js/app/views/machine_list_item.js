define('app/views/machine_list_item', [
    'text!app/templates/machine_list_item.html','ember'],
    /**
     *
     * Machine List Item View
     *
     * @returns Class
     */
    function(machine_list_item_html) {
        return Ember.View.extend({
                tagName:false,

                probed: function(){
                    return this.machine.probed;
                }.property('controller.model.probed'),
                
                fetchLoadavg: function(machine) {
                    if (machine.hasMonitoring) {
                        var uri = URL_PREFIX + '/backends/' + machine.backend.id + '/machines/' + machine.id + '/loadavg.png';
                        var bgimage = new Image();
                        var timestamp = new Date().getTime();
                        bgimage.src = uri + '?' + timestamp + '&auth_key=' + Mist.auth_key;
                        // update load graph after the image is loaded
                        bgimage.onload = function () {
                           $('#' + machine.id + ' span.monitoring-icon').css('background-image', 'url(' + bgimage.src + ')');
                        };
                        timestamp = new Date().getTime();
                    }
                },

                didInsertElement: function(){
                    $('#machines-list').listview('refresh');
                    $("#machines-list").trigger('create');
                    var machine = this.machine;
                    setInterval(this.fetchLoadavg, 4*60*1000, machine);
                },

                disabledMonitoringClass: function() {
                    var machine = this.machine;
                    if (machine && machine.hasMonitoring) {
                        this.fetchLoadavg(machine);
                        return '';
                    } else {
                        return 'ui-disabled';
                    }
                }.property('machine.hasMonitoring'),

                machineSelected: function(){
                    var len = 0;
                    
                    Mist.backendsController.forEach(function(backend) {
                        backend.machines.forEach(function(machine) {
                            if (machine.selected){
                                len++;
                            }
                        });
                    });

                    Mist.backendsController.set('selectedMachineCount', len);
                    
                    if (len > 1) {
                        $('.machines-footer').fadeIn(140);
                        $('.machines #footer-console').addClass('ui-disabled');
                    } else if (len == 1) {
                        $('.machines-footer').fadeIn(140);
                        $('.machines #footer-console').removeClass('ui-disabled');
                    } else {
                        $('.machines-footer').fadeOut(200);
                    }
                    
                }.observes('machine.selected'),

                disassociateGhostMachine: function() {
                    var that = this;
                    Mist.confirmationController.set('title', 'Disassociate Ghost Machine');
                    Mist.confirmationController.set('text', 'Are you sure you want to disassociate ' + this.machine.name + ' ?');
                    Mist.confirmationController.set('callback', function() {
                        var key = that.get('controller').get('model'), newMachines=[];
                        Mist.keysController.disassociateKey(key, that.machine);
                        for (i=0;i<key.machines.length;i++) {
                            if (key.machines[i].toString() != [that.machine.backend.id, that.machine.id].toString()) {
                                newMachines.push(key.machines[i]);
                            }
                        }
                        key.set('machines', newMachines);
                    });
                    Mist.confirmationController.set('fromDialog', true);
                    Mist.confirmationController.show();
                },

                template: Ember.Handlebars.compile(machine_list_item_html),
        });

    }
);
