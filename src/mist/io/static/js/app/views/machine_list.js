define('app/views/machine_list', ['app/views/mistscreen', 'text!app/templates/machine_list.html', 'ember'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function(MistScreen, machine_list_html) {
        return MistScreen.extend({

            /**
             * 
             *  Properties
             * 
             */
            
            selectedMachine: null,
            template: Ember.Handlebars.compile(machine_list_html),

            /**
             *
             *  Initialization
             *
             */

            init: function() {
                this._super();
                Mist.backendsController.on('onSelectedMachinesChange', this, 'updateFooter');
            },

            /**
             * 
             *  Observers
             * 
             */

            updateFooter: function() {
                switch (Mist.backendsController.selectedMachines.length) {
                    case 0:
                        $('#machine-list-page .ui-footer').slideUp();
                        break;
                    case 1:
                        $('#machine-list-page .ui-footer').slideDown();
                        $('#machine-list-page #machines-tags-btn').removeClass('ui-state-disabled');
                        $('#machine-list-page #machines-shell-btn').removeClass('ui-state-disabled');
                        break;
                    default:
                        $('#machine-list-page .ui-footer').slideDown();
                        $('#machine-list-page #machines-tags-btn').addClass('ui-state-disabled');
                        $('#machine-list-page #machines-shell-btn').addClass('ui-state-disabled');
                        break;
                }
            }.on('didInsertElement'),
 

            openTags: function() {
                $("#dialog-tags").popup('option', 'positionTo', '#machines-button-tags').popup('open', {transition: 'slideup'});
            },

    
            openShell: function() {
                $("#dialog-shell").popup('option', 'positionTo', '#machines-button-shell')
                                  .popup('open', {transition: 'slideup'});
                $("#dialog-shell").on('popupafterclose', 
                        function(){
                            $(window).off('resize');
                        }
                );
                
                Ember.run.next(function() {
                    $(window).on('resize', function() {
                        $('#dialog-shell-popup').css({'left':'5%','width':'90%'});
                        $('.shell-return').css({'height': (0.6*$(window).height()) + 'px'});
                        $('.shell-input input').focus();
                        return false;
                    });
                    $(window).trigger('resize');
                });
            },
    
    
            openActions: function(){
                $("#dialog-power").popup('option', 'positionTo', '#machines-button-power').popup('open', {transition: 'slideup'});
            },
    
            getSelectedMachineCount: function() {
                var count = 0;
                this.content.forEach(function(backend) {
                    count += backend.machines.filterProperty('selected', true).get('length');
                });
                this.set('selectedMachineCount', count);
            },
    
            getSelectedMachine: function() {
                if(this.selectedMachineCount == 1) {
                    var that = this;
                    this.content.forEach(function(item) {
                        var machines = item.machines.filterProperty('selected', true);
                        if(machines.get('length') == 1) {
                           that.set('selectedMachine', machines[0]);
                           return;
                        }
                    });
                } else {
                    this.set('selectedMachine', null);
                }
            },



            /**
             * 
             *  Actions
             * 
             */
    
            actions: {

                createClicked: function() {
                    Mist.machineAddController.open();
                },

                selectClicked: function() {
                    $('#select-machines-popup').popup('open');
                    $('#select-machines-listmenu').listview('refresh');
                },

                selectionModeClicked: function(mode) {
                    $('#select-machines-popup').popup('close');
                    Mist.backendsController.content.forEach(function(backend) {
                        backend.machines.content.forEach(function(machine) {
                            machine.set('selected', mode == 'all' || mode == backend.title);
                        });
                    });
                },

                tagsClicked: function() {
                    Mist.machineTagsController.open(Mist.backendsController.selectedMachines[0]);
                },

                powerClicked: function() {
                    Mist.machinePowerController.open(Mist.backendsController.selectedMachines[0]);
                },
            }
        });
    }
);
