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

                fetchLoadavg: function(machine){
                    if (machine.hasMonitoring){
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

                template: Ember.Handlebars.compile(machine_list_item_html),
        });

    }
);
