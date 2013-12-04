define('app/views/backend_button', ['ember'],
    /**
     *  Backend Button View
     * 
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             * 
             *  Properties
             * 
             */

            tagName: 'a',
            backend: null,
            template: Ember.Handlebars.compile('{{title}}'),
            attributeBindings: ['data-role', 'data-theme', 'data-inline', 'data-role', 'data-icon'],

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
            }.observes('backend.state'),



            /**
             * 
             *  Actions
             * 
             */

            click: function() {
                var backend = this.backend;
                $('#monitoring-message').hide();
                $('#backend-delete-confirm').hide();
                Mist.backendEditController.set('backend', backend);
                $('#backend-toggle option[value=1]')[0].selected = backend.enabled;
                $('#backend-toggle').slider('refresh');
                $('#edit-backend-popup').popup('open');
            }
        });
    }
);
