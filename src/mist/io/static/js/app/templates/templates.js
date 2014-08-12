define('app/templates/templates', ['ember'], function() {
  return function (callback) {
    if (!JS_BUILD) {
      require([
        'text!app/templates/backend_add.html',
        'text!app/templates/backend_edit.html',
        'text!app/templates/confirmation_dialog.html',
        'text!app/templates/file_upload.html',
        'text!app/templates/graph.html',
        'text!app/templates/graph_button.html',
        'text!app/templates/home.html',
        'text!app/templates/image_list.html',
        'text!app/templates/image_list_item.html',
        'text!app/templates/key.html',
        'text!app/templates/key_add.html',
        'text!app/templates/key_edit.html',
        'text!app/templates/key_list.html',
        'text!app/templates/key_list_item.html',
        'text!app/templates/login.html',
        'text!app/templates/machine.html',
        'text!app/templates/machine_add.html',
        'text!app/templates/machine_keys.html',
        'text!app/templates/machine_keys_list_item.html',
        'text!app/templates/machine_list.html',
        'text!app/templates/machine_list_item.html',
        'text!app/templates/machine_manual_monitoring.html',
        'text!app/templates/machine_power.html',
        'text!app/templates/machine_shell.html',
        'text!app/templates/machine_shell_list_item.html',
        'text!app/templates/machine_tags.html',
        'text!app/templates/machine_tags_list_item.html',
        'text!app/templates/messagebox.html',
        'text!app/templates/metric_add.html',
        'text!app/templates/metric_add_custom.html',
        'text!app/templates/metric_node.html',
        'text!app/templates/monitoring.html',
        'text!app/templates/rule.html',
        'text!app/templates/rule_edit.html',
        'text!app/templates/user_menu.html',
      ], function () {
        Ember.TEMPLATES['backend_add/js'] = Ember.Handlebars.compile(arguments[0]);
        Ember.TEMPLATES['backend_edit/js'] = Ember.Handlebars.compile(arguments[1]);
        Ember.TEMPLATES['confirmation_dialog/js'] = Ember.Handlebars.compile(arguments[2]);
        Ember.TEMPLATES['file_upload/js'] = Ember.Handlebars.compile(arguments[3]);
        Ember.TEMPLATES['graph/js'] = Ember.Handlebars.compile(arguments[4]);
        Ember.TEMPLATES['graph_button/js'] = Ember.Handlebars.compile(arguments[5]);
        Ember.TEMPLATES['home/js'] = Ember.Handlebars.compile(arguments[6]);
        Ember.TEMPLATES['image_list/js'] = Ember.Handlebars.compile(arguments[7]);
        Ember.TEMPLATES['image_list_item/js'] = Ember.Handlebars.compile(arguments[8]);
        Ember.TEMPLATES['key/js'] = Ember.Handlebars.compile(arguments[9]);
        Ember.TEMPLATES['key_add/js'] = Ember.Handlebars.compile(arguments[10]);
        Ember.TEMPLATES['key_edit/js'] = Ember.Handlebars.compile(arguments[11]);
        Ember.TEMPLATES['key_list/js'] = Ember.Handlebars.compile(arguments[12]);
        Ember.TEMPLATES['key_list_item/js'] = Ember.Handlebars.compile(arguments[13]);
        Ember.TEMPLATES['login/js'] = Ember.Handlebars.compile(arguments[14]);
        Ember.TEMPLATES['machine/js'] = Ember.Handlebars.compile(arguments[15]);
        Ember.TEMPLATES['machine_add/js'] = Ember.Handlebars.compile(arguments[16]);
        Ember.TEMPLATES['machine_keys/js'] = Ember.Handlebars.compile(arguments[17]);
        Ember.TEMPLATES['machine_keys_list_item/js'] = Ember.Handlebars.compile(arguments[18]);
        Ember.TEMPLATES['machine_list/js'] = Ember.Handlebars.compile(arguments[19]);
        Ember.TEMPLATES['machine_list_item/js'] = Ember.Handlebars.compile(arguments[20]);
        Ember.TEMPLATES['machine_manual_monitoring/js'] = Ember.Handlebars.compile(arguments[21]);
        Ember.TEMPLATES['machine_power/js'] = Ember.Handlebars.compile(arguments[22]);
        Ember.TEMPLATES['machine_shell/js'] = Ember.Handlebars.compile(arguments[23]);
        Ember.TEMPLATES['machine_shell_list_item/js'] = Ember.Handlebars.compile(arguments[24]);
        Ember.TEMPLATES['machine_tags/js'] = Ember.Handlebars.compile(arguments[25]);
        Ember.TEMPLATES['machine_tags_list_item/js'] = Ember.Handlebars.compile(arguments[26]);
        Ember.TEMPLATES['messagebox/js'] = Ember.Handlebars.compile(arguments[27]);
        Ember.TEMPLATES['metric_add/js'] = Ember.Handlebars.compile(arguments[28]);
        Ember.TEMPLATES['metric_add_custom/js'] = Ember.Handlebars.compile(arguments[29]);
        Ember.TEMPLATES['metric_node/js'] = Ember.Handlebars.compile(arguments[30]);
        Ember.TEMPLATES['monitoring/js'] = Ember.Handlebars.compile(arguments[31]);
        Ember.TEMPLATES['rule/js'] = Ember.Handlebars.compile(arguments[32]);
        Ember.TEMPLATES['rule_edit/js'] = Ember.Handlebars.compile(arguments[33]);
        Ember.TEMPLATES['user_menu/js'] = Ember.Handlebars.compile(arguments[34]);
        callback();
      });
      return;
    }
Ember.TEMPLATES["backend_add/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<label for=\"new-backend-second-field\">3. ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.secondFieldLabel", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>");
  hashContexts = {'type': depth0,'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'type': "STRING",'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'type': ("password"),
    'id': ("new-backend-second-field"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendSecondField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\" data-theme=\"a\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"add-backend-panel\" data-swipe-close=\"false\" class=\"side-panel\" data-role=\"panel\" data-position=\"right\" data-display=\"overlay\" data-theme=\"b\"><div data-role=\"header\"><h1>Add backend</h1><a class=\"ui-btn-right\" data-icon=\"info\" data-iconpos=\"notext\" data-theme=\"b\" target=\"_blank\" href=\"https://mistio.zendesk.com/hc/en-us\"></a></div><div data-role=\"content\" data-theme=\"b\"><label>1. Provider:</label><div id=\"new-backend-provider\" class=\"mist-select\" data-role=\"collapsible\" data-collapsed-icon=\"carat-d\" data-expanded-icon=\"carat-u\" data-iconpos=\"right\" data-theme=\"a\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendAddController.newBackendProvider.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul class=\"select-listmenu\" data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.providerList", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><div id=\"common-bundle\"><div data-theme=\"a\"><label for=\"new-backend-first-field\">2. ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.firstFieldLabel", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-first-field"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendFirstField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.secondFieldLabel", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div><div id=\"hpcloud-bundle\" data-theme=\"a\"><label for=\"new-backend-hpcloud-tenant\">4. Tenant Name:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-hpcloud-tenant"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackTenant")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div id=\"openstack-bundle\" data-theme=\"a\"><label for=\"new-backend-openstack-url\">4. Auth URL:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-url"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackURL")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"new-backend-openstack-tenant\">5. Tenant Name:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-tenant"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackTenant")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"opentack-advanced-wrapper\"><select id=\"openstack-advanced\" data-role=\"slider\" data-theme=\"a\" ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "advancedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><option value=\"0\">Basic settings</option><option value=\"1\">Advanced settings</option></select></div><div id=\"non-hp-cloud\"><label for=\"new-backend-openstack-region\">6. Region:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-region"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackRegion")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"new-backend-openstack-endpoint\">7. Compute Endpoint:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-endpoint"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackComputeEndpoint")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div></div><div id=\"gce-bundle\"><label for =\"new-backend-key\">3. Private key:</label><a class=\"ui-btn ui-btn-a ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "privateKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Add key </a><label for=\"new-backend-port\">4. Project ID:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-project-name"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendProjectName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div id=\"baremetal-bundle\"><label for=\"new-backend-port\">4. Port:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-port"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendPort")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label>5. SSH Key:</label><div id=\"new-backend-key\" class=\"mist-select\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"carat-d\" data-expanded-icon=\"carat-u\" data-theme=\"a\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendAddController.newBackendKey.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li data-icon=\"false\" data-theme=\"d\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Key</a></li></ul></div></div><div id=\"docker-bundle\"><label for=\"new-backend-docker-url\">2. Host:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-url"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendDockerURL")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"new-backend-docker-port\">3. Port:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-port"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendPort")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"new-backend-docker-user\">4. BasicAuth User:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-user"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendFirstField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"new-backend-docker-pass\">5. BasicAuth Password:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-pass"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendSecondField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.addingBackend", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-theme=\"a\">Back</a><button id=\"new-backend-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a></div></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.fileUploadView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["backend_edit/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"backend-edit-screen\" class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\"></div><div id=\"backend-edit-popup\" class=\"pop ui-popup-container ui-popup-hidden ui-popup-truncate\"><div id=\"backend-edit\" class=\"mid-popup ui-popup ui-body-a ui-overlay-shadow ui-corner-all\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">Edit backend</h1></div><div role=\"main\" class=\"ui-content\" data-theme=\"a\">");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.backendEditController.newTitle")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div data-role=\"fieldcontain\"><select id=\"backend-toggle\" data-role=\"slider\" ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "stateToggleSwitched", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><option value=\"0\">Disabled</option><option value=\"1\">Enabled</option></select><span class=\"state\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendEditController.backend.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></div><a class=\"ui-btn ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view"),
    'on': ("click")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Delete </a><div id=\"backend-delete-confirm\"><label>Confirm backend removal?</label><label id=\"monitoring-message\">There are monitored machines. <br />Monitoring for these will be disabled </label><div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn ui-shadow ui-corner-all\" id=\"button-confirm-disable\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "yesClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Yes</a><a class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "noClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">No</a></div></div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.deletingBackend", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a class=\"ui-btn ui-shadow ui-corner-all button-back\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["confirmation_dialog/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"confirmation-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"><div data-role=\"header\" data-theme=\"b\"><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.confirmationController.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1></div><div data-role=\"content\" data-theme=\"a\"><p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.confirmationController.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><button data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "noClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">No</button><button ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "yesClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Yes</button></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["file_upload/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader add-key-loader\"></div>");
  }

  data.buffer.push("<div id=\"file-upload\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"><div data-role=\"header\" data-theme=\"b\"><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.fileUploadController.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1></div><div data-role=\"content\" data-theme=\"a\"><label for=\"textarea-private-key\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.fileUploadController.label", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(": ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.fileUploadController.uploadingFile", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("upload-area"),
    'valueBinding': ("Mist.fileUploadController.file")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<a class=\"ui-btn ui-corner-all ui-btn-a ui-btn-icon-right ui-icon-arrow-u\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Upload</a><input id=\"file-upload-input\" type=\"file\" name=\"file\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/><div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn ui-corner-all ui-btn-a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a><a id=\"file-upload-ok\" class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Done</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push(" (");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.graph.unit", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(") ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.graph.pendingRemoval", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.graph.isBuiltIn", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a class=\"ui-btn ui-btn-icon-notext ui-corner-all ui-icon-carat-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "collapseClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">- </a>");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">x </a>");
  return buffer;
  }

function program8(depth0,data) {
  
  
  data.buffer.push("<svg> 	<g class=\"grid-x\"></g> 	<g class=\"grid-y\"></g><g class=\"valueArea\"><path></path></g><g class=\"valueLine\"><path></path></g><g class=\"x-axis\"></g><rect class=\"hideAnimeLine\"></rect><line class=\"axisLine x\"></line><line class=\"axisLine y\"></line><g class=\"y-axis\"></g></svg>");
  }

  data.buffer.push("<div class=\"graph\" ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  options = {hash:{
    'id': ("view.graph.id")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><div class=\"header\"><div class=\"title\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.graph.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.unit", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.pendingCreation", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.metrics.length", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_button/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"graphBtn\" ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  options = {hash:{
    'id': ("view.buttonId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><a class=\"ui-btn ui-btn-icon-left ui-icon-carat-u ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "expandClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.graph.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["home/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'backendBinding': depth0,'classBinding': depth0,'data-icon': depth0};
  hashTypes = {'backendBinding': "STRING",'classBinding': "STRING",'data-icon': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendButtonView", {hash:{
    'backendBinding': ("this"),
    'classBinding': ("state"),
    'data-icon': ("check")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<div id=\"home-page\" data-role=\"page\" class=\"ui-page-active ui-page ui-page-theme-a\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">mist.io</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div role=\"main\" class=\"ui-content\" data-theme=\"a\"><a id=\"add-backend-btn\" class=\"ui-link ui-btn ui-btn-d ui-icon-plus ui-btn-icon-right ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addBackend", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Add backend </a><div id=\"backend-buttons\" data-role=\"controlgroup\" data-type=\"horizontal\" class=\"ui-controlgroup ui-controlgroup-horizontal ui-corner-all\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow\"><li class=\"ui-li-has-count ui-first-child\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/machines\"> Machines <span class=\"ui-li-count ui-body-inherit\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendsController.machineCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></a></li><li class=\"ui-li-has-count\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/images\"> Images <span class=\"ui-li-count ui-body-inherit\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendsController.imageCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></a></li><li class=\"ui-li-has-count ui-last-child\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/keys\"> Keys <span class=\"ui-li-count ui-body-inherit\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.keysController.content.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></a></li></ul></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["image_list/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program3(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'imageBinding': depth0,'class': depth0};
  hashTypes = {'imageBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.imageListItemView", {hash:{
    'imageBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program5(depth0,data) {
  
  
  data.buffer.push(" Please wait... ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push(" Continue search on server... ");
  }

  data.buffer.push("<div id=\"image-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\"><div data-role=\"header\" data-theme=\"b\"><a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a><h1>Images</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div data-role=\"content\" data-theme=\"c\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingImages", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("search-term-input"),
    'placeholder': ("Search images ..."),
    'valueBinding': ("Mist.imageSearchController.searchTerm")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.imageSearchController.isSearching", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<ul id=\"image-list\" data-role=\"listview\" data-inset=\"true\" class=\"checkbox-list\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.renderedImages", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.renderingMoreImages", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<button id=\"images-advanced-search\" data-theme=\"b\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "searchClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><span>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.searchingImages", {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></button><div class=\"small-padding\"></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["image_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<label ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.starClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("	");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleImageStar", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">	");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.image.star")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchImage", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><h3>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h3><p class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><p class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.image.backend.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p></a>\n");
  return buffer;
  
});
Ember.TEMPLATES["key/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<div id=\"single-key-machines\" data-role=\"collapsible\"><h3>Machines ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h3><ul data-role=\"listview\" class=\"checkbox-list\" data-inset=\"true\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.machines", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div>");
  return buffer;
  }
function program4(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'machineBinding': depth0,'class': depth0};
  hashTypes = {'machineBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineListItemView", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<div id=\"single-key-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\"><div data-role=\"header\" data-theme=\"b\"><a href=\"#/keys\" class=\"responsive-button\" data-icon=\"arrow-l\">Keys</a><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div data-role=\"content\" data-theme=\"c\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.loading", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div data-role=\"collapsible\" data-collapsed=\"false\"><h3>Public Key ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPublicKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h3><input id=\"public-key\" type=\"text\" readonly=\"readonly\" onclick=\"this.focus();this.select()\"/></div><div data-role=\"collapsible\"><h3>Private key ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPrivateKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h3><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "displayClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Display</a></div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "machines", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"large-padding\"></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<!-- Since the private key is very sensitive information, it should be erased as soon as the popup is closed. We set the data-dismissible attribute to false to make sure that user will click the \"Back\" button to leave the popup (which will remove the private key from the textarea) --><div id=\"private-key-popup\" class=\"medium-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-dismissible=\"false\"><div data-role=\"header\" data-theme=\"b\"><h1>Private Key</h1></div><div data-role=\"content\"><textarea id=\"private-key\" readonly=\"readonly\" onclick=\"this.focus();this.select()\"></textarea><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div><div class=\"dual-action-footer\" data-role=\"footer\" data-theme=\"b\"><table><tbody><tr><td><a data-role=\"button\" data-icon=\"edit\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Rename</a></td><td><a data-role=\"button\" data-icon=\"delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Delete</a></td></tr></tbody></table></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_add/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader key-add-loader\"></div>");
  }

function program3(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.uploadingKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program5(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"key-add-screen\" class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\"></div><div id=\"key-add-popup\" class=\"flip ui-popup-container ui-popup-hidden ui-popup-truncate\"><div id=\"key-add\" class=\"large-popup ui-popup ui-body-inherit ui-overlay-shadow ui-corner-all\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><div class=\"ui-header ui-bar-b\" role=\"banner\"><h1 class=\"ui-title\">Add key</h1></div><div class=\"ui-content ui-body-a\" role=\"main\"><label for=\"key-add-id\">Name:</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("key-add-id"),
    'valueBinding': ("Mist.keyAddController.keyId")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"key-add-private\">Private Key: ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.generatingKey", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("key-add-private"),
    'valueBinding': ("Mist.keyAddController.keyPrivate")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"generate-upload ui-controlgroup ui-controlgroup-horizontal ui-group-theme-a ui-corner-all\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn ui-btn-icon-left ui-icon-gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "generateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Generate </a><a class=\"ui-btn ui-btn-icon-right ui-icon-arrow-u\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Upload </a></div><input id=\"key-add-upload\" type=\"file\" name=\"file\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.addingKey", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"ok-cancel ui-controlgroup ui-controlgroup-horizontal ui-group-theme-a ui-corner-all\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Back </a><a id=\"key-add-ok\" class=\"ui-btn ui-btn-d ui-state-disabled\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Add </a></div></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_edit/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"rename-key-popup\" class=\"small-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"slideup\"><div data-role=\"header\" data-theme=\"b\"><h1>Rename key</h1></div><div data-role=\"content\"><label for=\"new-key-name\">New name:</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-key-name"),
    'valueBinding': ("Mist.keyEditController.newKeyId")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.renamingKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a><button id=\"rename-key-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Save</button></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'keyBinding': depth0,'class': depth0};
  hashTypes = {'keyBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyListItemView", {hash:{
    'keyBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<div id=\"key-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\"><div data-role=\"header\" data-theme=\"b\"><a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a><h1>Keys</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div data-role=\"content\" data-theme=\"c\"><a id=\"select-keys-btn\" class=\"responsive-button\" data-role=\"button\" data-icon=\"arrow-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Select</a><a id=\"add-key-btn\" class=\"responsive-button\" data-role=\"button\" data-icon=\"plus\" data-iconpos=\"right\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a><ul data-role=\"listview\" data-filter=\"true\" data-inset=\"true\" data-filter-placeholder=\"Filter...\" class=\"checkbox-list\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul><div class=\"mid-padding\"></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"select-keys-popup\" data-role=\"popup\" data-transition=\"flip\" data-position-to=\"#select-keys-btn\"><ul data-role='listview'><li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", true, {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","BOOLEAN"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">All</a></li><li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", false, {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","BOOLEAN"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">None</a></li></ul></div><div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\"><table><tbody><tr><td><a data-role=\"button\" data-icon=\"edit\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Rename</a></td><td><a data-role=\"button\" data-icon=\"delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Delete</a></td><td><a data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setDefaultClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Set default</a></td></tr></tbody></table></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<div class=\"ui-grid-b\"><div class=\"ui-block-a key-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.key.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div class=\"ui-block-b\"></div><div class=\"ui-block-c key-tags\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.key.isDefault", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div>");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("<span class=\"tag\">default</span>");
  }

  data.buffer.push("<label>");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.key.selected")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "key", "view.key", options) : helperMissing.call(depth0, "link-to", "key", "view.key", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["login/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"login-popup\" class=\"mid-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"><div data-role=\"header\" data-theme=\"b\"><h1>Login to mist.io</h1></div><div data-role=\"content\"><label for=\"email\">Email:</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("email"),
    'valueBinding': ("Mist.loginController.email")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"password\">Password:</label>");
  hashContexts = {'id': depth0,'type': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'type': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("password"),
    'type': ("password"),
    'valueBinding': ("Mist.loginController.password")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.loginController.loggingIn", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "forgot", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" target=\"_new\">Forgot your password?</a><div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a><button id=\"login-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Log in</button></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("<a class=\"ui-btn ui-btn-icon-right ui-icon-plus ui-corner-all ui-state-disabled\"> Add key </a>");
  }

function program6(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "keysCount", {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"ui-btn ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "manageKeysClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "keysCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" keys </a>");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"ui-btn ui-btn-d ui-btn-icon-right ui-icon-plus ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Add key </a>");
  return buffer;
  }

function program11(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingMonitoring", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program12(depth0,data) {
  
  
  data.buffer.push("<div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\"><span class=\"ui-icon ui-icon-loading\"></span><h1>Enabling monitoring. Please wait</h1></div>");
  }

function program14(depth0,data) {
  
  
  data.buffer.push("<div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\"><span class=\"ui-icon ui-icon-loading\"></span><h1>Disabling monitoring. Please wait</h1></div>");
  }

function program16(depth0,data) {
  
  
  data.buffer.push("<div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\"><span class=\"ui-icon ui-icon-loading\"></span><h1>Fetching stats...</h1></div>");
  }

function program18(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingMonitoring", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program19(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "pendingFirstData", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.monitoringView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"rules-container\" data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.rules", {hash:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.rulesController.creationPending", {hash:{},inverse:self.noop,fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div id=\"monitoring-bottom-btns\"><div data-rule=\"ui-grid-a\"><div class=\"ui-block-a\"><a id=\"add-rule-button\" class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-plus\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addRuleClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Rule</a></div><!--div class=\"ui-block-b\"><a id=\"add-metric-btn\" class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-plus\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addMetricClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Metric</a></div--><div class=\"ui-block-b\"><a id=\"disable-monitor-btn\" class=\"ui-btn ui-corner-all ui-btn-b ui-btn-icon-left ui-icon-delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disableMonitoringClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Disable</a></div></div></div>");
  return buffer;
  }
function program20(depth0,data) {
  
  
  data.buffer.push("<div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\"><span class=\"ui-icon ui-icon-loading\"></span><h1>Waiting for data</h1></div>");
  }

function program22(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'ruleBinding': depth0};
  hashTypes = {'ruleBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.ruleView", {hash:{
    'ruleBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program24(depth0,data) {
  
  
  data.buffer.push("<div class=\"rule-box\" id=\"creation-rule\"><div class=\"ajax-loader\"></div></div>");
  }

function program26(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("<div class=\"monitoring-dialog-container\" id=\"monitoring-disabled\"><div id=\"enable-monitoring-bundle\"><div>Monitoring is currently disabled</div><a id=\"enable-monitor-btn\" class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-star\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enableMonitoringClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Enable</a>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineManualMonitoringController.gettingCommand", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div>");
  return buffer;
  }

function program28(depth0,data) {
  
  
  data.buffer.push(" probing... <div class=\"ajax-loader\"></div>");
  }

function program30(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.lastProbe", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<a id=\"machine-probe-btn\" class=\"ui-btn ui-shadow ui-corner-all\" data-mini=\"true\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Probe </a>");
  return buffer;
  }

function program32(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<tr><td>Up and running for</td><td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.upFor", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program34(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<tr><td>Load</td><td><div class=\"loadleds\"><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg15 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg5 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg1 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loadavg", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" - ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loadavg5", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program36(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<tr><td>Latency</td><td><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":netleds")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled4 :netled1")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled3 :netled2")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled2 :netled3")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled1 :netled4")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "latency", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("ms</td></tr>");
  return buffer;
  }

function program38(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<tr><td>Packet loss</td><td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loss", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program40(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<tr><td>Tags</td><td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "tags", {hash:{},inverse:self.noop,fn:self.program(41, program41, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td></tr>");
  return buffer;
  }
function program41(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>");
  return buffer;
  }

function program43(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<tr><td>Public IPs</td><td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.public_ips", {hash:{},inverse:self.noop,fn:self.program(44, program44, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td></tr>");
  return buffer;
  }
function program44(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<div class=\"ip\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>");
  return buffer;
  }

function program46(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<tr><td>Private IPs</td><td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.private_ips", {hash:{},inverse:self.noop,fn:self.program(44, program44, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program48(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<tr><td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "key", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td><td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td></tr>");
  return buffer;
  }

