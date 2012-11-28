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
            
            BACKENDSTATES: ['offline', 'online', 'waiting'], //TODO add more states

            index: null,
            id: null,
            title: null,
            provider: null,
            poll_interval: null,
            host: null,
            state: 'unknown',
            enabled: null,
            machines: null,
            sizes: [],
            images: null,
            locations: [],
            
            isOn: function(){
                if(this.state == "offline"){
                    return false;
                } else {
                    return true;
                }
            },
            
            isOff: function(){
                return !this.isOn();
            },
            
            init: function() {
                this._super();
                this.images = ImagesController.create({backend: this});
                this.machines = MachinesController.create({backend: this});
                this.sizes = SizesController.create({backend: this});
                this.locations = LocationsController.create({backend: this});
            },
            
            disable: function(){
                this.state = "offline";
                this.machines.clear();
                this.images.clear();
                this.sizes.clear();
                this.locations.clear();
            }
        
        });
    }
);
