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
                Mist.ajax.POST('/scripts/', {
                    'name': args.script.name,
                    'type': args.script.type.value,
                    'source': args.script.source.value,
                    'url': args.script.url,
                    'entry_point': args.script.entryPoint,
                    'script': args.script.script
                }).success(function (script) {
                    that._addObject(script);
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success) {
                    that.set('addingScript', false);
                    if (args.callback)
                        args.callback(success);
                })
            }

        });
    }
);
