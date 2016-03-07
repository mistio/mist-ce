define('app/controllers/script_add', ['ember'],
    //
    //  Script Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        var GITHUB_URL = 'https://github.com/';

        return Ember.Object.extend({

            newScript: Ember.Object.create({
                name: '',
                url: '',
                type: {},
                entryPoint: '',
                text: '',
                source: {},
                description: ''
            }),


            open: function () {
                this.clear();
                this.view.clear();
            },


            add: function () {
                var that = this;
                Mist.scriptsController.addScript({
                    script: that.get('newScript'),
                    callback: function (success) {
                        if (success) {
                            $('#add-script').collapsible('collapse');
                            Ember.run.next(function() {
                                $('body').enhanceWithin();
                            })
                        }
                    }
                })
            },


            close: function () {
                this.clear();
                this.view.clear();
            },


            clear: function () {
                this.get('newScript').setProperties({
                    name: '',
                    url: '',
                    type: this.view.scriptTypes[1],
                    entryPoint: '',
                    text: '',
                    source: '',
                    script: '',
                    description: ''
                });
            },


            urlObserver: function () {
                if (this.get('newScript').get('source').value == 'github')
                    if (this.get('newScript').get('url').indexOf(GITHUB_URL) != 0)
                        this.get('newScript').set('url', GITHUB_URL);
            }.observes('newScript.url', 'newScript.source')
        });
    }
);
