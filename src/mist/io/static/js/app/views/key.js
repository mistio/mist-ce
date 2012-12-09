define('app/views/key', [
    'text!app/templates/key.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(key_html) {
        return Ember.View.extend({
            tagName: false,
            keyBinding: 'Mist.key',

            deleteKey: function() {
                var key = this.key;

                Mist.confirmationController.set('title', 'Delete Key: ' + key.name);
                Mist.confirmationController.set('text', 'Are you sure you want to delete ' +
                                                key.name + '?');

                Mist.confirmationController.set('callback', function() {
                    key.deleteKey();
                    history.back();
                    $.mobile.changePage('#keys');
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            },

            displayPrivateKey: function(){
                alert('priv');    
            },
            
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(key_html));
                $('.public-key input, .private-key input').live('click', function(){
                    this.select();
                });
                $('.public-key input, .private-key input').live('change', function(){
                   return false; 
                });
            },
        });
    }
);
