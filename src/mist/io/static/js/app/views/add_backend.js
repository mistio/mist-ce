define('app/views/add_backend', [
    'text!app/templates/add_backend_dialog.html',
    'ember'],
    /**
     *
     * Add Backend Dialog
     *
     * @returns Class
     */
    function(add_backend_dialog_html) {
        
        return Ember.View.extend({
            attributeBindings:['data-role', 'data-theme'],
            
            'data-role': 'content',
            'data-theme': 'c',
                        
            addButtonClick: function(){
                var that = this;
                var payload = {
                        "provider": 3,
                        "id" : 'unwebme',
                        "title": 'rack',
                        "secret": 'fb68dcedaa4e7f36b5bad4dc7bc28bed'
                };
                $.ajax({
                    url: '/backends',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    success: function(result) {
                        alert('yay!');
                    }
                });            
            },
 
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(add_backend_dialog_html));
            },
        });
    }
);