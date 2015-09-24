define('app/models/key', ['ember'],
    /**
     *  Key Model
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            //
            //  Properties
            //

            id: null,
            probing: null,
            machines: null,
            selected: null,
            visible: true,
            isDefault: null,


            //
            //  Methods
            //

            // Deprecated FIXME
            associate: function(machine, callback, user , port) {
                Mist.keysController.associateKey(this.id, machine, callback, user, port);
            },
            // Deprecated FIXME
            disassociate: function(machine, callback) {
                Mist.keysController.disassociateKey(this.id, machine, null, callback);
            },
        });
    }
);
