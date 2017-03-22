//
//  Application Loader
//
//
//  Problem: Before hidding the splash screen (the black screen with the logo
//      that appears when the app loads) a series of steps must be completed.
//      Due to the many dependencies of mist.io and the serial loading
//      approach (all steps get executed one by one) the loading time skyrokets.
//
//
//  Solution: A parallel step execution mechanism. Each step gets executed
//      when only it's own dependencies (which are steps) are completed.
//
//
//  More info: Into the "appLoader" object are defined the steps that need
//      to be completed in order to hide the splash screen.
//
//      Every step defines an "exec" function which is called once all of the
//      steps in it's "before" array are executed and completed.
//


var appLoader = {

    //
    //  Properties
    //

    buffer: null,
    progress: null,
    progressStep: null,


    //
    //  Initialization
    //

    init: function (steps) {
        this.steps = steps;
        this.buffer = {};
        this.progress = 0;
        this.progressStep = 100 / Object.keys(this.steps).length;
        this.start();
    },


    //
    //  Methods
    //

    start: function () {
        forIn(this.steps, function (step) {
            if (step.before.length == 0)
                step.exec();
        });
    },

    complete: function (completedStep) {
        // Update progress bar
        this.progress += this.progressStep;
        changeLoadProgress(Math.ceil(this.progress))

        // Update other steps
        forIn(this.steps, function (step, stepName) {
            // Check if "completedStep" is a dependency of "step"
            var index = step.before.indexOf(completedStep);

            if (index == -1) return;

            // Remove dependency from array
            step.before.splice(index, 1);

            // If "step" has no more dependencies, execute it
            if (step.before.length == 0)
                step.exec();
        });
    },


    finish: function () {
        // Clean up variables to save up some memory
        loadApp = null;
        loadFiles = null;
        loadImages = null;
        handleMobileInit = null;
        changeLoadProgress = null;
        appLoader = null;

        info('Loaded in', Date.now() - startTime, 'ms');
    },


    //
    //  Steps
    //

    steps: []
};


var changeLoadProgress = function (progress) {
    $('.mist-progress').animate({
        'width': progress + '%'
    }, 300, function () {
        if (progress >= 100) {
            $('body').css('overflow','auto');
            $('body').enhanceWithin();
            $('#splash').fadeOut(300);
            if (appLoader)
              appLoader.finish();
        }
    });
};


