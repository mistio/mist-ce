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
                return Mist.cloudsController.get('sortedMachines').slice(0, Mist.cloudsController.get('displayCount'));
            }.property('Mist.cloudsController.sortedMachines', 'Mist.cloudsController.displayCount'),

            sortByState: function () {
                return Mist.cloudsController.get('sortBy') == 'state';
            }.property('Mist.cloudsController.sortBy'),

            sortByName: function () {
                return Mist.cloudsController.get('sortBy') == 'name';
            }.property('Mist.cloudsController.sortBy'),

            sortByCloud: function () {
                return Mist.cloudsController.get('sortBy') == 'cloud';
            }.property('Mist.cloudsController.sortBy'),


            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.machineAddController.set('selectedImage', null);
                Mist.cloudsController.on('onMachineProbe', this, 'updateFooter');
                Mist.cloudsController.on('onSelectedMachinesChange', this, 'updateFooter');
                Mist.cloudsController.set('displayCount', 30);
                this._initializeScrolling();
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.cloudsController.off('onMachineProbe', this, 'updateFooter');
                Mist.cloudsController.off('onSelectedMachinesChange', this, 'updateFooter');
                $(window).off('scroll');
            }.on('willDestroyElement'),

            _initializeScrolling: function () {
                $(window).on('scroll', function (e) {
                    if (Mist.isScrolledToBottom() &&
                        Mist.cloudsController.get('machines').length > Mist.cloudsController.get('displayCount')) {
                            Mist.cloudsController.set('displayCount', Mist.cloudsController.get('displayCount') + 30);
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
                switch (Mist.cloudsController.selectedMachines.length) {
                case 0:
                    $('#machine-list-page .ui-footer')
                    .slideUp()
                    .find('.ui-btn').addClass('ui-state-disabled');
                    break;
                case 1:
                    var machine = Mist.cloudsController.selectedMachines[0];
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

                    Mist.cloudsController.selectedMachines.forEach(function (machine, index) {
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
                    Mist.machineTagsController.open(Mist.cloudsController.selectedMachines[0]);
                },

                actionsClicked: function () {
                    Mist.machinePowerController.open(Mist.cloudsController.selectedMachines);
                },

                shellClicked: function () {
                    Mist.machineShellController.open(Mist.cloudsController.selectedMachines[0]);
                },

                sortBy: function (criteria) {
                    Mist.cloudsController.set('sortBy', criteria);
                },

                clearSearch : function() {
                    Mist.cloudsController.set('searchMachinesTerm', null);
                },

                selectClicked: function () {
                    $('#select-machines-popup').popup('open').find('.ui-listview').listview('refresh');
                },

                selectionModeClicked: function (mode) {
                    $('#select-machines-popup').popup('close');
                    Mist.cloudsController.get('filteredMachines').forEach(function (machine) {
                        machine.set('selected', mode == 'all' || mode == machine.cloud.title);
                    });
                }
            }
        });
    }
);
