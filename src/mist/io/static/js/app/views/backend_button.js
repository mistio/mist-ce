define('app/views/backend_button', ['ember'],
    /**
     * Backend button view
     *
     * @returns Class
     */
    function(backend_button_html) {

        return Ember.View.extend({

            tagName: 'a',

            attributeBindings: ['data-role', 'data-theme', 'data-inline', 'data-role', 'data-icon'],

            didInsertElement: function() {
                if ('button' in $("#"+this.elementId)) {
                    $("#"+this.elementId).button();
                }
                if ('controlgroup' in $('#backend-buttons')) {
                    $('#backend-buttons').controlgroup('refresh');
                }
            },

            click: function() {
                var backend = this.get('backend');
                Mist.set('backend', backend);
                $('select.ui-slider-switch option[value=1]')[0].selected = backend.enabled;
                $('select.ui-slider-switch').slider('refresh');
                $("#edit-backend").popup('option', 'positionTo', '#' + this.elementId).popup('open', {transition: 'pop'});
            },

            template: Ember.Handlebars.compile("{{title}}")
        });
    }
);
