define('app/views/backend_button', ['ember'],
    /**
     *  Backend Button View
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *  Properties
             */

            tagName: 'a',
            backend: null,
            attributeBindings: ['data-role', 'data-icon'],
            template: Ember.Handlebars.compile('{{title}}'),


            /**
             *
             *  Initialization
             *
             */

            renderButton: function() {
                var btnElement = $('#'+this.elementId);
                if (btnElement.button) {
                    btnElement.button();
                    if ($('#backend-buttons').controlgroup) {
                        $('#backend-buttons').controlgroup('refresh');
                    }
                    this.stateObserver();
                } else {
                    Ember.run.later(this, function() {
                        this.renderButton();
                    }, 100);
                }
            }.on('didInsertElement'),


            destroyButton: function() {
                Ember.run.next(function() {
                    if ($('#backend-buttons').controlgroup) {
                        $('#backend-buttons').controlgroup('refresh');
                    }
                });
            }.on('willDestroyElement'),


            /**
             *
             *  Actions
             *
             */

            click: function() {
                $('#edit-backend-popup').popup('option', 'positionTo', '#' + this.elementId);
                Mist.backendEditController.open(this.backend);
            },


            /**
             *
             *  Observers
             *
             */

            stateObserver: function() {
                $('#' + this.elementId).parent().removeClass('ui-icon-check ui-icon-offline ui-icon-waiting');
                if (this.backend.state == 'online') {
                    $('#' + this.elementId).parent().addClass('ui-icon-check');
                } else if (this.backend.state == 'offline') {
                    $('#' + this.elementId).parent().addClass('ui-icon-offline');
                } else if (this.backend.state == 'waiting') {
                    $('#' + this.elementId).parent().addClass('ui-icon-waiting');
                }
            }.observes('backend.state')
        });
    }
);
