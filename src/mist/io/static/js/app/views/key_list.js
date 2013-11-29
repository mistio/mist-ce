define('app/views/key_list', ['app/views/mistscreen','text!app/templates/key_list.html'],
    /**
     *  Key List View
     *
     *  @returns Class
     */
    function(MistScreen, key_list_html) {
        return MistScreen.extend({

            /**
             * 
             *  Properties
             * 
             */

            selectedKey: null,
            template: Ember.Handlebars.compile(key_list_html),



            /**
             * 
             *  Observers
             * 
             */

            selectedKeysObserver: function() {
                var that = this;
                Ember.run.once(function() {
                    switch (Mist.keysController.getSelectedKeysCount()) {
                        case 0:
                            $('#keys-footer').hide();
                            break;
                        case 1:
                            $('#keys-footer').show();
                            $('#keys-footer a').removeClass('ui-state-disabled');
                            that.set('selectedKey', Mist.keysController.getSelectedKeyName());
                            break;
                        default:
                            $('#keys-footer').show();
                            $('#keys-footer a').addClass('ui-state-disabled');
                            break;
                    }
                });
            }.observes('Mist.keysController.content.@each.selected').on('didInsertElement'),



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                createClicked: function() {
                    Mist.keyAddController.clear();
                    $('#create-key-popup').popup('open');
                },

                selectClicked: function() {
                    $('#select-keys-popup').popup('open');
                },

                selectionModeClicked: function(mode) {
                    $('#select-keys-popup').popup('close');
                    Mist.keysController.content.forEach(function(key) {
                        key.set('selected', mode);
                    });
                    Ember.run.next(function() {
                        $("input[type='checkbox']").checkboxradio('refresh');
                    });
                },

                renameClicked: function() {
                    $('#rename-key-popup').popup('open');
                    $('#new-key-name').val(this.selectedKey).trigger('change');
                },

                deleteClicked: function() {
                    var keyName = this.selectedKey;
                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyName + '" ?');
                    Mist.confirmationController.set('callback', function() {
                        Mist.keysController.deleteKey(keyName);
                    });
                    Mist.confirmationController.show();
                },

                setDefaultClicked: function() {
                    Mist.keysController.setDefaultKey(this.selectedKey);
                }
            }
        });
    }
);