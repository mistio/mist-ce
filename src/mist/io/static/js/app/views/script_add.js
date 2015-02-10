define('app/views/script_add', ['app/views/panel'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({

            scriptTypes: [{
                label: 'Github',
                value: 'github'
            }, {
                label: 'Url',
                value: 'url'
            }, {
                label: 'File',
                value: 'file'
            }],

            load: function () {
                this.$('.type').hide();
            }.on('didInsertElement'),

            selectType: function (type) {
                if (type.value == Mist.scriptAddController.get('newScript').get('value'))
                    return;
                this.$('.type').hide();
                this.$('.'+type.value).show();
                this.$('.ui-collapsible').collapsible('collapse');
                Mist.scriptAddController.get('newScript').set('type', type);
            },

            actions: {
                typeSelected: function (type) {
                    this.selectType(type);
                },
                uploadFile: function (field) {
                    Mist.fileUploadController.open('Upload Script', 'Script',
                        function (uploadedFile) {
                            uploadedFile = uploadedFile.trim();
                            Mist.scriptAddController.get('newScript').set('text', uploadedFile);
                        },
                        Mist.scriptAddController.get('newScript').get('text')
                    );
                },
                backClicked: function () {
                    Mist.scriptAddController.close();
                }
            },

            isReady: function () {
                var script = Mist.scriptAddController.get('newScript');
                return script.get('name').length && script.get('url').length;
            }.property(
                'Mist.scriptAddController.newScript.name',
                'Mist.scriptAddController.newScript.url'
            )
        });
    }
);
