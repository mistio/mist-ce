define('app/controllers/machine_shell', ['app/models/command', 'ember'],
    /**
     * Machine Shell Controller
     *
     * @returns Class
     */
    function (Command) {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            command: null,
            machine: null,
            commandHistoryIndex: -1,


            /**
             *
             *  Methods
             *
             */

            open: function (machine) {
                this._clear();
                this.set('machine', machine);
                
                // Get the first ipv4 public ip to connect to
                var host = '';
                for (var i=0;i<machine.public_ips.length;i++){
                    if (machine.public_ips[i].search(':') == -1){
                        host = machine.public_ips[i];
                    }
                        
                }
                if (host == '')
                    return false;
                
                // Open shell socket, give it a few shots
                var sock = undefined, retry = 0;
                while (sock == undefined) {
                    if (retry) {
                        warn('retry ' + retry);
                    }
                
                    sock = io.connect('/shell');            
                    retry += 1;
                    if (retry > 5){
                        warn('failed to connect to shell socket after ' + retry + ' retries');
                        return false;
                    }
                }
            
                Mist.set('shell', sock);
                         
                $('#single-machine-page .ui-footer').hide(500);           
                $('#machine-shell-popup').on('popupafteropen',
                    function(){
                        $('#machine-shell-popup').off('blur');
                        $(document).off('focusin');
                    }
                ).popup( "option", "dismissible", false ).popup('open');

                $('#shell-return').bind('click',function(){
                    $(window).trigger('resize');
                });
                                               
                $(window).on('resize', function(){
                    
                    if (window.innerWidth/(window.innerHeight-virtualKeyboardHeight()) > 1.5){
                        warn('height constrained');
                        var height = window.innerHeight - Math.max(virtualKeyboardHeight()+70, 160);
                        var h = Math.max(height, 130);
                        var fontSize = Math.max(h/33, 6);
                    } else {
                        warn('width constrained');
                        var width = window.innerWidth - 40;
                        var w = Math.max(width, 200); 
                        var fontSize = Math.max((w-60)/47.6 , 6);
                    }

                    $('#shell-return').css('font-size', fontSize + 'px');
                    var lineHeight = $('#shell-return').css('line-height').split('px')[0];
                    fontSize = $('#shell-return').css('font-size').split('px')[0];

                    // Set width & height
                    $('#shell-return').height(24*lineHeight+20); // Makes some sense, right?
                    $('#shell-return').width(fontSize*47.6+40); // Just because!
                    
                    // Put popup it in the center
                    $('#machine-shell-popup-popup').css('left', ((window.innerWidth - $('#machine-shell-popup-popup').width())/2)+'px');
                    if (!Terminal._textarea)
                        $('.terminal').focus();
                    
                    // Make the hidden textfield focusable on android
                    if (Mist.term && Mist.term.isAndroid){
                        $(Terminal._textarea).width('100%');
                        $(Terminal._textarea).height($('#shell-return').height() + 60);
                    }
                    /*
                    if (Terminal._textarea){
                        $('html, body').animate({
                                            scrollTop: $('#shell-return').offset().top+(Mist.term.y-5)*$('#shell-return').height()/24
                                        }, 500);
                    }*/
                    
                    return true;
                });
                $(window).trigger('resize');
                
                var term = new Terminal({
                  cols: 80,
                  rows: 24,
                  screenKeys: true
                });
                term.on('data', function(data) {
                    Mist.shell.emit('shell_data', data);
                });

                term.open(document.getElementById('shell-return'));
                
                var payload = {'backend_id': machine.backend.id, 
                               'machine_id': machine.id,
                               'host': host
                               };
                Mist.shell.emit('shell_open', payload);
                Mist.shell.firstData = true;
                Mist.shell.on('shell_data', function(data){
                    term.write(data);
                    if (Mist.shell.firstData){
                        $('.terminal').focus();
                        Mist.shell.firstData = false;
                    }
                });
                term.write('Connecting to ' + host + '...\r\n');
                Mist.set('term', term);
                
                if(Terminal._textarea) {
                    // iOS virtual keyboard focus fix
                    $(document).off('focusin');
                }
                
            },

            close: function () {                
                warn('closing shell');                
                Mist.shell.emit('shell_close');
                Mist.term.destroy();
                Mist.shell.disconnect();
                $('#machine-shell-popup').popup('close');
                $(window).off('resize');
                this._clear();
                $('#single-machine-page .ui-footer').show(500);
            },

            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function () {
                    this.set('machine', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            },


            /**
             *
             *  Observers
             *
             */

            machinesObserver: function () {
                Ember.run.once(this, '_updateActions');
            }.observes('machines')
        });
    }
);
