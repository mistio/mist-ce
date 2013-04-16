define('app/views/backend_add', [
    'app/models/backend',
    'text!app/templates/backend_add.html',
    'ember'],
    /**
     *
     * Add Backend Dialog
     *
     * @returns Class
     */
    function(Backend, backend_add_html) {

        return Ember.View.extend({

            template: Ember.Handlebars.compile(backend_add_html),

            init: function() {
                this._super();         
            },
            
            selectBackend: function(event){
                $('.select-backend-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-backend-collapsible span.ui-btn-text').text(event.target.text);
                Mist.backendAddController.set('newBackendProvider', 
                    {provider: $(event.target).attr('title'),
                     title: event.target.text 
                    }
                );
                $('.select-backend-collapsible').trigger('collapse');                 
            },
            
            addBackend: function() {
                $('.select-listmenu li').on('click', this.selectBackend);                
                $('#add-backend').panel('open');
                // resize dismiss div TODO: reset on window resize                
                $('.ui-panel-dismiss-position-right').css('left',(0-$('.ui-panel-position-right.ui-panel-open').width()));                
            },

            backClicked: function() {
                Mist.backendAddController.newBackendClear();
                $('.select-listmenu li').off('click', this.selectBackend);
                $("#add-backend").panel("close");
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
                        info('added backend ' + result.id);
                        Mist.backendAddController.newBackendClear();
                        $("#add-backend").panel("close");
                        $('.select-listmenu li').off('click', this.selectBackend);
                    }
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);
