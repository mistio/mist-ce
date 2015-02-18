define('app/controllers/scripts', ['app/controllers/base_array', 'app/models/script'],
    //
    //  Scripts Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, ScriptModel) {

        'use strict';

        return BaseArrayController.extend({

            model: ScriptModel,

            addScript: function (args) {

                var that = this;
                that.set('addingScript', true);
                Mist.ajax.POST('/scripts', {
                    'name': args.script.name,
                    'exec_type': args.script.type.value,
                    'location_type': args.script.source.value,
                    'entrypoint': args.script.entryPoint,
                    'script': args.script.source.value == 'inline' ? args.script.script : args.script.url
                }).success(function (script) {
                    that._addObject(script);
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success) {
                    that.set('addingScript', false);
                    if (args.callback)
                        args.callback(success);
                })
            },

            runScript: function (args) {
                var that = this;
                that.set('runningScript', true);
                Mist.ajax.POST('/scripts/' + args.script.script.id, {
                    'machine_id': args.script.machine.id,
                    'backend_id': args.script.machine.backend.id,
                    'params': args.script.parameters
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success) {
                    that.set('runningScript', false);
                    if (args.callback)
                        args.callback(success);
                });
            },


            getRequestedScript: function() {
                if (this.scriptRequest) {
                    return this.getObject(this.scriptRequest);
                }
            },
        });
    }
);
