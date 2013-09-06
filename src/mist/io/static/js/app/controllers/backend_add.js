define('app/controllers/backend_add', [
    'ember'
    ],
    /**
     * Backend Add Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            newBackendReady: false,

            newBackendClear: function() {
                this.set('newBackendProvider', null);
                this.set('newBackendKey', null);
                this.set('newBackendSecret', null);
                this.set('newBackendURL', null);
                this.set('newBackendTenant', null);
                $('.select-backend-collapsible span.ui-btn-text').text('Select backend');
            },

            updateNewBackendReady: function() {
                if (this.get('newBackendProvider') &&
                    this.get('newBackendKey') &&
                    this.get('newBackendSecret')) {
                        this.set('newBackendReady', true);
                        $('#create-backend-ok').button('enable');
                } else {
                    this.set('newBackendReady', false);
                    $('#create-backend-ok').button('disable');
                }
            },

            init: function() {
                this._super();
                this.addObserver('newBackendProvider', this, this.updateNewBackendReady);
                this.addObserver('newBackendKey', this, this.updateNewBackendReady);
                this.addObserver('newBackendSecret', this, this.updateNewBackendReady);
            }
        });
    }
);
