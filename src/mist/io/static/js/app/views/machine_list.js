define('app/views/machine_list', [
    'app/views/mistscreen',
    'text!app/templates/machine_list.html',
    'ember'
    ],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function(MistScreen, machine_list_html) {
        return MistScreen.extend({
    
            tagName:false,
    
            template: Ember.Handlebars.compile(machine_list_html),

            openTags: function(){
                $("#dialog-tags").popup('option', 'positionTo', '#machines-button-tags').popup('open', {transition: 'slideup'});
            },
    
            openShell: function(){
                $("#dialog-shell").popup('option', 'positionTo', '#machines-button-shell')
                                  .popup('open', {transition: 'slideup'});
                $("#dialog-shell").on('popupafterclose', 
                        function(){
                            $(window).off('resize');
                        }
                );
                
                Ember.run.next(function(){
                    $(window).on('resize', function(){
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
    
            actions: {
                selectClicked: function() {
                    $('#select-machines-listmenu').listview('refresh');
                    $('#select-machines-popup').popup('open');
                },
    
                selectOptionClicked: function(option) {
                    Mist.backendsController.forEach(function(backend) {
                        backend.machines.forEach(function(machine) {
                            if (option == 'all' || machine.backend.provider == option.provider) {
                                machine.set('selected', true);
                            } else {
                                machine.set('selected', false);
                            }
                        });
                    });
                    $('#select-machines-popup').popup('close');
                    Ember.run.next(function() {
                        $("input[type='checkbox']").checkboxradio('refresh');
                    });
                }
            }
        });
    }
);