function program50(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<div id=\"single-machine-metadata\" data-role=\"collapsible\"><h3>Full metadata list</h3><table class=\"info-table\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.metadata", {hash:{},inverse:self.noop,fn:self.program(48, program48, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</table></div>");
  return buffer;
  }

  data.buffer.push("<div id=\"single-machine-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\"><div data-role=\"header\" data-theme=\"b\"><a href=\"#/machines\" class=\"responsive-button\" data-icon=\"arrow-l\">Machines</a><h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div data-role=\"header\" data-theme=\"a\" class=\"single-machine-header\"><span class=\"single-view-icon-wrapper\"><span id=\"single-view-provider-icon\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.providerIconClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></span></span><span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":single-view-icon-wrapper")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><span id=\"single-view-image-icon\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.imageIconClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></span></span><h1 ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.machine.state")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "view.machine.id", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("<span class=\"ui-btn-right\" id=\"mist-manage-keys\">");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingCreation", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</span></div><div data-role=\"content\" data-theme=\"c\">");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "enablingMonitoring", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "disablingMonitoring", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingStats", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("<div data-role=\"collapsible\" id=\"monitoring-collapsible\" data-collapsed=\"false\"><h3>Monitoring</h3>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasMonitoring", {hash:{},inverse:self.program(26, program26, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div><div data-role=\"collapsible\" data-collapsed=\"false\"><h3>Basic Info</h3><table class=\"info-table\"><tr><td>Last probed</td><td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "probing", {hash:{},inverse:self.program(30, program30, data),fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td></tr></tr>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "probed", {hash:{},inverse:self.noop,fn:self.program(32, program32, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "loadavg", {hash:{},inverse:self.noop,fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "latency", {hash:{},inverse:self.noop,fn:self.program(36, program36, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "loss", {hash:{},inverse:self.noop,fn:self.program(38, program38, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "tags", {hash:{},inverse:self.noop,fn:self.program(40, program40, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.public_ips", {hash:{},inverse:self.noop,fn:self.program(43, program43, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.private_ips", {hash:{},inverse:self.noop,fn:self.program(46, program46, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "view.basicInfo", {hash:{},inverse:self.noop,fn:self.program(48, program48, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</table></div>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.metadata", {hash:{},inverse:self.noop,fn:self.program(50, program50, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("<div class=\"mid-padding\"></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.ruleEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineKeysView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineShellView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machinePowerView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineManualMonitoringView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"manual-monitoring-popup\" class=\"mid-popup\" data-role=\"popup\" data-transition=\"popp\" data-overlay-theme=\"b\" data-disimissible=\"false\"><div data-role=\"header\" data-theme=\"b\"><h1>Manual collectd installation</h1></div><div data-role=\"content\" data-theme=\"c\"><p>Run these commands on your server:</p><textarea>Command here...</textarea><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeManualMonitoringPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div><div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\"><table><tbody><tr><td><a id=\"single-machine-tags-btn\" data-role=\"button\" data-icon=\"grid\"");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Tags</a></td><td><a id=\"single-machine-shell-btn\" data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shell</a></td><td><a id=\"single-machine-power-btn\" data-role=\"button\" data-icon=\"power\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Power</a></td></tr></tbody></table></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_add/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isBareMetal", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program5(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "Mist.machineAddController.newMachineProvider.images.hasStarred", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectImage", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program8(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "star", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program10(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectSize", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<span class=\"size-decription\"> - disk:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "disk", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(", ram:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "ram", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></a></li>");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectLocation", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push(" Estimated price: <span>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.price", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>");
  return buffer;
  }

  data.buffer.push("<div id=\"create-machine-panel\" data-swipe-close=\"false\" class=\"side-panel\" data-role=\"panel\" data-position=\"right\" data-display=\"overlay\" data-theme=\"b\"><div data-role=\"header\"><h1>Create Machine</h1></div><div data-role=\"content\" data-theme=\"b\"><label for=\"create-machine-name\">1. Name:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("create-machine-name"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label>2. Provider:</label><div id=\"create-machine-provider\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"arrow-d\" data-expanded-icon=\"arrow-u\" data-theme=\"a\" class=\"mist-select\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineProvider.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><label>3. Image:</label><div id=\"create-machine-image\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"arrow-d\" data-expanded-icon=\"arrow-u\" data-theme=\"a\" class=\"mist-select\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineImage.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.images.content", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><label>4. Size:</label><div id=\"create-machine-size\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"arrow-d\" data-expanded-icon=\"arrow-u\" data-theme=\"a\" class=\"mist-select\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineSize.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.sizes.content", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><label>5. Location:</label><div id=\"create-machine-location\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"arrow-d\" data-expanded-icon=\"arrow-u\" data-theme=\"a\" class=\"mist-select\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineLocation.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.locations.content", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><label>6. Key:</label><div id=\"create-machine-key\" data-role=\"collapsible\" data-iconpos=\"right\" data-collapsed-icon=\"arrow-d\" data-expanded-icon=\"arrow-u\" data-theme=\"a\" class=\"mist-select\"><h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineKey.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2><ul data-role=\"listview\" data-theme=\"a\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li data-icon=\"false\" data-theme=\"d\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Key</a></li></ul></div><label for=\"create-machine-script\">7.Script:</label>");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-script"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineScript")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"create-machine-cost\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.price", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div class=\"ok-cancel\" data-role=\"ui-grid-a\" ><div class=\"ui-block-a\"><a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div><div class=\"ui-block-b\"><button id=\"create-machine-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Launch!</button></div></div></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("<ul id=\"machine-keys\" data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul>");
  return buffer;
  }
function program2(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'keyBinding': depth0};
  hashTypes = {'keyBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineKeysListItemView", {hash:{
    'keyBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program6(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.disassociatingKey", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program8(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "nonAssociatedKeyClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-keys-panel\" data-swipe-close=\"false\" class=\"side-panel\" data-role=\"panel\" data-position=\"right\" data-display=\"overlay\" data-theme=\"b\"><div data-role=\"header\"><h1>Manage Keys</h1></div><div data-role=\"content\" data-theme=\"b\"><a id=\"associate-btn\" data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "associateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Associate</a>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.associatingKey", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"key-actions-popup\" class=\"tiny-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-position-to=\"#machine-keys\" data-theme=\"b\"><div data-role=\"header\"><h1>Actions</h1></div><div data-role=\"content\"><button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Remove</button><button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Probe</button><button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</button></div></div><div id=\"non-associated-keys-popup\" class=\"tiny-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-position-to=\"#associate-btn\"><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.nonAssociatedKeys", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li data-icon=\"false\" data-theme=\"d\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">New key</a></li></ul></div><!-- data-position-to=\"#machine-keys-panel\" --><div id=\"machine-userPort-popup\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-position-to=\"#machine-keys-panel\" data-transition=\"pop\"><div data-role=\"header\" data-theme=\"b\"><h2 class='title'>SSH user & port</h2></div><div data-role=\"content\"><div class=\"message\"> Cannot connect as root on port 22 </div><label for=\"user\">User:</label>");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("user"),
    'placeholder': ("root"),
    'valueBinding': ("Mist.machineKeysController.user")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"port\">Port:</label>");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("port"),
    'placeholder': ("22"),
    'valueBinding': ("Mist.machineKeysController.port")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeSSH_Details", {hash:{
    'target': ("Mist.machineKeysController")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</a><a id=\"tryAssociate\" data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customAssociateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Retry</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<span class=\"small-list-item\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "associatedKeyClicked", "", {hash:{
    'on': ("click"),
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><p ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.keyIcon")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p></span>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "machines.content", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program2(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'machineBinding': depth0,'class': depth0};
  hashTypes = {'machineBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineListItemView", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "title", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\"><div data-role=\"header\" data-theme=\"b\"><a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a><h1>Machines</h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div data-role=\"content\" data-theme=\"c\"><a id=\"create-machine-btn\" class=\"responsive-button\" data-role=\"button\" data-icon=\"plus\" data-iconpos=\"right\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Create</a><a id=\"select-machines-btn\" class=\"responsive-button\" data-role=\"button\" data-icon=\"arrow-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Select</a><ul id=\"machines\" data-role=\"listview\" data-inset=\"true\" data-filter=\"true\" data-filter-placeholder=\"Filter...\" data-theme=\"c\" class=\"checkbox-list\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul><div class=\"mid-padding\"></div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineShellView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machinePowerView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div id=\"select-machines-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-position-to=\"#select-machines-btn\"><ul data-role=\"listview\"><li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "all", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">All</a></li><li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "none", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">None</a></li>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div><div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\"><table><tbody><tr><td><a id=\"machines-tags-btn\" data-role=\"button\" data-icon=\"grid\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Tags</a></td><td><a id=\"machines-shell-btn\" data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shell</a></td><td><a id=\"machines-power-btn\" data-role=\"button\" data-icon=\"power\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Power</a></td></tr></tbody></table></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("<label>");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.machine.selected")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>");
  hashContexts = {'classBinding': depth0};
  hashTypes = {'classBinding': "STRING"};
  options = {hash:{
    'classBinding': ("view.machine.hasMonitoring")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "machine", "view.machine", options) : helperMissing.call(depth0, "link-to", "machine", "view.machine", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("<div class=\"ui-grid-b\"><div class=\"ui-block-a machine-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><span class=\"ui-block-b machine-state\"><span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.machine.state")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingCreation", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</span></span><div class=\"ui-block-c machine-leds\"><span>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.machine.hasMonitoring", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</span>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "pendingCreation", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div><div class=\"ui-block-c machine-tags\"><span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.backend.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "view.machine.tags", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div></div>");
  return buffer;
  }
function program3(depth0,data) {
  
  
  data.buffer.push("<div class='ajax-loader'></div>");
  }

function program5(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "waitState", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program7(depth0,data) {
  
  
  data.buffer.push("<span></span>");
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("probing probed")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><div class=\"loadleds\"><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg15 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg5 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg1 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":netleds")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled4 :netled1")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled3 :netled2")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled2 :netled3")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div><div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled1 :netled4")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></div></div></div>");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<a class=\"ui-icon-delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disassociateGhostMachine", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><div class=\"ui-grid-b\"><div class=\"ui-block-a machine-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><span class=\"ui-block-b machine-state\"><span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.machine.state")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span></span></div></a>");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.machine.isGhost", {hash:{},inverse:self.program(13, program13, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_manual_monitoring/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"manual-monitoring-popup\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-dismissible=\"false\"><div data-role=\"header\" data-theme=\"b\"><h3>Enable Monitoring</h3></div><div data-role=\"content\"><p>Automatic installation of monitoring requires a valid key.</p><p> Run this command on your server for manual install: </p><div id=\"manual-monitoring-command\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectCommandText", {hash:{
    'on': ("click"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineManualMonitoringController.command", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</a><a class=\"ui-btn ui-btn-d ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Done</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_power/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "start", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Start</a>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "shutdown", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shutdown</a>");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "reboot", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Reboot</a>");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a data-role=\"button\" data-theme=\"b\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "destroy", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Destroy</a>");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-power-popup\" class=\"tiny-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"slideup\" data-position-to=\"#machines-power-btn\"><div data-role=\"header\" data-theme=\"b\"><h1>Power</h1></div><div data-role=\"content\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canStart", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canShutdown", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canReboot", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canDestroy", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_shell/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"machine-shell\" class=\"huge-popup\" data-role=\"popup\" data-theme=\"b\" data-dismissible=\"false\" data-overlay-theme=\"b\" data-transition=\"slideup\"><div data-role=\"content\"><div id=\"shell-return\" data-theme=\"a\"><span class=\"fontSizeTest\">-</span></div><div class=\"ui-grid-a shell-back\"><a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_shell_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<h3 ");
  hashContexts = {'id': depth0,'class': depth0};
  hashTypes = {'id': "STRING",'class': "STRING"};
  options = {hash:{
    'id': ("view.command.id"),
    'class': (":command :ui-alt-icon view.command.pendingResponse")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCommand", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-theme=\"c\"> # ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.command.command", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"shell-li-arrow ui-icon-carat-d ui-btn-icon-notext\"></div></h3><div class=\"output\"><pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.command.response", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'tagBinding': depth0};
  hashTypes = {'tagBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsListItemView", {hash:{
    'tagBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program3(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program5(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.deletingTag", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

  data.buffer.push("<div id=\"machine-tags-popup\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"><div data-role=\"header\" data-theme=\"b\"><h1>Manage Tags</h1></div><div data-role=\"content\" data-theme=\"a\">");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.machineTagsController.newTag")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<a id=\"add-tag-ok\" data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineTagsController.machine.tags", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.addingTag", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<a id=\"add-tag-back\" data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags_list_item/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<span class=\"small-list-item\"><p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><button data-icon=\"delete\" data-iconpos=\"notext\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></button></span>\n");
  return buffer;
  
});
Ember.TEMPLATES["messagebox/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<p id=\"message-cmd\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgCmd", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>");
  return buffer;
  }

  data.buffer.push("<div id=\"message-box-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div><div id=\"message-box-popup-popup\" class=\"ui-popup-container ui-popup-hidden large-popup ui-body-a ui-corner-all\"><div id=\"message-box-popup\" class=\"ui-popup ui-corner-all ui-overlay-shadow large-popup\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\" data-dismissible=\"false\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgHeader", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1></div><div class=\"ui-content\"><p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart1", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart2", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart3", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.notificationController.msgCmd", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<p id=\"message-ps\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart4", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p><a id=\"message-link\" target=\"_blank\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a><a class=\"ui-btn ui-btn-a ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeMessage", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">OK</a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"ui-btn ui-btn-d ui-corner-all ui-btn-icon-left ui-icon-plus\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">custom</a>");
  hashContexts = {'nodeBinding': depth0};
  hashTypes = {'nodeBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricNodeView", {hash:{
    'nodeBinding': ("Mist.metricAddController.metricsTree")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("<div id=\"overlay\"></div>");
  }

  data.buffer.push("<div id=\"metric-add-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div><div id=\"metric-add-popup\" class=\"ui-popup-container mid-popup ui-popup-hidden ui-body-inherit ui-corner-all\"><div id=\"metric-add\" class=\"ui-popup ui-corner-all ui-overlay-shadow\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\" data-position-to=\"#add-metric-btn\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">Select Metric</h1></div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricAddController.metrics.length", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricsController.addingMetric", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricAddCustomView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add_custom/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

  data.buffer.push("<div id=\"metric-add-custom-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div><div id=\"metric-add-custom-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-corner-all\"><div id=\"metric-add-custom\" class=\"ui-popup ui-corner-all ui-overlay-shadow\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\" data-position-to=\"#add-metric-btn\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">Add custom metric</h1></div><div class=\"ui-content\"><label for=\"custom-plugin-name\">Name:</label>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-name"),
    'valueBinding': ("Mist.metricAddCustomController.metric.name")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"custom-plugin-script\">Python script:</label><pre id=\"custom-plugin-error\"></pre>");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("custom-plugin-script"),
    'valueBinding': ("Mist.metricAddCustomController.metric.script")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<label for=\"custom-plugin-unit\">Unit:</label>");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-unit"),
    'placeholder': ("e.g. bytes (optional)"),
    'valueBinding': ("Mist.metricAddCustomController.metric.unit")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<select id=\"advanced-toggle\" data-role=\"slider\" data-theme=\"a\" ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "advancedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><option value=\"0\">Basic settings</option><option value=\"1\">Advanced settings</option></select><div id=\"custom-plugin-advanced\"><label>");
  hashContexts = {'data-mini': depth0,'checkedBinding': depth0};
  hashTypes = {'data-mini': "STRING",'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-mini': ("true"),
    'checkedBinding': ("Mist.metricAddCustomController.metric.type")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" Calculate derivative </label></div>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricAddCustomController.addingMetric", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\"><a class=\"ui-btn ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a><a class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\" id=\"deploy\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deployClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Deploy</a></div></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_node/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"end-node ui-btn ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectMetric", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.node.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.node.isRootNode", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"nest\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.node.subTargets", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<a class=\"parent-node ui-btn ui-corner-all ui-btn-icon-left ui-icon-carat-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleUnfold", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.node.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>");
  return buffer;
  }

function program6(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'nodeBinding': depth0};
  hashTypes = {'nodeBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricNodeView", {hash:{
    'nodeBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.node.isEndNode", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["monitoring/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'graphBinding': depth0};
  hashTypes = {'graphBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.graphView", {hash:{
    'graphBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program3(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingCreation", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program4(depth0,data) {
  
  var hashContexts, hashTypes;
  hashContexts = {'graphBinding': depth0};
  hashTypes = {'graphBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.graphButtonView", {hash:{
    'graphBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<div class=\"graphControls\"><div class=\"graphZoomer\"><select id='zoomSelect' data-inline=\"true\" onChange=\"Mist.monitoringController.UI.zoomChange()\"><option value='0' selected='true'>Last 10 Minutes</option><option value='1' >Last 1 Hour</option><option value='2' >Last 1 Day</option><option value='3' >Last 1 Week</option><option value='4' >Last 1 Month</option></select></div><div class=\"graphMover\"><a id='graphsGoBack' class=\"ui-btn ui-corner-all ui-btn-inline\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goBack", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&lt;&lt;</a><a id='graphsResetHistory' class=\"ui-btn ui-btn-b ui-corner-all ui-state-disabled ui-btn-inline\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disable", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Reset</a><a id='graphsGoForward' class=\"ui-btn ui-corner-all ui-state-disabled ui-btn-inline\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goForward", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&gt;&gt;</a></div></div><div id=\"GraphsArea\"><div class=\"valuePopUp\"></div><div id=\"graphs\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.graphs", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div><div id=\"graphBar\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.graphs", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<div class=\"graphBtn\" id=\"add-metric-btn\"><a class=\"ui-btn ui-btn-icon-left ui-icon-plus ui-corner-all ui-btn-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addMetricClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Add Graph </a></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["rule/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<div class=\"ajax-loader\"></div>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<div class=\"delete-rule-container\"><a class=\"delete-rule-button ui-btn ui-btn-icon-notext ui-icon-delete ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteRuleClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&nbsp;</a></div>");
  return buffer;
  }

  data.buffer.push("<div id=\"");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\" class=\"rule-box\"><div id=\"basic-condition\"><div class=\"rule-if rule-text\">if</div><a class=\"rule-button rule-metric ui-btn ui-btn-inline ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openMetricPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "metric.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a><a class=\"rule-button rule-operator ui-btn ui-btn-inline ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openOperatorPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "operator.symbol", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>");
  hashContexts = {'class': depth0,'type': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'type': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'class': ("rule-value"),
    'type': ("number"),
    'valueBinding': ("view.newRuleValue")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div class=\"rule-unit rule-text\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "metric.unit", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div></div><!--a class=\"rule-button rule-more ui-btn ui-btn-inline ui-shadow ui-corner-all\" > ... </a><div class=\"advanced-condition\"> advanced </div--><div class=\"rule-then rule-text\">then</div><a class=\"rule-button rule-action ui-btn ui-btn-inline ui-shadow ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openActionPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "actionToTake", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "pendingAction", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["rule_edit/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a class=\"ui-btn\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "metricClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "operatorClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "symbol", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<li data-icon=\"false\"><a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></li>");
  return buffer;
  }

  data.buffer.push("<div id=\"rule-metric-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div><div id=\"rule-metric-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\"><div id=\"rule-metric\" class=\"ui-popup\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.metrics", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<!--li data-icon=\"false\"><a class=\"ui-btn ui-btn-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("> Custom </a></li--></ul></div></div><div id=\"rule-operator-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div><div id=\"rule-operator-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\"><div id=\"rule-operator\" class=\"ui-popup\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.rulesController.operatorList", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</ul></div></div><div id=\"rule-action-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div><div id=\"rule-action-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\"><div id=\"rule-action\" class=\"ui-popup\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><ul data-role=\"listview\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.rulesController.actionList", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("<li class=\"ui-state-disabled\" data-icon=\"false\"><a>launch</a></li></ul></div></div><div id=\"rule-command-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div><div id=\"rule-command-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow ui-corner-all large-popup\"><div id=\"rule-command\" class=\"ui-popup ui-corner-all\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><div data-role=\"header\"><h1>Command</h1></div><div data-role=\"content\">");
  hashContexts = {'valueBinding': depth0,'name': depth0};
  hashTypes = {'valueBinding': "STRING",'name': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'valueBinding': ("Mist.ruleEditController.command"),
    'name': ("rule-command-content")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("<div data-role=\"controlgroup\" class=\"btn-full ok-cancel\" data-type=\"horizontal\"><a class=\"ui-btn ui-btn-a\" data-rel=\"back\">Back</a><a class=\"ui-btn ui-btn-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Save</a></div></div></div></div><div id=\"rule-advanced-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div><div id=\"rule-advanced-popup\" class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow ui-corner-all large-popup\"><div id=\"rule-advanced\" class=\"ui-popup ui-corner-all\" data-role=\"popup\" data-enhanced=\"true\" data-transition=\"flip\"><div class=\"ui-header ui-bar-b\"><h1 class=\"ui-title\">Advanced Options</h1></div><div data-role=\"content\"><div data-role=\"controlgroup\" class=\"btn-full ok-cancel\" data-type=\"horizontal\"><a class=\"ui-btn ui-btn-a\" data-rel=\"back\">Back</a><a class=\"ui-btn ui-btn-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Done</a></div></div></div></div>\n");
  return buffer;
  
});
Ember.TEMPLATES["user_menu/js"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("<img class=\"gravatar-image\" ");
  hashContexts = {'src': depth0};
  hashTypes = {'src': "STRING"};
  options = {hash:{
    'src': ("view.gravatarURL")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("/>");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("<div class=\"gravatar-image user\"></div>");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("<a data-role=\"button\" data-mini=\"true\" ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "STRING"};
  options = {hash:{
    'href': ("view.accountUrl")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  options = {hash:{
    'target': ("view.isNotCore")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">Account</a>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<button data-mini=\"true\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logoutClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Logout</a>");
  return buffer;
  }

function program8(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "Mist.isCore", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program9(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("<button data-mini=\"true\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Login</a>");
  return buffer;
  }

  data.buffer.push("<a id=\"me-btn\" class=\"ui-btn-right\" data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "meClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.gravatarURL", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" &nbsp;</a><div id=\"user-menu-popup\" data-role=\"popup\" data-position-to=\"#me-btn\" data-theme=\"b\" data-overlay-theme=\"b\" data-transition=\"flip\"><div data-role=\"content\"><div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "EMAIL", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div><a href=\"https://mistio.zendesk.com/access/login\" target=\"_blank\" data-role=\"button\" data-mini=\"true\">Support</a>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.authenticated", {hash:{},inverse:self.program(8, program8, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.loginView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.messageboxView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
    callback();
  }
});
