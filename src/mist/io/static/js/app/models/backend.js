define('app/models/backend', [
    'app/controllers/machines',
    'app/controllers/images',
    'app/controllers/sizes',
    'app/controllers/locations', 'ember'],
    /**
     * Backend Model
     *
     * @returns Class
     */
    function(MachinesController, ImagesController, SizesController, LocationsController) {
        return Ember.Object.extend({

            BACKENDSTATES: ['offline', 'online', 'waiting'],

            id: null,
            sizes: [],
            images: [],
            host: null,
            title: null,
            apikey: null,
            error: false,
            machines: [],
            locations: [],
            enabled: null,
            provider: null,
            state: 'unknown',
            poll_interval: null,
            loadingImages: false,
            create_pending: false,
            loadingMachines: false,

            init: function() {
                this._super();
                this.images = ImagesController.create({backend: this});
                this.machines = MachinesController.create({backend: this});
                this.sizes = SizesController.create({backend: this});
                this.locations = LocationsController.create({backend: this});
                Ember.run.next(this, function() {
                    if (!this.enabled) {
                        this.toggle();
                    }
                });
            },

            stateObserver: function() {
                if (this.enabled) {
                    if (this.loadingMachines || this.loadingImages) {
                        this.set('state', 'waiting');
                    } else {
                        this.set('state', 'online');
                    }
                } else {
                    this.set('state', 'offline');
                }
            }.observes('loadingMachines', 'loadingImages', 'enabled'),

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

            toggle: function() {
                if (this.enabled) {
                    this.set('state', 'waiting');
                    this.machines.refresh();
                    this.images.init();
                    this.sizes.init();
                    this.locations.init();
                } else {
                    this.set('state', "offline");
                    this.machines.clear();
                    this.images.clear();
                    this.sizes.clear();
                    this.locations.clear();
                    this.set('loadingImages', false);
                    this.set('loadingMachines', false);
                }
            }.observes('enabled'),

            getMonitoredMachines: function(){
                var monitoredMachines = [];
                this.machines.forEach(function(machine_iter) {
                    if (machine_iter.hasMonitoring) {
                        monitoredMachines.push(machine_iter);
                    }
                });
                return monitoredMachines;
            }
        });
    }
);
