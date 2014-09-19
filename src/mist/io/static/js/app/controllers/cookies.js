define('app/controllers/cookies', ['ember'],
    //
    //  Cookies Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';


        var COOKIE_NAME = 'mist';
        var EXPIRATION_DAYS = 60; // in days

        //
        //  Cookie format
        //
        //  mist = {
        //
        //      // Single Machine Monitoring
        //
        //      smm: {
        //
        //          machine_id_backend_id: {
        //
        //               timeWindow: 1000,
        //               graphs: {
        //                   graph_id: {
        //                       index: 0,
        //                       hidden: true,
        //                   },
        //                   graph_id: {
        //                       index: 1,
        //                       hidden: false,
        //                   }
        //               },
        //           },
        //
        //           machined_id_backend_id: {
        //              ...
        //           },
        //           ...
        //      },
        //  };
        //


        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            cookie: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                var cookie = getCookie(COOKIE_NAME);
                if (!cookie)
                    cookie = this._createFreshCookie();

                try {
                    this.set('cookie', JSON.parse(cookie));
                } catch (e) {
                    this._createFreshCookie();
                }

            }.on('init'),


            //
            //
            //  Methods
            //
            //


            getSingleMachineEntry: function (machine) {
                var entry;
                var machine_uuid = uuidFromMachine(machine);

                // Find entry for this machine
                forIn(this, this.cookie.smm, function (value, uuid) {
                    if (uuid == machine_uuid)
                        entry = value;
                });

                // If not found, create an entry
                return entry || this._createSingleMachineEntry(machine);
            },


            setSingleMachineEntry: function (machine, entry) {
                var machine_uuid = uuidFromMachine(machine);
                this.cookie.smm[machine_uuid] = entry;
                this._save();
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {

            },


            _save: function () {
                return setCookie(COOKIE_NAME, JSON.stringify(this.cookie), EXPIRATION_DAYS);
            },


            _createFreshCookie: function () {
                this.set('cookie', {
                    smm: {}
                });
                return this._save();
            },


            _createSingleMachineEntry: function (machine) {
                var machine_uuid = uuidFromMachine(machine);
                this.cookie.smm[machine_uuid] = {
                    timeWindow: 10 * TIME_MAP.MINUTE,
                    graphs: {}
                };
                this._save();
                return this.cookie.smm[machine_uuid];
            },
        });


        function getCookie (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
            }
            return "";
        }


        function setCookie (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
            return getCookie(cname);
        }


        function uuidFromMachine(machine) {
            return machine.id + '_' + machine.backend.id;
        }
    }
);
