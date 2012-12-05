define('app/views/key_add_dialog', [
    'text!app/templates/key_add_dialog.html','ember'],
    /**
     *
     * Add Key dialog
     *
     * @returns Class
     */
    function(key_add_dialog_html) {
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
                        Mist.keyAddController.set('newKeyPublicKey', result.public);
                        Mist.keyAddController.set('newKeyPrivateKey', result.private);
                    }
                });
            },
            
            newKeyClicked: function(){
                //TODO
                Mist.keyAddController.newKey();
                history.back();                
            },
            
            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(key_add_dialog_html));
                
                Ember.run.next(function(){
                    Mist.keyAddController.addObserver('newKeyReady', function(sender, keyReady, value, rev) {
                        Ember.run.next(function() {
                            $('#add-key-button').button();
                            if (value) {
                                $('#add-key-button').button('enable');
                            } else {
                                $('#add-key-button').button('disable');
                            }
                        });
                    });
                    Mist.keyAddController.set('newKeyReady', true);
                    Mist.keyAddController.set('newKeyReady', false);
                });                                  
            },
        });
    }
);