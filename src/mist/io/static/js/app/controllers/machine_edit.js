define('app/controllers/machine_edit', ['ember'],
    //
    //  Machine Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            machine: null,
            newName: '',
            renamingMachine: false,


            //
            //
            //  Methods
            //
            //


            open: function (machine) {
                this.setProperties({
                    machine: machine,
                    newName: machine.name
                });
                this.view.open();
            },


            close: function () {
                this.view.close();
            },


            save: function () {
                var that = this;
                this.set('renamingMachine', true);
                Mist.ajax.POST('/backends/' + this.machine.backend.id + '/machines/' + this.machine.id, {
                    'action' : 'rename',
                    'name': this.newName
                }).success(function() {
                    that._renameMachine();
                    that.close();
                }).error(function() {
                    Mist.notificationController.notify('Failed to rename machine');
                }).complete(function(success) {
                    that.set('renamingMachine', false);
                });
            },

            _renameMachine: function (machine, name) {
                Ember.run(this, function () {
                    this.get('machine').set('name', this.get('newName'));
                    this.trigger('onMachineRename', {
                        object: this.get('machine')
                    });
                });
            }
        });
    }
);
