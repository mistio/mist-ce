define('app/views/key_associate_dialog', [
    'text!app/templates/key_associate_dialog.html','ember'],
    /**
     *
     * Associate Key dialog
     *
     * @returns Class
     */
    function(key_associate_dialog_html) {
        return Ember.View.extend({
            tagName: false,

            back: function() {
                history.back();
            },

            associateKeys: function() {
                history.back();
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(key_associate_dialog_html));
            },
        });
    }
);