var loadImages = function (callback) {
    // Spritesheet's name includes a timestamp each
    // time we generate it. So we use this "hack" to
    // get it's path and preload it
    var dummy = $('<div class="user"></div>').appendTo('body');
    var url = dummy.css('background-image')
    .split("(")[1] // remove "url()" wrapper
    .split(")")[0]
    .replace(/\"/g, ""); // remove extra quotes
    dummy.remove();
    // Hardcode images not on the spritesheet
    var images = [
        url,
        'resources/images/ajax-loader.gif',
        'resources/images/spinner.gif',
    ];
    var remaining = images.length;

    // Load 'em!
    for (var i = 0; i < images.length; i++) {
        var img = new Image();
        img.onload = onImageLoad;
        img.src = images[i];
    }

    function onImageLoad () {
        if (--remaining == 0)
            callback();
    }
};


var handleMobileInit = function () {
    $(document).one('mobileinit', function() {
        $.mobile.ajaxEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.ignoreContentEnabled = true;
        $.mobile.panel.prototype._bindUpdateLayout = function(){};
    });
};


//
//  Ajax wrapper
//

function Ajax (csrfToken) {
    return new function () {

        this.GET = function(url, data) {
            return this.ajax('GET', url, data);
        };
        this.PUT = function(url, data) {
            return this.ajax('PUT', url, data);
        };
        this.POST = function(url, data) {
            return this.ajax('POST', url, data);
        };
        this.DELETE = function(url, data) {
            return this.ajax('DELETE', url, data);
        };
        this.ajax = function(type, url, data) {

            var ret = {};
            var call = {};

            call.success = function(callback) {
                ret.success = callback;
                return call;
            };
            call.error = function(callback) {
                ret.error = callback;
                return call;
            };
            call.complete = function(callback) {
                ret.complete = callback;
                return call;
            };
            call.ajax = function() {

                var ajaxObject = {
                    url: url,
                    type: type,
                    headers: {
                        'Csrf-Token': csrfToken,
                        'Api-Version': 2,
                    },
                    complete: function(jqXHR) {
                        var success = (jqXHR.status == 200);
                        if (success && ret.success)
                            ret.success(jqXHR.responseJSON);
                        if (!success && ret.error)
                            ret.error(jqXHR.responseText, jqXHR.status);
                        if (ret.complete)
                            ret.complete(success, jqXHR.responseJSON, jqXHR);
                    }
                };

                if (data && Object.keys(data).length != 0)
                    ajaxObject.data = JSON.stringify(data);

                $.ajax(ajaxObject);

                return call;
            };
            return call.ajax();
        };
    }
};


//
//  Socket wrapper
//

var sockjs, mux;

function Socket (args) {

    if (!window.EventHandler)
        window.EventHandler = Ember.Object.extend(Ember.Evented, {});

    return Ember.Object.extend({

        //
        //  Properties
        //

        events: null,
        socket: null,
        namespace: null,
        channel: null,
        attempts: 0,

        //
        //  Public Methods
        //

        load: function (args) {
            this._log('initializing');
            this._parseArguments(args);

            var that = this;
            this._connect();
        }.on('init'),

        on: function (event) {
            var that = this;
            var events = this.get('events');
            var channel = this.get('channel');

            if (events)
                events.on.apply(events, arguments);
            if (!channel.$events || !socket.$events[event])
                channel.on(event, function (response) {
                    that._log('/'+ event, 'RECEIVE', response);
                    events.trigger.call(events, event, response);
                });
            return this;
        },

        send: function () {
            var args = slice(arguments);
            if (!args.length) {
                error('No arguments passed to send');
                return;
            }
            var msg = args[0];
            args = args.slice(1);
            this._log('/' + msg, 'EMIT', args);
            if (args.length) msg += ',' + JSON.stringify(args);
            var channel = this.get('channel');
            return channel.send(msg);
        },

        off: function () {
            var events = this.get('events');
            if (events)
                events.off.apply(events, arguments);
            return this;
        },

        emit: function () {
            this.send.apply(this, arguments);
            return this;
        },

        kill: function () {
            this.set('keepAlive', false);
            var channel = this.get('channel');
            //socket.socket.disconnect();
            if (channel.$events)
                for (event in channel.$events)
                    delete channel.$events[event];
            return this;
        },


        //
        //  Private Methods
        //

        _connect: function (callback) {
            var that = this;
            if (sockjs === undefined || sockjs.readyState > 1) {
                if (this.attempts > 0) {
                    info('Not connected... Reconnecting');
                }
                this.attempts++;
                sockjs = new SockJS('/socket', null,
                    {'transports':
                        ['websocket', 'xhr-polling']}
                );
                sockjs.onopen = function() {
                    mux = new MultiplexedWebSocket(sockjs);
                    Mist.set('mux', mux);
                    that._setupChannel(callback);
                    that.set('socket', sockjs);
                    that.attempts = 0;
                };
                sockjs.onerror = function(e) {
                    warn('Socket error', e);
                };
                sockjs.onclose = function(e){
                    warn('Disconnected. ', e.reason);
                    if (Mist.term) {
                        Mist.term.write('\n\rDisconnected from remote. ');
                        if (e.reason)
                            Mist.term.write(e.reason);
                    }
                    that._reconnect();
                };
            } else if (sockjs.readyState == 0) {
                info('Connecting...');
            } else if (sockjs.readyState == 1 && (Mist.get(this.get('namespace')) == null
                    || Mist.get(this.get('namespace')).get('socket') == null ||
                    Mist.get(this.get('namespace')).get('socket').readyState == 3)) {
                info('New channel', this.get('namespace'));
                if (Mist.get(that.get('namespace')))
                    Mist.get(that.get('namespace')).set('socket', sockjs);
                that._setupChannel(callback);
                return
            } else if (sockjs.readyState == 1) {
                // already connected
                this.attempts = 0;
                return
            }
        },

        _reconnect: function (callback) {
            Ember.run.later(this, function () {
                Mist.main._connect(function() {
                    if (Mist.get('logs'))
                        Mist.logs._connect();
                    if (Mist.get('shell'))
                        Mist.shell._connect();
                });
            }, this.attempts * 1000);
        },

        _parseArguments: function (args) {
            forIn(this, args, function (value, property) {
                this.set(property, value);
            });
        },

        _log: function () {
            if (!DEBUG_SOCKET)
                return;
            var args = slice(arguments);
            var preText = new Date().getPrettyTime() +
                ' | ' + this.get('namespace');
            args.unshift(preText);
            console.log.apply(console, args);
        },

        _setupChannel: function (callback){
          var channel = Mist.mux.channel(this.get('namespace'));
          var that = this;
          info('Connecting', this.get('namespace'))
          channel.onopen = function(e){
              setupChannelEvents(that, that.get('namespace'), function () {
                  info('Connected', that.get('namespace'));
                  that._log('Connected', that.get('namespace'));
                  if (callback instanceof Function)
                      callback();
                  if (that.onConnect instanceof Function)
                      that.onConnect(that);
                  if (appLoader)
                      appLoader.complete('fetch first data');
              });
          }
          this.set('channel', channel)
          this.set('events', EventHandler.create());
        }

    }).create(args);
}


// forEach like function on objects
function forIn () {
    var object = arguments[arguments.length - 2];
    var callback = arguments[arguments.length - 1];
    var thisArg = arguments.length == 3 ? arguments[0] : undefined;

    if (!(object instanceof Object))
        return false;

    var keys = Object.keys(object);
    var keysLength = keys.length;
    for (var i = 0; i < keysLength; i++) {
        var ret = callback.call(thisArg, object[keys[i]], keys[i]);
        if (ret === true)
            return true;
    }
    return false;
};


// Console aliases
function log() {
    if (LOGLEVEL > 3)
        console.log.apply(console, arguments);
}

function info() {
    if (LOGLEVEL > 2)
        console.info.apply(console, arguments);
}

function warn() {
    if (LOGLEVEL > 1)
        console.warn.apply(console, arguments);
}

function error() {
    if (LOGLEVEL > 0)
        console.error.apply(console, arguments);
}

function slice (args) {
    return Array.prototype.slice.call(args);
};


//
//  PROTOTYPE EXTENTIONS
//


String.prototype.decapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

Date.prototype.isFuture = function () {
    return this > new Date();
};

Date.prototype.getPrettyTime = function (noSeconds) {
    var hour = this.getHours();
    var min = this.getMinutes();
    var sec = this.getSeconds();

    var ret = (hour < 10 ? '0' : '') + hour + ':' +
        (min < 10 ? '0' : '') + min +
        (noSeconds ? '' : (':' + (sec < 10 ? '0' : '') + sec));

    return ret;
}

Date.prototype._toString = function () {
    var d = (this.getMonth() + 1) + "/" + this.getDate() + "/" + this.getFullYear();
    return d + ', ' + this.getPrettyTime();
}

Date.prototype.getPrettyDate = function (shortMonth) {
    return this.getMonthName(shortMonth) + ' ' + this.getDate() + ', ' + this.getFullYear();
}

Date.prototype.getPrettyDateTime = function (shortMonth, noSeconds) {
    return this.getPrettyDate(shortMonth) + ', ' + this.getPrettyTime(noSeconds);
}

Date.prototype.getMonthName = function (short) {
    if (short)
        return ['Jan','Feb','Mar','Apr','May','Jun','Jul',
            'Aug','Sep','Oct','Nov','Dec'][this.getMonth()];
    return ['January','February','March','April','May','June','July',
        'August','September','October','November','December'][this.getMonth()];
}

Date.prototype.diffToString = function (date) {
    var diff = this - date;
    var ret = '';

    if (diff < TIME_MAP.MINUTE)
        ret = parseInt(diff / TIME_MAP.SECOND) + ' sec';
    else if (diff < TIME_MAP.HOUR)
        ret = parseInt(diff / TIME_MAP.MINUTE) + ' min';
    else if (diff < TIME_MAP.DAY)
        ret = parseInt(diff / TIME_MAP.HOUR) + ' hour';
    else if (diff < TIME_MAP.MONTH)
        ret = parseInt(diff / TIME_MAP.DAY) + ' day';
    else if (diff < TIME_MAP.YEAR)
        ret = parseInt(diff / TIME_MAP.MONTH) + ' month';
    else
        ret = 'TOO LONG!';

    // Add 's' for plural
    if (ret.split(' ')[0] != '1')
        ret = ret + 's';

    return ret;
};

Date.prototype.getTimeFromNow = function () {
    var now = new Date();
    var diff = now - this;
    var ret = '';

    if (diff < 10 * TIME_MAP.SECOND)
        ret = 'Now';

    else if (diff < TIME_MAP.MINUTE)
        ret = parseInt(diff / TIME_MAP.SECOND) + ' sec';

    else if (diff < TIME_MAP.HOUR)
        ret = parseInt(diff / TIME_MAP.MINUTE) + ' min';

    else if (diff < TIME_MAP.DAY)
        ret = parseInt(diff / TIME_MAP.HOUR) + ' hour';

    else if (diff < 2 * TIME_MAP.DAY)
        ret = 'Yesterday';

    else if (diff < TIME_MAP.YEAR)
        ret = this.getMonthName(true) +  ' ' + this.getDate();

    if (ret.indexOf('sec') > -1 ||
        ret.indexOf('min') > -1 ||
        ret.indexOf('hour') > -1) {

        // Add 's' for plural
        if (ret.split(' ')[0] != '1')
            ret = ret + 's';

        ret = ret + ' ago';
    }

    return ret;
}

Array.prototype.containsPattern = function(args) {
	var match = false, haystack = this, needle = args;
	for (var i = 0, len1 = haystack.length; i < len1; i++) {
		if (needle[0] == haystack[i]) {
			for (var k = 1, len2 = needle.length; k < len2; k++) {
				if ((needle[k] && haystack[i + k]) || (!needle[k] && !haystack[i + k])) {
					if (k == len2 - 1) {
						match = true;
					}
				} else {
					break;
				}
			}

			if (match) {
				break;
			}
		}
	}

	return match;
}

Array.prototype.toStringByProperty = function (property) {
    return this.map(function (object) {
        return '"' + object[property] + '"';
    }).join(', ');
}


//  GLOBAL DEFINITIONS

var DISPLAYED_DATAPOINTS = 60;

var TIME_MAP = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 12 * 30 * 24 * 60 * 60 * 1000,
};

