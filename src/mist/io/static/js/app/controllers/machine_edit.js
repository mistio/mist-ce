define('app/controllers/machine_edit', ['ember'],
    //
    //  Machine Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            machine: null,
            newName: '',


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
                Mist.ajax.POST('/backends/' + this.machine.backend.id + '/machines/' + this.machine.id, {
                    'action' : 'rename',
                    'name': this.newName
                }).success(function() {
                    alert('Yupie');
                    that.close();
                    //that._destroyMachine(machineId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to rename machine');
                }).complete(function(success) {

                });
            }
        });
    }
);
