define('app/controllers/key_add', ['ember'],
    /**
     * Key Add Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            newKeyName: null,
            newKeyReady: null,
            newKeyPrivate: null,

            newKeyObserver: function() {
                if (this.newKeyName && this.newKeyPrivate) {
                    this.set('newKeyReady', true);
                    $('#create-key-ok').removeClass('ui-disabled');
                } else {
                    this.set('newKeyReady', false);
                    $('#create-key-ok').addClass('ui-disabled');
                }
            }.observes('newKeyName', 'newKeyPrivate'),

            newKey: function(machine) {
                Mist.keysController.newKey(this.newKeyName.trim(), this.newKeyPrivate.trim(), machine);
            },

            clear: function() {
                this.set('newKeyName', null);
                this.set('newKeyReady', null);
                this.set('newKeyPrivate', null);
            },

            generateKey: function() {
                $('#action-loader').fadeIn(200);
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    success: function(data) {
                        $('#action-loader').fadeOut(200);
                        Mist.keyAddController.set('newKeyPrivate', data.priv);
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error generating key: ' + jqXHR.responseText);
                        $('#action-loader').fadeOut(200);
                    }
                });
            },
            
            createKey: function(callback) {
                $('#create-loader').fadeIn(200);
                $('#create-key-ok').addClass('ui-disabled');
                var item = {
                    'name': name,
                    'priv': privateKey
                };
                $.ajax({
                    url: '/keys',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(key) {
                        $('#create-loader').fadeOut(200);
                        $('#create-key-dialog').popup('close');
                        Mist.keyAddController.clear();
                        Mist.keysController.keys.addObject(Key.create(key));
                        /*
                        if (autoSelect) {
                            Ember.run.next(function(){
                                $('.select-key-collapsible .select-listmenu').listview();
                                $('.select-key-collapsible').parent().trigger('create');
                                $('.select-key-collapsible li a').eq(0).click();
                                $('.select-key-collapsible').removeClass('ui-disabled');
                            });
                        } else if (machine) {
                            Mist.keysController.associateKey(name, machine);
                            $('#manage-keys .ajax-loader').fadeIn(200);
                        } else {
                            Ember.run.next(function() {
                                $('#keys-list').listview('refresh');
                                $('#keys-list input.ember-checkbox').checkboxradio();
                            });
                        }
                        */
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error while creating key: ' + jqXHR.responseText);
                        $('#create-loader').fadeOut(200);
                        $('#create-key-ok').removeClass('ui-disabled');
                    }
                });
                item.priv = privateKey = null; // Don't keep private key on client
            },
        });
    }
);
