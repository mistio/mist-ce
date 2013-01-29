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
        tagName: false,
        machineBinding: 'Mist.machine',
        shellOutputItems: Ember.ArrayController.create(),
        availableCommands: [], //"dmesg", "uptime", "uname", "ls", "reboot", "whoami", "ifconfig" ],

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
            var machine = this.machine;

            if (!machine || !machine.hasKey || !this.command) {
                return;
            }
            var that = this;

            var command = this.command;

            this.machine.shell(command, function(output) {

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
        },

        back: function() {
            this.set('command', '');
            if (history.state) {
                history.go(-1);
            } else {
                // this is needed if you've ran a shell command before pressing back
                // html streaming breaks the current history object
                history.go(-2);
            }
        },

        disabledClass: function() {
            if (this.command && this.command.length > 0 && !Mist.machine.pendingShell) {
                return '';
            } else {
                return 'ui-disabled';
            }
        }.property('command'),

        init: function() {
            this._super();
            // cannot have template in home.pt as pt complains
            this.set('template', Ember.Handlebars.compile(shell_html));
        },
    });
});
