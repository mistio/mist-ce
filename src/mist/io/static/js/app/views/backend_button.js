define('app/views/backend_button', ['ember'],
    /**
     * Backend Button View
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({

            template: Ember.Handlebars.compile("{{title}}"),

            tagName: 'a',

            attributeBindings: ['data-role', 'data-theme', 'data-inline', 'data-role', 'data-icon'],

            didInsertElement: function() {
                if ('button' in $("#"+this.elementId)) {
                    Ember.run.next(this, function() {
                        $("#"+this.elementId).button();
                        $('#backend-buttons').controlgroup('refresh');
                    });
                } else {
                    Ember.run.later(this, function() {
                        this.didInsertElement();
                    }, 100);
                }
            },

            click: function() {
                var backend = this.backend;
                $('#monitoring-message').hide();
                $('#backend-delete-confirm').hide();
                Mist.backendEditController.set('backend', backend);
                $('#backend-toggle option[value=1]')[0].selected = backend.enabled;
                $('#backend-toggle').slider('refresh');
                $("#edit-backend").popup('option', 'positionTo', '#' + this.elementId).popup('open', {transition: 'pop'});
            }
        });
    }
);
