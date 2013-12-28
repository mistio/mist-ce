define('app/views/machine_list_item', ['app/views/list_item', 'text!app/templates/machine_list_item.html'],
    /**
     *  Machine List Item View
     * 
     *  @returns Class
     */
    function(ListItemView, machine_list_item_html) {
        return ListItemView.extend({
                
            tagName: 'li',

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

            disassociateGhostMachine: function() {
                var that = this;
                Mist.confirmationController.set('title', 'Disassociate machine');
                Mist.confirmationController.set('text', 'Are you sure you want to disassociate ' + this.machine.name + ' ?');
                Mist.confirmationController.set('callback', function() {
                    Mist.keysController.disassociateKey(that.get('controller').get('model').name,
                                                        that.machine);
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            },

            template: Ember.Handlebars.compile(machine_list_item_html),
            
            /**
             * 
             *  Methods
             * 
             */

            updateCheckbox: function() {
                Ember.run.next(this, function() {
                    var element = $('#' + this.elementId + ' input.ember-checkbox');
                    if (element.checkboxradio) {
                        element.checkboxradio()
                               .checkboxradio('refresh');
                    }
                });
            },



            /**
             * 
             *  Observers
             * 
             */

            machineSelected: function() {
                Ember.run.once(this, 'updateCheckbox');
            }.observes('machine.selected'),
        });
    }
);
