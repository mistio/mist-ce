define('app/views/key_list', [
     'app/views/mistscreen',
    'text!app/templates/key_list.html',
    'ember'
    ],
    /**
     *
     * Key list page
     *
     * @returns Class
     */
    function(MistScreen, key_list_html) {
        return MistScreen.extend({
            
            template: Ember.Handlebars.compile(key_list_html),

            setDefaultKey: function(){
                var key = this.getSelectedKeys();

                if(key.length == 0){
                    return;
                } else if(key.length > 1){
                    alert('You can only set one key as the deafult');
                    return;
                }
                
                key[0].setDefaultKey();
                $('#keys .keys-footer').fadeOut(200);
            },

            deleteKey: function(){
                var keys = this.getSelectedKeys();
                var plural = false;

                if(keys.length == 0){
                    return;
                } else if(keys.length > 1){
                    plural = true;
                }

                Mist.confirmationController.set("title", 'Delete Key' + (plural ? 's' : ''));

                var names = '';

                keys.forEach(function(key){
                    names = names + ' ' + key.name;
                });

                Mist.confirmationController.set("text", 'Are you sure you want to delete' +
                        names +'?');

                Mist.confirmationController.set("callback", function(){
                    keys.forEach(function(key){
                       key.deleteKey();
                       $('#keys .keys-footer').fadeOut(200);
                    });
                });

                Mist.confirmationController.set("fromDialog", true);
                Mist.confirmationController.show();
            },

            getSelectedKeys: function(){
                var keys = new Array();

                Mist.keysController.forEach(function(key){
                        if(key.selected){
                            keys.push(key);
                        }
                });

                return keys;
            },
            
            addKey: function(){
        	   $("#dialog-add-key").popup("open", {transition: 'pop'});
            },
            
            selectKeys: function(event) {
                var selection = $(event.target).attr('title');
    
                if(selection == 'none'){
                    Mist.keysController.forEach(function(key){
                        log('deselecting key: ' + key.name);
                        key.set('selected', false);
                    });
                } else if(selection == 'all'){
                    Mist.keysController.forEach(function(key){
                        log('selecting key: ' + key.name);
                        key.set('selected', true);
                    });
                }  
                Ember.run.next(function(){
                    $("input[type='checkbox']").checkboxradio("refresh");
                });
                $("#select-keys-listmenu li a").off('click', this.selectKeys);
                $('#select-keys-popup').popup('close');
                return false;                           
            },
            
            openKeySelectPopup: function() {
                $('#select-keys-listmenu').listview('refresh');
                $('#select-keys-popup').popup('option', 'positionTo', '.select-keys').popup('open', {transition: 'pop'});
                $("#select-keys-listmenu li a").on('click', this.selectKeys);
            },
            
            disabledDefaultClass : function() {
                var keys = new Array();
    
                Mist.keysController.forEach(function(key) {
                    if (key.selected == true) {
                        keys.push(key);
                    }
                });
                if (keys.length != 1) {
                    // only enable action if a single key is selected
                    return 'ui-disabled';
                } else {
                    return '';
                }
            }.property('Mist.keysController.selectedKeyCount')                     
        });
    }
);
