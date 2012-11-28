define('app/views/key_list', [
    'text!app/templates/key_list.html','ember'],
    /**
     *
     * Key list page
     *
     * @returns Class
     */
    function(key_list_html) {
        return Ember.View.extend({
            tagName: false,
            
            backClicked: function(){
                history.back();
            },
            
            generateClicked: function(){
                $.ajax({
                    url: '/keys',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    success: function(result) {
                        Mist.keysController.set('newKeyPublicKey', result.public);
                        Mist.keysController.set('newKeyPrivateKey', result.private);
                    }
                });
            },
            
            newKeyClicked: function(){
                //TODO
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(key_list_html));
            },
        });
    }
);
