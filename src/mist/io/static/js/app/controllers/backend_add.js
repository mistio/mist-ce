define('app/controllers/backend_add', [
    'ember'
    ],
    /**
     * Backend add controller
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
                Ember.run.next(function(){
                    $('#create-select-provider').selectmenu('refresh');
                });
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
