define('app/views/machine_list', ['app/views/page'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function (PageView) {
        return App.MachineListView = PageView.extend({

            templateName: 'machine_list',
            selectedMachine: null,

            machines: function () {
                return Mist.backendsController.get('sortedMachines').slice(0, Mist.backendsController.get('displayCount'));
            }.property('Mist.backendsController.sortedMachines', 'Mist.backendsController.displayCount'),

            sortByState: function () {
                return Mist.backendsController.get('sortBy') == 'state';
            }.property('Mist.backendsController.sortBy'),

            sortByName: function () {
                return Mist.backendsController.get('sortBy') == 'name';
            }.property('Mist.backendsController.sortBy'),


            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.machineAddController.set('selectedImage', null);
                Mist.backendsController.on('onMachineProbe', this, 'updateFooter');
                Mist.backendsController.on('onSelectedMachinesChange', this, 'updateFooter');
                Mist.backendsController.set('displayCount', 30);
                this._initializeScrolling();
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.backendsController.off('onMachineProbe', this, 'updateFooter');
                Mist.backendsController.off('onSelectedMachinesChange', this, 'updateFooter');
                $(window).off('scroll');
            }.on('willDestroyElement'),

            _initializeScrolling: function () {
                $(window).on('scroll', function (e) {
                    if (Mist.isScrolledToBottom() &&
                        Mist.backendsController.get('machines').length > Mist.backendsController.get('displayCount')) {
                            Mist.backendsController.set('displayCount', Mist.backendsController.get('displayCount') + 30);
                    }
                });
            },


            //
            //  Methods
            //

            updateFooter: function () {
                if (Mist.machineShellController.isOpen)
                    return;
                var connectText = 'Shell';
                this.set('selectedMachine', null)
                switch (Mist.backendsController.selectedMachines.length) {
                case 0:
                    $('#machine-list-page .ui-footer')
                    .slideUp()
                    .find('.ui-btn').addClass('ui-state-disabled');
                    break;
                case 1:
                    var machine = Mist.backendsController.selectedMachines[0];
                    connectText = machine.get('connectText');
                    $('#machine-list-page .ui-footer').slideDown();

                    this.set('selectedMachine', machine);
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

                    if (machine.get('hasNotActions')) {
                        $('#machine-list-page #machines-power-btn').addClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-power-btn').removeClass('ui-state-disabled');
                    }
                    break;
                default:
                    var haveActions = true;

                    Mist.backendsController.selectedMachines.forEach(function (machine, index) {
                        if (!machine.can_start && !machine.can_reboot && !machine.can_destroy && !machine.can_shutdown) {
                            haveActions = false;
                        }
                    });

                    if (haveActions) {
                        $('#machine-list-page #machines-power-btn').removeClass('ui-state-disabled');
                    } else {
                        $('#machine-list-page #machines-power-btn').addClass('ui-state-disabled');
                    }
                    $('#machine-list-page .ui-footer').slideDown();
                    $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                    $('#machine-list-page #machines-shell-btn').addClass('ui-state-disabled');
                    break;
                }
                this.set('connectText', connectText);
            },


            //
            //  Actions
            //

            actions: {
                createClicked: function () {
                    Mist.machineAddController.open();
                },

                tagsClicked: function () {
                    Mist.machineTagsController.open(Mist.backendsController.selectedMachines[0]);
                },

                actionsClicked: function () {
                    Mist.machinePowerController.open(Mist.backendsController.selectedMachines);
                },

                shellClicked: function () {
                    Mist.machineShellController.open(Mist.backendsController.selectedMachines[0]);
                },

                sortBy: function (criteria) {
                    Mist.backendsController.set('sortBy', criteria);
                },

                selectClicked: function () {
                    $('#select-machines-popup').popup('open').find('.ui-listview').listview('refresh');
                },

                selectionModeClicked: function (mode) {
                    $('#select-machines-popup').popup('close');
                    Mist.backendsController.filteredMachines.forEach(function (machine) {
                        machine.set('selected', mode == 'all' || mode == machine.backend.title);
                    });
                },

                clearSearch: function() {
                    Mist.backendsController.set('searchMachinesTerm', null);
                }
            }
        });
    }
);
