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
                if ('button' in $('#'+this.elementId)) {
                    Ember.run.next(this, function() {
                        $('#'+this.elementId).button();
                        $('#backend-buttons').controlgroup('refresh');
                        this.stateObserver();
                    });
                } else {
                    Ember.run.later(this, function() {
                        this.didInsertElement();
                    }, 100);
                }
            },

            stateObserver: function() {
                $('#' + this.elementId).parent().removeClass('ui-icon-check ui-icon-offline ui-icon-waiting');
                  if (this.backend.state == 'online') {
                      $('#' + this.elementId).parent().addClass('ui-icon-check');
                  } else if (this.backend.state == 'offline') {
                      $('#' + this.elementId).parent().addClass('ui-icon-offline');
                  } else if (this.backend.state == 'waiting') {
                      $('#' + this.elementId).parent().addClass('ui-icon-waiting');
                  }
            }.observes('backend.state'),

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
