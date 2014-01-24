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
                this.set('newBareMetalServerIP', null);
                this.set('newBareMetalServerKey', null);
                this.set('newBareMetalServerUser', null);   
                $('#addBackendOpenstack').hide();
                $('#addBackendBareMetal').hide();                    
                $('#addBackendInfo').show();                                                                            
                this.set('newBackendURL', null);
                this.set('newBackendTenant', null);
                this.set('newBackendRegion', null);
                $('.select-backend-collapsible .ui-icon').removeClass('ui-icon-check').addClass('ui-icon-arrow-d');
                $('.select-backend-collapsible span.ui-btn-text').text('Select provider');
            },

            updateNewBackendReady: function() {
                if (this.get('newBackendProvider') &&
                    this.get('newBackendKey') &&
                    this.get('newBackendSecret')) {
                        /* HP Cloud support */
                        if (this.get('newBackendProvider').title.indexOf('HP Cloud') != -1) {
                            if (!(this.get('newBackendURL') &&
                                  this.get('newBackendTenant'))) {
                                      this.set('newBackendReady', false);
                                      $('#create-backend-ok').button('disable');
                                      return;
                                  }
                        }
                        /* OpenStack */                        
                        if (this.get('newBackendProvider').title.indexOf('OpenStack') != -1) {
                            if (!this.get('newBackendURL')) {
                                      this.set('newBackendReady', false);
                                      $('#create-backend-ok').button('disable');
                                      return;
                                  }
                        }
                        this.set('newBackendReady', true);
                        $('#create-backend-ok').button('enable');
                } else if (this.get('newBareMetalServerIP') &&
                    this.get('newBareMetalServerKey') &&                
                    this.get('newBareMetalServerUser')) {                                                                                        
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
                this.addObserver('newBareMetalServerIP', this, this.updateNewBackendReady);                
                this.addObserver('newBareMetalServerKey', this, this.updateNewBackendReady);                
                this.addObserver('newBareMetalServerUser', this, this.updateNewBackendReady);                                
                this.addObserver('newBackendURL', this, this.updateNewBackendReady);
                this.addObserver('newBackendTenant', this, this.updateNewBackendReady);
                this.addObserver('newBackendRegion', this, this.updateNewBackendReady);
            }
        });
    }
);
