define('app/models/backend', [
    'app/controllers/machines',
    'app/controllers/images',
    'app/controllers/sizes',
    'app/controllers/locations', 'ember'],
    /**
     * Backend model
     *
     * @returns Class
     */
    function(MachinesController, ImagesController,
            SizesController, LocationsController) {
        return Ember.Object.extend({
            
            BACKENDSTATES: ['offline', 'online', 'waiting'],

            id: null,
            apikey: null,
            title: null,
            provider: null,
            poll_interval: null,
            host: null,
            state: 'unknown',
            waiting: false,
            enabled: null,
            machines: null,
            sizes: [],
            images: null,
            locations: [],
            error: false,
            create_pending: false,
            loadingMachines: false,
            loadingImages: false,
            
            isOn: function() {
                if(this.state == "offline"){
                    return false;
                } else {
                    return true;
                }
            },
            
            isOff: function() {
                return !this.isOn();
            },
            
            isWait: function() {
                if (this.state == 'waiting'){
                    this.set('waiting', true);
                } else {
                    this.set('waiting', false);
                }
            }.observes('state'),
            
            getSizeById: function(sizeId){
                for (var i = 0; i < this.sizes.content.length; i++) {
                    if (this.sizes.content[i].id == sizeId) {
                        return this.sizes.content[i];
                    }
                }    
            },

            getImageById: function(imageId) {
                for (var i = 0; i < this.images.content.length; i++) {
                    if (this.images.content[i].id == imageId) {
                        return this.images.content[i];
                    }
                }    
            },

            getMachineById: function(machineId) {
                for (var i = 0; i < this.machines.content.length; i++) {
                    if (this.machines.content[i].id == machineId) {
                        return this.machines.content[i];
                    }
                }    
            },
                                    
            init: function() {
                this._super();
                this.images = ImagesController.create({backend: this});
                this.machines = MachinesController.create({backend: this});
                this.sizes = SizesController.create({backend: this});
                this.locations = LocationsController.create({backend: this});
                var that = this;
                Ember.run.next(function() {
                    that.toggle();
                });
            },
            
            toggle: function() {
                if (!this.enabled) {
                    this.set('state', "offline");
                    this.machines.clear();
                    this.images.clear();
                    this.sizes.clear();
                    this.locations.clear();
                    this.set('loadingImages', false);
                    this.set('loadingMachines', false);
                } else {
                    this.set('state', 'waiting');
                    this.machines.refresh();
                    this.images.init();
                    this.sizes.init();
                    this.locations.init();
                }
                Ember.run.next(function() {
                    $('.backend-toggle').slider('refresh');
                });
            }.observes('enabled')
        
        });
    }
);
