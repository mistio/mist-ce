define('app/views/machine_list', ['app/views/mistscreen', 'text!app/templates/machine_list.html'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function (MistScreen, machine_list_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(machine_list_html),


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.backendsController.on('onMachineProbe', this, 'updateFooter');
                Mist.backendsController.on('onSelectedMachinesChange', this, 'updateFooter');

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.backendsController.off('onMachineProbe', this, 'updateFooter');
                Mist.backendsController.off('onSelectedMachinesChange', this, 'updateFooter');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateFooter: function () {
                switch (Mist.backendsController.selectedMachines.length) {
                case 0:
                    $('#machine-list-page .ui-footer').slideUp();
                    break;
                case 1:
                    var machine = Mist.backendsController.selectedMachines[0];
                    
                    $('#machine-list-page .ui-footer').slideDown();

                    if (machine.can_tag) {
                        $('#machine-list-page #machines-tags-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                    }

                    if (machine.probed && machine.state == 'running') {
                        $('#machine-list-page #machines-shell-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-shell-btn').addClass('ui-state-disabled');
                    }
                    break;
                default:
                    $('#machine-list-page .ui-footer').slideDown();
                    $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                    $('#machine-list-page #machines-shell-btn').addClass('ui-state-disabled');
                    break;
                }
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                createClicked: function () {
                    Mist.machineAddController.open();
                },


                tagsClicked: function () {
                    Mist.machineTagsController.open(Mist.backendsController.selectedMachines[0]);
                },


                powerClicked: function () {
                    Mist.machinePowerController.open(Mist.backendsController.selectedMachines);
                },


                shellClicked: function () {
                    Mist.machineShellController.open(Mist.backendsController.selectedMachines[0]);
                },


                selectClicked: function () {
                    $('#select-machines-popup').popup('open').find('.ui-listview').listview('refresh');
                },


                selectionModeClicked: function (mode) {

                    $('#select-machines-popup').popup('close');

                    Mist.backendsController.content.forEach(function (backend) {
                        backend.machines.content.forEach(function (machine) {
                            machine.set('selected', mode == 'all' || mode == backend.title);
                        });
                    });
                }
            }
        });
    }
);
