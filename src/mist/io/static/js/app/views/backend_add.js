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
            
            attributeBindings: [
                                'data-role',
                                ],

            backClicked: function() {
                Mist.backendAddController.newBackendClear();
                history.back();
            },

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
                this['data-role'] = 'content';
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(add_backend_dialog_html));

                Ember.run.next(function(){
                    Mist.backendAddController.addObserver('newBackendReady', function() {
//                        Ember.run.next(function() {
//                            $('#create-backend-ok').button();
//                            if (Mist.backendAddController.newBackendReady) {
//                                $('#create-backend-ok').button('enable');
//                            } else {
//                                $('#create-backend-ok').button('disable');
//                            }
//                        });
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
