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
                        "provider": this.backendProvider,
                        "apikey" : this.backendKey,
                        "title": 'Rack',
                        "apisecret": this.backendSecret
                };
                var index = Mist.backendsController.content.length;
                $.ajax({
                    url: '/backends/' + index,
                    type: "PUT",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    success: function(result) {
                        Mist.backendsController.pushObject(Backend.create(result));

                        info('added backend ' + index);
                    }
                });
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(add_backend_dialog_html));
            },

            providerList: function() {
                return [{'title': 'Rackspace', 'provider': '3'}];
            }.property('providerList')
        });
    }
);
