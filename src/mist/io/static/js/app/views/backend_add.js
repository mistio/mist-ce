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
                $(document).bind("mobileinit", function(){
                    $('.select-listmenu li').on('click', function(event){
                        $('.select-backend-collapsible').collapsible('option','collapsedIcon','check');
                        $('.select-backend-collapsible span.ui-btn-text').text(event.target.text);
                        Mist.backendAddController.set('newBackendProvider', 
                            {provider: $(event.target).attr('title'),
                             title: event.target.text 
                            }
                        );
                        $('.select-backend-collapsible').trigger('collapse');               
                    });
                });           
            },
            
            addBackend: function() {
                $('#add-backend').panel('open');
            },

            backClicked: function() {
                Mist.backendAddController.newBackendClear();
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
                        //setTimeout("$('#home-menu').listview()", 300);
                        //setTimeout("$('#backend-buttons').controlgroup('refresh')", 300);
                        info('added backend ' + result.id);
                        Mist.backendAddController.newBackendClear();
                        $("#add-backend").panel("close");
//                        Ember.run.next(function(){
//                            $('#backend-buttons [data-role=button]').button();
//                            $('#backend-buttons').controlgroup('refresh');
//                        });
                    }
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);
