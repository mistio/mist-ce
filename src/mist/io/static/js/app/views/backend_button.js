define('app/views/backend_button', [
    'text!app/templates/backend_button.html','ember'],
    /**
     * Backend button view
     *
     * @returns Class
     */
    function(backend_button_html) {

        return Ember.View.extend({

            tagName:false,

            didInsertElement: function(e){
                $("#backend-buttons").trigger('create');
            },

            openDialog: function(){
                Mist.set('backend', this.get('backend'));
                $('select.ui-slider-switch option[value=1]')[0].selected = this.get('backend').enabled;
                $('select.ui-slider-switch').slider('refresh');
                $("#edit-backend").popup("open");
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(backend_button_html));
            },
        });
    }
);
