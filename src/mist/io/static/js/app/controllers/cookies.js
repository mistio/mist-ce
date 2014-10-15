define('app/controllers/cookies', ['ember'],
    //
    //  Cookies Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';


        var COOKIE_NAME = 'mist';
        var EXPIRATION_DAYS = 60;

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


            save: function () {
                this._save();
            },


            getSingleMachineEntry: function (machine) {
                return this.cookie.smm[uuidFromMachine(machine)] ||
                    this._createSingleMachineEntry(machine);
            },


            setSingleMachineEntry: function (machine, entry) {
                this.cookie.smm[uuidFromMachine(machine)] = entry;
                this._save();
            },


            getSingleMachineGraphEntry: function (machine, graph) {
                return this.getSingleMachineEntry(machine).graphs[graph.id] ||
                    this._createSingleMachineGraphEntry(machine, graph);
            },


            setSingleMachineGraphEntry: function (machine, graph, entry) {
                this.cookie.smm[uuidFromMachine(machine)].graphs[graph.id] = entry;
                this._save();
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                setCookie(COOKIE_NAME, '', 0);
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
                    timeWindow: 'minutes',
                    graphs: {}
                };
                this._save();
                return this.cookie.smm[machine_uuid];
            },


            _createSingleMachineGraphEntry: function (machine, graph) {
                info('creating new graph entry');
                var machine_uuid = uuidFromMachine(machine);
                this.cookie.smm[machine_uuid].graphs[graph.id] = {
                    index: graph.index || 0,
                    hidden: graph.view ? grpah.view.isHidden : false,
                };
                this._save();
                return this.cookie.smm[machine_uuid].graphs[graph.id];
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
