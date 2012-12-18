define('app/views/backend_add', ['app/models/backend',
    'text!app/templates/backend_add_dialog.html',
    'ember'],
    /**
     *
     * Add Backend Dialog
     *
     * @returns Class
     */
    function(Backend, add_backend_dialog_html) {

        return Ember.View.extend({

            addButtonClick: function(){
                var that = this;
                var payload = {
                        "title": '', // TODO
                        "provider": Mist.backendAddController.newBackendProvider,
                        "apikey" : Mist.backendAddController.newBackendKey,
                        "apisecret": Mist.backendAddController.newBackendSecret
                };
                
                $.ajax({
                    url: '/backends',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "cache-control": "no-cache" },
                    data: JSON.stringify(payload),
                    success: function(result) {
                        Mist.backendsController.pushObject(Backend.create(result));
                        setTimeout("$('#home-menu').listview()", 300);
                        setTimeout("$('#backend-buttons').controlgroup('refresh')", 300);
                        info('added backend ' + result.id);
                        Mist.backendAddController.newBackendClear();
                        history.back();
                    }
                });
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(add_backend_dialog_html));

                Ember.run.next(function(){
                    Mist.backendAddController.addObserver('newBackendReady', function(sender, keyReady, value, rev) {
                        Ember.run.next(function() {
                            $('#create-backend-ok').button();
                            if (value) {
                                $('#create-backend-ok').button('enable');
                            } else {
                                $('#create-backend-ok').button('disable');
                            }
                        });
                    });
                    Mist.backendAddController.set('newBackendReady', true);
                    Mist.backendAddController.set('newBackendReady', false);
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);
