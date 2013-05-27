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
                if (event.target.title.indexOf("rackspace") !== -1 || event.target.title.indexOf("linode") !== -1)  {
                    $('#textApiKey').text('2. Username:');
                    $('#textApiSecret').text('3. API Key:');
                } else {
                    $('#textApiKey').text('2. API Key:');
                    $('#textApiSecret').text('3. API Secret:');
                }
                $('.select-backend-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-backend-collapsible span.ui-btn-text').text(event.target.text);
                Mist.backendAddController.set('newBackendProvider', 
                    {provider: $(event.target).attr('title'),
                     title: event.target.text 
                    }
                );
                $('.select-backend-collapsible').trigger('collapse');

                $('input[id=create-backend-key]').val('');
                $('input[id=create-backend-secret]').val('');
                for (var b = 0; b < Mist.backendsController.content.length; b++) {
                    var backend = Mist.backendsController.content[b];                    
                    if (event.target.title.split('_')[0] == 'ec2' && backend.provider.split('_')[0] == 'ec2') {
                        //Autocomplete
                        $('input[id=create-backend-key]').val(backend.apikey);
                        $('input[id=create-backend-secret]').val('getsecretfromdb');
                        $('#create-backend-ok').button('enable');
                        break;
                    } else if (event.target.title.substr(0,9) == 'rackspace' && backend.provider.substr(0,9) == 'rackspace') {
                        $('input[id=create-backend-key]').val(backend.apikey);
                        $('input[id=create-backend-secret]').val('getsecretfromdb');
                        $('#create-backend-ok').button('enable');
                        break;
                    }
                }
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
                    "apikey" : $('#create-backend-key').val(),
                    "apisecret": $('#create-backend-secret').val()
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
