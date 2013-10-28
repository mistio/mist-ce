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
                    /*
                     *  WARNING: The following line of code is a quick fix 
                     *  for a bug caused by jqm-1.4.0.rc.1.js 
                     *  TODO: Remove code when bug get's fixed by jqm
                     */
                    $("#" + this.elementId).removeClass('ui-link ui-btn ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all');
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
