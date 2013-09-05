define('app/views/shell', [
    'text!app/templates/shell.html',
    'ember',
    'jqueryUi'
    ],
/**
 *
 * Shell dialog
 *
 * @returns Class
 */
function(shell_html) {
    return Ember.View.extend({

        template: Ember.Handlebars.compile(shell_html),

        shellOutputItems: Ember.ArrayController.create(),
        
        availableCommands: [], //"dmesg", "uptime", "uname", "ls", "reboot", "whoami", "ifconfig" ],
        
        commandHistory: new Array(),
        commandHistoryIndex: -1,
        
        didInsertElement: function() {
            if ('localStorage' in window && window['localStorage'] !== null) {
                var stored = localStorage['shellHistory'];
                if (stored) {
                    stored = stored.split(',');

                    var that = this;

                    stored.forEach(function(cmd) {
                        if (that.availableCommands.indexOf(cmd) == -1) {
                            that.availableCommands.push(cmd);
                        }
                    });
                }
            }
            this.$("input[type=text]").autocomplete({
                source : this.availableCommands
            });
        },

        submit: function() {
            // This will work in single machine view
            var machine = this.get('controller').get('model');
            if (!machine) {
                // This will work in list machine view, there should be only one machine selected
                var machine = this.machine;
            }

            if (!machine || !machine.probed || !this.command) {
                return;
            }

            var that = this;
            var command = this.command;
            
            this.commandHistory.pop();
            this.commandHistory.push(command);
            this.commandHistory.push('');
            this.commandHistoryIndex = this.commandHistory.length - 1;

            machine.shell(command, function(output) {
                
                if(!that.shellOutputItems.content){
                    that.shellOutputItems.set('content', new Array());
                }

                that.shellOutputItems.arrayContentWillChange(0, 0, 1);

                that.shellOutputItems.content.unshift({
                    command: "# " + command,
                    output: output,
                    cmdIndex: "cmd-" + that.shellOutputItems.content.length
                });
                that.shellOutputItems.arrayContentDidChange(0, 0, 1);
                Em.run.next(function() {
                    try {
                         $(".shell-return").accordion("destroy").accordion({ header: "h3", collapsible: true });
                    } catch(e) {
                         $(".shell-return").accordion({ header: "h3", collapsible: true });
                    }
                    $($.mobile.activePage).find(".shell-return .command").first().addClass('pending');
                    $($.mobile.activePage).find("a.shell-send").addClass('ui-disabled');
                });

            });
            this.clear();

            if ('localStorage' in window && window['localStorage'] !== null) {
                var stored = localStorage['shellHistory'];
                if (stored) {
                    stored = stored.split(',');
                } else {
                    stored = new Array();
                }
                if(stored.indexOf(command) == -1){
                    stored.push(command);
                    localStorage['shellHistory'] = stored;
                }
            }
            this.availableCommands.push(command);
            this.$("input[type=text]").autocomplete("close");
            this.$("input[type=text]").autocomplete({
                source : this.availableCommands
            });
        },

        clear: function() {
            this.set('command', '');
        }
    });
});
