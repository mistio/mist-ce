define('app/views/shell', [ 'text!app/templates/shell.html', 'ember' ],
/**
 * 
 * Shell dialog
 * 
 * @returns Class
 */
function(shell_html) {
	return Ember.View.extend({
		tagName : false,
		machineBinding : 'Mist.machine',
		shellOutputItems: Ember.ArrayController.create(),
		
		availableCommands: [ "dmesg", "uptime", "uname",
		      					"ls", "reboot", "whoami", "ifconfig" ],

		didInsertElement : function() {

			if('localStorage' in window && window['localStorage'] !== null){
				var stored = localStorage['shellHistory'];
				if(stored){
					stored = stored.split(',');
					
					var that = this;
					
					stored.forEach(function(cmd){
						if(that.availableCommands.indexOf(cmd) == -1){
							that.availableCommands.push(cmd);
						}
					});
				}
			}
			this.$("input[type=text]").autocomplete({
				source : this.availableCommands
			});
		},

		submit : function() {
			var machine = this.machine;
			if (!machine) {
				Mist.backendsController.forEach(function(backend) {
					backend.machines.forEach(function(m) {
						if (m.selected && m.hasKey) {
							console.log('machine selected');
							machine = m;
						}
					});
				});
			}
			if (!machine || !this.command) {
				return;
			}

			this.set('machine', machine);
			var that = this;

			var command = this.command;

			this.machine.shell(command, function(output) {
				
				if(!that.shellOutputItems.content){
					that.shellOutputItems.set('content', new Array());
				}
				
				that.shellOutputItems.arrayContentWillChange(0, 0, 1);
				
				that.shellOutputItems.content.unshift({
					command: "$" + command,
					output: output.replace(/\n/g, '<br />')
				});
				that.shellOutputItems.arrayContentDidChange(0, 0, 1);
			});
			this.clear();
			
			if('localStorage' in window && window['localStorage'] !== null){
				var stored = localStorage['shellHistory'];
				if(stored){
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
			this.$("input[type=text]").autocomplete("destroy");
			this.$("input[type=text]").autocomplete({
				source : this.availableCommands
			});
		},

		clear : function() {
			this.set('command', '');
		},

		disabledClass : function() {
			if (this.command && this.command.length > 0) {
				return '';
			} else {
				return 'ui-disabled';
			}
		}.property('command'),

		init : function() {
			this._super();
			// cannot have template in home.pt as pt complains
			this.set('template', Ember.Handlebars.compile(shell_html));
		},
	});
});
