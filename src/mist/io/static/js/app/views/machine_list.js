define('app/views/machine_list', ['app/views/page'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function (PageView) {
        return App.MachineListView = PageView.extend({

            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.cloudsController.on('onMachineProbe', this, 'updateFooter');
                Mist.cloudsController.on('onSelectedMachinesChange', this, 'updateFooter');

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.cloudsController.off('onMachineProbe', this, 'updateFooter');
                Mist.cloudsController.off('onSelectedMachinesChange', this, 'updateFooter');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateFooter: function () {

                if (Mist.machineShellController.isOpen)
                    return;

                switch (Mist.cloudsController.selectedMachines.length) {
                case 0:
                    $('#machine-list-page .ui-footer').slideUp();
                    break;
                case 1:
                    var machine = Mist.cloudsController.selectedMachines[0];

                    $('#machine-list-page .ui-footer').slideDown();

                    if (machine.can_tag) {
                        $('#machine-list-page #machines-tags-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                    }

                    if (machine.get('hasKeys') && machine.state == 'running') {
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
                    Mist.machineTagsController.open(Mist.cloudsController.selectedMachines[0]);
                },


                powerClicked: function () {
                    Mist.machinePowerController.open(Mist.cloudsController.selectedMachines);
                },


                shellClicked: function () {
                    Mist.machineShellController.open(Mist.cloudsController.selectedMachines[0]);
                },


                selectClicked: function () {
                    $('#select-machines-popup').popup('open').find('.ui-listview').listview('refresh');
                },


                selectionModeClicked: function (mode) {

                    $('#select-machines-popup').popup('close');

                    Mist.cloudsController.content.forEach(function (cloud) {
                        cloud.machines.content.forEach(function (machine) {
                            machine.set('selected', mode == 'all' || mode == cloud.title);
                        });
                    });
                }
            }
        });
    }
);
