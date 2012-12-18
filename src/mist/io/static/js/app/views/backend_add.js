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
                        "provider": this.backendProvider,
                        "apikey" : this.backendKey,
                        "apisecret": this.backendSecret
                };
                
                $.ajax({
                    url: '/backends',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "cache-control": "no-cache" }
                    data: JSON.stringify(payload),
                    success: function(result) {
                        Mist.backendsController.pushObject(Backend.create(result));
                        setTimeout("$('#home-menu').listview()", 300);
                        setTimeout("$('#backend-buttons').controlgroup('refresh')", 300);
                        info('added backend ' + result.id);
                    }
                });
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(add_backend_dialog_html));
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);
