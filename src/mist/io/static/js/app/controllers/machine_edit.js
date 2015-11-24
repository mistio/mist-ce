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
            //  Properties
            //

            machine: null,
            newName: '',
            renamingMachine: false,
            formReady: null,


            //
            //  Methods
            //

            open: function (machine) {
                this.setProperties({
                    machine: machine,
                    newName: machine.name
                });
                this._updateFormReady();
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

            save: function () {
                if (this.formReady) {
                    var that = this;
                    this.set('renamingMachine', true);
                    Mist.ajax.POST('/clouds/' + this.machine.cloud.id + '/machines/' + this.machine.id, {
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
                }
            },

            _renameMachine: function (machine, name) {
                Ember.run(this, function () {
                    this.get('machine').set('name', this.get('newName'));
                    this.trigger('onMachineRename', {
                        object: this.get('machine')
                    });
                });
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.newName && this.newName != this.machine.name) {
                    formReady = true;

                    if (formReady && this.renamingMachine) {
                        formReady = false;
                    }
                }

                this.set('formReady', formReady);
            },

            /**
             *
             *  Observers
             *
             */

            renameFormObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newName', 'renamingMachine')
        });
    }
);
