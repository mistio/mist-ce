define('app/views/key_priv_dialog', [
    'text!app/templates/key_priv_dialog.html',
    'ember',
    'jqueryUi'
    ],
/**
 *
 * Shell dialog
 *
 * @returns Class
 */
function(key_priv_dialog_html) {
    return Ember.View.extend({
        tagName: false,

        back: function() {
            history.go(-1);
        },

        init: function() {
            this._super();
            // cannot have template in home.pt as pt complains
            this.set('template', Ember.Handlebars.compile(key_priv_dialog_html));
            $('#private-key').live('click', function(){
                this.select();
            });
            $('#private-key').live('change', function(){
               return false;
            });
        },
    });
});
