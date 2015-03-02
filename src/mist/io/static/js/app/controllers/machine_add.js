define('app/controllers/machine_add', ['ember'],
    /**
     *  Machine Add Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            callback: null,
            formReady: null,

            newMachineKey: null,
            newMachineName: null,
            newMachineSize: null,
            newMachineImage: null,
            newMachineScript: null,
            newMachineLocation: null,
            newMachineProvider: null,
            newMachineMonitoring: true,
            newMachineDockerCommand: null,
            newMachineDockerEnvironment: null,


            /**
             *
             *  Methods
             *
             */

            open: function(callback) {
                // In case page is scrolled, opening the
                // panel introduces an unpleasant view.
                // Scrolling to top fixes that
                $('#create-machine-panel .docker').hide();
                $('.ui-page-active').animate({scrollTop:0}, 'slow');
                $('#create-machine-panel .ui-panel-inner').animate({scrollTop:0}, 'slow');
                $('#create-machine-panel').panel('open');
                $('.ui-panel-dismiss-position-right').css('right',($('.ui-panel-position-right.ui-panel-open').width()));
                Ember.run.next(function(){
                    var panelHeight = $('.ui-panel-open').height(),
                        pageHeight = $('.ui-page-active').height();
                    if ( panelHeight > pageHeight) {
                        $('.ui-page-active').height(panelHeight);
                    }
                });
               $('#create-machine-location').addClass('ui-state-disabled');
               $('#create-machine-image').addClass('ui-state-disabled');
               $('#create-machine-size').addClass('ui-state-disabled');
               $('#create-machine-key').addClass('ui-state-disabled');
                $('#create-machine-panel .ui-collapsible').collapsible('option', 'collapsedIcon', 'arrow-d')
                    .collapsible('collapse');

                this._clear();
                this._updateFormReady();
                this.set('callback', callback);
            },


            close: function() {
                $('#create-machine-panel').panel('close');
                this._clear();
            },


            add: function() {

                var providerName = this.newMachineProvider.title;
                var machineSize = this.newMachineSize.name;
                var machineImage = this.newMachineImage.name;
                var machineName = this.newMachineName;

                // Validate machine name
                // TODO: This thing is ugly. Move regex and strings into a dict

                if (providerName == 'NephoScale') {
                    var re = /^[0-9a-z_-]*$/;
                    if ( machineName.length > 64 || !re.test(machineName)) {

                        Mist.notificationController.timeNotify(
                            'Server name in NephoScale may have lower-case letters, numbers, hyphen (\'-\') and underscore (\'_\') characters, cannot exceed 64 ' +
                            'characters, and can end with a letter or a number.', 7000);
                        return;
                    }
                    if (machineSize.indexOf('CS025') > -1) {
                        if ((machineImage != 'Linux Ubuntu Server 10.04 LTS 64-bit') &&
                            (machineImage !='Linux CentOS 6.2 64-bit')) {

                                Mist.notificationController.timeNotify(
                                    'On CS025 size you can only create one of the two images: ' +
                                    'Linux Ubuntu Server 10.04 LTS 64-bit or Linux CentOS 6.2 64-bit', 7000);
                                return;
                        }
                    }
                }
                if (providerName == 'Azure') {
                    var re = /^[0-9a-zA-Z-]*$/;
                    if (!re.test(machineName)) {
                        Mist.notificationController.timeNotify('The name can contain only letters, numbers, and hyphens. The name must start with a letter and must end with a letter or a number.', 7000);
                        return;
                    }
                }
                if (providerName == 'Google Compute Engine') {
                    var re = /^[0-9a-z-]*$/;
                    if (!re.test(machineName)) {
                        Mist.notificationController.timeNotify('Name must be lowercase letters, numbers, and hyphens', 7000);
                        return;
                    }
                }
                if (providerName == 'SoftLayer') {
                    var re = /^[0-9a-zA-Z.-]*$/;
                    if (machineName.length > 253 || !re.test(machineName)) {
                        Mist.notificationController.timeNotify(
                            'Server name in Softlayer must be an alphanumeric string,' +
                            ' that may contain period (\'.\') and dash (\'-\') special characters.', 7000);
                        return;
                    }
                }

                var that = this;
                this.newMachineProvider.machines.newMachine(
                        this.newMachineName,
                        this.newMachineImage,
                        this.newMachineSize,
                        this.newMachineLocation,
                        this.newMachineKey,
                        this.newMachineScript,
                        this.newMachineMonitoring,
                        this.newMachineDockerEnvironment.trim(),
                        this.newMachineDockerCommand,
                        this.newMachineScriptParams,
                        function(success, machine) {
                            that._giveCallback(success, machine);
                        }
                );

                this.close();

                // Redirect to machine list view if user is in image list view
                if ($('#image-list-page').length) {
                    Mist.Router.router.transitionTo('machines');
                }
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

             _clear: function() {
                this.set('callback', null)
                    .set('newMachineName', '')
                    .set('newMachineScript', '')
                    .set('newMachineKey', {'id' : 'Select Key'})
                    .set('newMachineSize', {'name' : 'Select Size'})
                    .set('newMachineImage', {'name' : 'Select Image'})
                    .set('newMachineLocation', {'name' : 'Select Location'})
                    .set('newMachineProvider', {'title' : 'Select Provider'})
                    .set('newMachineDockerEnvironment', '')
                    .set('newMachineDockerCommand', '')
                    .set('newMachineScriptParams', '');
                this.view.clear();
             },


            _updateFormReady: function() {

                var formReady = false;
                if (this.newMachineName &&
                    this.newMachineSize.id &&
                    this.newMachineImage.id &&
                    this.newMachineProvider.id) {
                        formReady = true;
                }

                // SSH key and location are optional for docker
                if (this.newMachineProvider.provider != 'docker') {
                    if (Mist.keysController.keyExists(this.newMachineKey.id) &&
                        this.newMachineLocation.id)
                            formReady = true;
                    else
                        formReady = false;
                }

                if (this.newMachineImage.id &&
                    this.newMachineImage.get('isMist')) {
                        if (!Mist.keysController.keyExists(this.newMachineKey.id))
                            formReady=false;
                }

                this.set('formReady', formReady);
            },


            _giveCallback: function(success, machine) {
                if (this.callback) this.callback(success, machine);
            },


            /**
             *
             *  Observers
             *
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newMachineKey',
                       'newMachineName',
                       'newMachineSize',
                       'newMachineImage',
                       'newMachineScript',
                       'newMachineLocation',
                       'newMachineProvider')
        });
    }
);
