define('app/views/dialog', ['app/views/popup'],
    //
    //  Dialog View
    //
    //  @returns Class
    //
    function(PopupComponent) {

        'use strict';

        return App.DialogPopupComponent = PopupComponent.extend({


            layoutName: 'dialog',
            controllerName: 'dialogController',
            popupId: "#dialog-popup",

            //
            //
            //  Computed Properties
            //
            //


            isOK: function() {
                return Mist.dialogController.type == DIALOG_TYPES.OK;
            }.property('Mist.dialogController.type'),


            isOKCancel: function() {
                return Mist.dialogController.type == DIALOG_TYPES.OK_CANCEL;
            }.property('Mist.dialogController.type'),


            isYesNo: function() {
                return Mist.dialogController.type == DIALOG_TYPES.YES_NO;
            }.property('Mist.dialogController.type'),


            isBack: function() {
                return Mist.dialogController.type == DIALOG_TYPES.BACK;
            }.property('Mist.dialogController.type'),


            isPlain: function() {
                return Mist.dialogController.type == DIALOG_TYPES.IS_PLAIN;
            }.property('Mist.dialogController.type'),

            // Following two work only for notify event dialogs
            // to provide success / error css style
            hasError: Ember.computed('isPlain', 'Mist.dialogController.options.head', function() {
                return this.get('isPlain') && Mist.dialogController.options.head == 'Error';
            }),


            hasSuccess: Ember.computed('isPlain', 'Mist.dialogController.options.head', function() {
                return this.get('isPlain') && Mist.dialogController.options.head == 'Success';
            }),


            //
            //
            //  Methods
            //
            //


            open: function() {
                Ember.run.later(this, function() {
                    $('body').enhanceWithin();

                    $(this.popupId).mdPopup('open');
                }, 300);
            },

            close: function () {
                $(this.popupId).mdPopup('close');
            },


            //
            //
            //  Actions
            //
            //


            actions: {
                close: function() {
                    Mist.dialogController.close();
                },

                reject: function() {
                    Mist.dialogController.reject();
                },

                confirm: function() {
                    Mist.dialogController.confirm();
                },

                linkClicked: function(link) {
                    if (link.closeDialog)
                        Mist.dialogController.close();
                    window.location = link.href;
                },

                commandClicked: function(e) {
                    $(this.popupId + ' .command-container')
                        .toArray()
                        .some(function(commandElement) {
                            if (commandElement.textContent.replace(/\s/g, '') ==
                                e.command.replace(/\s/g, '')) {
                                Mist.selectElementContents(commandElement);
                                return true;
                            }
                        });
                }
            }
        });
    }
);