var DIALOG_TYPES = {
    OK: 0,
    OK_CANCEL: 1,
    YES_NO: 2,
    DONE_BACK: 3,
    BACK: 4,
};

var EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

var PROVIDER_MAP = {
    azure: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Azure',
        },
        {
            name: 'subscription_id',
            type: 'text',
            helpText: 'You can find your subscriptionID on the Azure portal',
            helpHref: 'http://docs.mist.io/article/18-adding-microsoft-azure'
        },
        {
            name: 'certificate',
            type: 'file',
            label: ' ',
            buttonText: 'Add Certificate',
            buttonFilledText: 'Certificate',
            helpText: 'Your Azure certificate PEM file',
            helpHref: 'http://docs.mist.io/article/18-adding-microsoft-azure'
        }
    ],

    bare_metal: [
        {
            name: 'title',
            type: 'text',
        },
        {
            name: 'machine_ip',
            type: 'text',
            label: 'Hostname',
            optional: true,
            placeholder: 'DNS or IP ',
            helpText: 'The URL or IP adress that your server listens to',
            helpHref: 'http://docs.mist.io/article/28-adding-other-servers'
        },
        {
            name: 'windows',
            type: 'slider',
            label: 'Operating System',
            onLabel: 'Windows',
            offLabel: 'Unix',
            onValue: true,
            offValue: false,
            optional: true,
            on: [
                {
                    name: 'remote_desktop_port',
                    type: 'text',
                    label: 'Remote Desktop Port',
                    defaultValue: '3389',
                    optional: true,
                }
            ],
            off: [
                {
                    name: 'machine_key',
                    type: 'ssh_key',
                    label: 'SSH Key',
                    optional: true,
                },
                {
                    showIf: 'machine_key',
                    name: 'machine_user',
                    type: 'text',
                    label: 'User',
                    optional: true,
                    defaultValue: 'root',
                },
                {
                    showIf: 'machine_key',
                    name: 'machine_port',
                    type: 'text',
                    label: 'Port',
                    defaultValue: '22',
                    optional: true,
                },
            ]
        },
        {
            name: 'monitoring',
            type: 'checkbox',
            label: 'Enable monitoring',
            defaultValue: true,
        }
    ],

    coreos: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'CoreOS',
        },
        {
            name: 'machine_ip',
            type: 'text',
            label: 'Hostname',
            placeholder: 'DNS or IP '
        },
        {
            name: 'machine_key',
            type: 'ssh_key',
            label: 'SSH Key',
            optional: true,
        },
        {
            showIf: 'machine_key',
            name: 'machine_user',
            type: 'text',
            label: 'User',
            optional: true,
            defaultValue: 'root',
        },
        {
            showIf: 'machine_key',
            name: 'machine_port',
            type: 'text',
            label: 'Port',
            defaultValue: '22',
            optional: true,
        },
        {
            name: 'monitoring',
            type: 'checkbox',
            label: 'Enable monitoring',
            defaultValue: true,
        }
    ],

    digitalocean: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'DigitalOcean',
        },
        {
            name: 'token',
            type: 'password',
            helpText: 'You can find your API Token on the Digital Ocean portal',
            helpHref: 'http://docs.mist.io/article/19-adding-digital-ocean',
        },
    ],

    hostvirtual: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'HostVirtual',
        },
        {
            name: 'api_key',
            type: 'password',
            helpText: 'You can find your API Token on the HostVirtual portal',
            helpHref: 'http://docs.mist.io/article/22-adding-hostvirtual'
        },
    ],

    vultr: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Vultr',
        },
        {
            name: 'api_key',
            type: 'password',
            helpText: 'You can find your API Token on the Vultr portal',
            helpHref: 'http://docs.mist.io/article/72-adding-vultr'
        },
    ],

    packet: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Packet.net',
        },
        {
            name: 'api_key',
            type: 'password',
            helpText: 'You can find your API Token on the Packet.net portal',
            helpHref: 'http://docs.mist.io/article/100-adding-packet'
        },
        {
            name: 'project_id',
            type: 'text',
            label: 'Project',
            optional: true,
            helpText: 'Optionally specify the project name'
        }
    ],

    docker: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Docker',
        },
        {
            name: 'docker_host',
            type: 'text',
            label: 'Host',
            helpText: 'The URL or IP your Docker engine listens to',
            helpHref: 'http://docs.mist.io/article/20-adding-docker',
        },
        {
            name: 'docker_port',
            type: 'text',
            label: 'Port',
            optional: true,
            defaultValue: '4243',
            helpText: 'The port your Docker engine listens to',
            helpHref: 'http://docs.mist.io/article/20-adding-docker',
        },
        {
            type: 'slider',
            label: 'Authentication',
            optional: true,
            onLabel: 'TLS',
            offLabel: 'Basic',
            on: [
                {
                    name: 'key_file',
                    type: 'file',
                    label: 'PEM Key',
                    buttonText: 'Add Key',
                    buttonFilledText: 'Key',
                    optional: true
                },
                {
                    name: 'cert_file',
                    type: 'file',
                    label: 'PEM Certificate',
                    buttonText: 'Add Certificate',
                    buttonFilledText: 'Certificate',
                    optional: true
                },
                {
                    name: 'ca_cert_file',
                    type: 'file',
                    label: 'CA Certificate',
                    buttonText: 'Add CA Certificate',
                    buttonFilledText: 'CA Certificate',
                    optional: true
                }
            ],
            off: [
                {
                    name: 'auth_user',
                    type: 'text',
                    label: 'User',
                    optional: true,
                },
                {
                    name: 'auth_password',
                    type: 'password',
                    label: 'Password',
                    optional: true,
                }
            ],
            helpText: 'The type of authentication your Docker engine uses',
            helpHref: 'http://docs.mist.io/article/20-adding-docker',
        },
    ],

    ec2: [
        {
            name: 'region',
            type: 'region',
            label: 'Region'
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'EC2',
        },
        {
            name: 'api_key',
            type: 'text',
            helpText: 'You can find your API key on your Amazon console',
            helpHref: 'http://docs.mist.io/article/17-adding-amazon-ec2',
        },
        {
            name: 'api_secret',
            type: 'password',
            helpText: 'You can find your API secret on your Amazon console',
            helpHref: 'http://docs.mist.io/article/17-adding-amazon-ec2',
        }
    ],

    gce: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'GCE',
        },
        {
            name: 'project_id',
            type: 'text',
            helpText: 'You can find your project ID on your GCE portal',
            helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
        },
        {
            name: 'private_key',
            label: ' ',
            type: 'file',
            buttonText: 'Add JSON Key',
            buttonFilledText: 'JSON Key',
            helpText: 'You can create a new key on your GCE portal',
            helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
        }
    ],

    hpcloud: [
        {
            name: 'region',
            type: 'region',
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'HP',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'password',
            type: 'password',
        },
        {
            name: 'tenant_name',
            type: 'text',
            helpText: 'You can find your tenant name on HP Cloud portal',
            helpHref: 'http://docs.mist.io/article/74-adding-hp-cloud'
        }
    ],

    linode: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Linode',
        },
        {
            name: 'api_key',
            type: 'text',
            helpText: 'You can create an API key on your Linode portal',
            helpHref: 'http://docs.mist.io/article/25-adding-linode',
        }
    ],

    nephoscale: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Nephoscale',
        },
        {
            name: 'username',
            type: 'text',
            helpText: 'The username you use to connect to the Nephoscale portal',
        },
        {
            name: 'password',
            type: 'password',
            helpText: 'The password you use to connect to the Nephoscale portal',
        }
    ],

    openstack: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'OpenStack',
        },
        {
            name: 'username',
            type: 'text',
        },
        {
            name: 'password',
            type: 'password',
        },
        {
            name: 'auth_url',
            type: 'text',
            helpText: 'Your OpenStack Auth URL',
            helpHref: 'http://docs.mist.io/article/27-adding-openstack',
        },
        {
            name: 'tenant_name',
            type: 'text',
        },
        {
            name: 'region',
            type: 'text',
            optional: true,
        },
    ],

    rackspace: [
        {
            name: 'region',
            type: 'region',
        },
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Rackspace',
        },
        {
            name: 'username',
            type: 'text',
            helpText: 'The username you use to connect to the RackSpace portal',
        },
        {
            name: 'api_key',
            type: 'password',
            helpText: 'You can find your API key on your RackSpace portal',
            helpHref: 'http://docs.mist.io/article/29-adding-rackspace',
        }
    ],

    softlayer: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'SoftLayer',
        },
        {
            name: 'username',
            type: 'text',
            helpText: 'The username you use to connect to the SoftLayer portal',
        },
        {
            name: 'api_key',
            type: 'password',
            helpText: 'You can find your API key on your SoftLayer portal',
            helpHref: 'http://docs.mist.io/article/30-adding-softlayer',
        }
    ],

    libvirt: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'KVM (libvirt)',
        },
        {
            name: 'machine_hostname',
            label: 'KVM hostname',
            type: 'text',
            helpText: 'The URL or IP that your KVM hypervisor listens to',
            helpHref: 'http://docs.mist.io/article/24-adding-kvm',
        },
        {
            name: 'machine_key',
            type: 'ssh_key',
            label: 'SSH key',
            optional: true,
            helpText: 'If you don\'t specify an SSH key, mist.io will assume that you are connecting via tcp (qemu+tcp)',
            helpHref: 'http://docs.mist.io/article/24-adding-kvm',
        },
        {
            name: 'machine_user',
            type: 'text',
            label: 'SSH user',
            optional: true,
            defaultValue: 'root',
            helpText: 'The SSH user that Mist.io should try to connect as',
        },
        {
            name: 'ssh_port',
            type: 'text',
            label: 'SSH port',
            optional: true,
            defaultValue: '22',
        },
        {
            name: 'images_location',
            type: 'text',
            label: 'Path for *.iso images',
            optional: true,
            defaultValue: '/var/lib/libvirt/images',
            helpText: 'The path that your disk or iso images are located, example /var/lib/libvirt/images',
        },

    ],

    vcloud: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'VMware vCloud'
        },
        {
            name: 'username',
            type: 'text',
            helpText: 'The username you use to login to vCloud Director',
        },
        {
            name: 'password',
            type: 'password',
            helpText: 'The password you use to login to vCloud Director',
        },
        {
            name: 'organization',
            type: 'text'
        },
        {
            name: 'host',
            type: 'text',
            label: 'Hostname',
            helpText: 'The URL or IP vCloud listens to',
            helpHref: 'http://docs.mist.io/article/31-adding-vmware-vcloud'
        }
    ],

    indonesian_vcloud: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'Indonesian Cloud'
        },
        {
            name: 'username',
            type: 'text',
            helpText: 'The username you use to login Indonesian Cloud\'s portal',

        },
        {
            name: 'password',
            type: 'password',
            helpText: 'The password you use to login Indonesian Cloud\'s portal',
        },
        {
            name: 'organization',
            type: 'text',
            helpText: 'Name of your oganization',
            helpHref: 'http://docs.mist.io/article/23-adding-indonesian-cloud'
        },
        {
            name: 'indonesianRegion',
            label: 'Region',
            optional: true,
            defaultValue: 'my.idcloudonline.com',
            type: 'indonesianRegion'
        }
    ],

    vsphere: [
        {
            name: 'title',
            type: 'text',
            defaultValue: 'VMware vSphere'
        },
        {
            name: 'username',
            type: 'text'
        },
        {
            name: 'password',
            type: 'password'
        },
        {
            name: 'host',
            type: 'text',
            label: 'Hostname',
            helpText: 'The URL or IP vSphere listens to',
            helpHref: 'http://docs.mist.io/article/73-adding-vsphere'
        }
    ]
};

var OS_MAP = [
    [
        ['rhel', 'redhat', 'red hat'], 'redhat'
    ],
    [
        ['ubuntu'], 'ubuntu'
    ],
    [
        ['ibm'], 'ibm'
    ],
    [
        ['canonical'], 'canonical'
    ],
    [
        ['sles', 'suse'], 'suse'
    ],
    [
        ['oracle'], 'oracle'
    ],
    [
        ['karmic'], 'karmic'
    ],
    [
        ['opensolaris'], 'opensolaris'
    ],
    [
        ['gentoo'], 'gentoo'
    ],
    [
        ['opensuse'], 'opensuse'
    ],
    [
        ['fedora'], 'fedora'
    ],
    [
        ['centos'], 'centos'
    ],
    [
        ['fedora'], 'fedora'
    ],
    [
        ['debian'], 'debian'
    ],
    [
        ['amazon'], 'amazon'
    ],
    [
        ['windows'], 'windows'
    ],
    [
        ['cirros'], 'cirros'
    ],
    [
        ['packet', 'packet']
    ]
];
