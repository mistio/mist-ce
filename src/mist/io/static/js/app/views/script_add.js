define('app/views/script_add', ['app/views/panel'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({


            //
            //
            //  Properties
            //
            //


            scriptTypes: [{
                label: 'Ansible Playbook',
                value: 'ansible'
            }, {
                label: 'Executable',
                value: 'executable'
            }],


            scriptSources: [{
                label: 'Github',
                value: 'github'
            }, {
                label: 'URL',
                value: 'url',
            }, {
                label: 'Inline',
                value: 'inline'
            }],


            //
            //
            //  Computed Properties
            //
            //


            isReady: function () {
                var script = Mist.scriptAddController.get('newScript');
                return script.get('name') && script.get('url');
            }.property(
                'Mist.scriptAddController.newScript.name',
                'Mist.scriptAddController.newScript.url'
            ),


            //
            //
            //  Methods
            //
            //


            clear: function () {
                this.$('.source').hide();
                this.hideTypeSelect();
                this.closeTypeSelect();
                this.hideSourceSelect();
                this.closeSourceSelect();
            },


            selectType: function (type) {
                this.closeTypeSelect();
                this.showSourceSelect();
                Mist.scriptAddController.get('newScript').set('type', type);
            },


            selectSource: function (source) {
                this.closeSourceSelect();
                this.showSourceBundle(source);
                Mist.scriptAddController.get('newScript').set('source', source);
            },


            showTypeSelect: function () {
                this.$('#script-add-type').slideDown();
            },


            hideTypeSelect: function () {
                this.$('#script-add-type').hide();
            },

            closeTypeSelect: function () {
                this.$('#script-add-type .mist-select').collapsible('collapse');
            },


            hideSourceSelect: function () {
                this.$('#script-add-source').hide()
            },


            showSourceSelect: function () {
                this.$('#script-add-source').slideDown();
            },


            closeSourceSelect: function () {
                this.$('#script-add-source .mist-select').collapsible('collapse');
            },


            showSourceBundle: function (source) {
                this.$('.source').hide();
                this.$('.'+source.value).slideDown();
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                selectType: function (type) {
                    this.selectType(type);
                },

                selectSource: function (source) {
                    this.selectSource(source);
                },

                backClicked: function () {
                    Mist.scriptAddController.close();
                }
            },


            //
            //
            //  Observers
            //
            //


            nameObserver: function () {
                if (Mist.scriptAddController.newScript.name)
                    this.showTypeSelect();
            }.observes('Mist.scriptAddController.newScript.name'),
        });
    }
);
