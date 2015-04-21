define('app/views/machine_list', ['app/views/page'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function (PageView) {
        return App.MachineListView = PageView.extend({


            selectedMachine: null,

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

                if (Mist.machineShellController.isOpen)
                    return;
                var connectText = 'Shell';
                this.set('selectedMachine', null)
                switch (Mist.backendsController.selectedMachines.length) {
                case 0:
                    $('#machine-list-page .ui-footer').slideUp();
                    break;
                case 1:
                    var machine = Mist.backendsController.selectedMachines[0];
                    connectText = machine.get('connectText');
                    $('#machine-list-page .ui-footer').slideDown();

                    this.set('selectedMachine', machine)
                    if (machine.can_tag) {
                        $('#machine-list-page #machines-tags-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                    }

                    if (machine.get('canConnect') && machine.state == 'running') {
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
                this.set('connectText', connectText);
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
