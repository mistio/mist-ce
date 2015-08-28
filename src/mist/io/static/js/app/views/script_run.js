define('app/views/script_run', ['app/views/panel'],
    //
    //  Script Run View
    //
    //  @returns Class
    function (PanelComponent) {

        'use strict';

        return App.ScriptRunComponent = PanelComponent.extend({

            layoutName: 'script_run',
            controllerName: 'scriptRunController',

            load: function () {
                Mist.backendsController.on('onMachineListChange', this, 'refreshList');
            }.on('didInsertElement'),

            unload: function () {
                Mist.backendsController.off('onMachineListChange', this, 'refreshList');
            }.on('willDestroyElement'),

            refreshList: function () {
                Ember.run.later(this, function () {
                    this.$('.ui-listview').listview('refresh');
                }, 200);
            },

            isReady: function () {
                return Mist.scriptRunController.scriptToRun.machine.id;
            }.property('Mist.scriptRunController.scriptToRun.machine'),

            actions: {
                machineClicked: function (machine) {
                    Mist.scriptRunController.get('scriptToRun').set('machine', machine);
                    this.$('#script-run-machine').collapsible('collapse');
                },
                backClicked: function () {
                    Mist.scriptRunController.close();
                },
                runClicked: function () {
                    Mist.scriptRunController.run();
                }
            }
        });
    }
);
