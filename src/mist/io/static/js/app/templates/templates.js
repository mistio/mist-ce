define('app/templates/templates', ['ember'], function() {
  return function (callback) {
    if (!JS_BUILD) {
      require([
        'text!app/templates/backend_add.html',
        'text!app/templates/backend_button.html',
        'text!app/templates/backend_edit.html',
        'text!app/templates/confirmation_dialog.html',
        'text!app/templates/file_upload.html',
        'text!app/templates/graph_button.html',
        'text!app/templates/graph.html',
        'text!app/templates/home.html',
        'text!app/templates/image_list.html',
        'text!app/templates/image_list_item.html',
        'text!app/templates/key_add.html',
        'text!app/templates/key_edit.html',
        'text!app/templates/key.html',
        'text!app/templates/key_list.html',
        'text!app/templates/key_list_item.html',
        'text!app/templates/login.html',
        'text!app/templates/machine_add.html',
        'text!app/templates/machine.html',
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
        'text!app/templates/metric_add_custom.html',
        'text!app/templates/metric_add.html',
        'text!app/templates/metric_node.html',
        'text!app/templates/monitoring.html',
        'text!app/templates/rule_edit.html',
        'text!app/templates/rule.html',
        'text!app/templates/user_menu.html',
      ], function () {
        Ember.TEMPLATES['backend_add/html'] = Ember.Handlebars.compile(arguments[0]);
        Ember.TEMPLATES['backend_button/html'] = Ember.Handlebars.compile(arguments[1]);
        Ember.TEMPLATES['backend_edit/html'] = Ember.Handlebars.compile(arguments[2]);
        Ember.TEMPLATES['confirmation_dialog/html'] = Ember.Handlebars.compile(arguments[3]);
        Ember.TEMPLATES['file_upload/html'] = Ember.Handlebars.compile(arguments[4]);
        Ember.TEMPLATES['graph_button/html'] = Ember.Handlebars.compile(arguments[5]);
        Ember.TEMPLATES['graph/html'] = Ember.Handlebars.compile(arguments[6]);
        Ember.TEMPLATES['home/html'] = Ember.Handlebars.compile(arguments[7]);
        Ember.TEMPLATES['image_list/html'] = Ember.Handlebars.compile(arguments[8]);
        Ember.TEMPLATES['image_list_item/html'] = Ember.Handlebars.compile(arguments[9]);
        Ember.TEMPLATES['key_add/html'] = Ember.Handlebars.compile(arguments[10]);
        Ember.TEMPLATES['key_edit/html'] = Ember.Handlebars.compile(arguments[11]);
        Ember.TEMPLATES['key/html'] = Ember.Handlebars.compile(arguments[12]);
        Ember.TEMPLATES['key_list/html'] = Ember.Handlebars.compile(arguments[13]);
        Ember.TEMPLATES['key_list_item/html'] = Ember.Handlebars.compile(arguments[14]);
        Ember.TEMPLATES['login/html'] = Ember.Handlebars.compile(arguments[15]);
        Ember.TEMPLATES['machine_add/html'] = Ember.Handlebars.compile(arguments[16]);
        Ember.TEMPLATES['machine/html'] = Ember.Handlebars.compile(arguments[17]);
        Ember.TEMPLATES['machine_keys/html'] = Ember.Handlebars.compile(arguments[18]);
        Ember.TEMPLATES['machine_keys_list_item/html'] = Ember.Handlebars.compile(arguments[19]);
        Ember.TEMPLATES['machine_list/html'] = Ember.Handlebars.compile(arguments[20]);
        Ember.TEMPLATES['machine_list_item/html'] = Ember.Handlebars.compile(arguments[21]);
        Ember.TEMPLATES['machine_manual_monitoring/html'] = Ember.Handlebars.compile(arguments[22]);
        Ember.TEMPLATES['machine_power/html'] = Ember.Handlebars.compile(arguments[23]);
        Ember.TEMPLATES['machine_shell/html'] = Ember.Handlebars.compile(arguments[24]);
        Ember.TEMPLATES['machine_shell_list_item/html'] = Ember.Handlebars.compile(arguments[25]);
        Ember.TEMPLATES['machine_tags/html'] = Ember.Handlebars.compile(arguments[26]);
        Ember.TEMPLATES['machine_tags_list_item/html'] = Ember.Handlebars.compile(arguments[27]);
        Ember.TEMPLATES['messagebox/html'] = Ember.Handlebars.compile(arguments[28]);
        Ember.TEMPLATES['metric_add_custom/html'] = Ember.Handlebars.compile(arguments[29]);
        Ember.TEMPLATES['metric_add/html'] = Ember.Handlebars.compile(arguments[30]);
        Ember.TEMPLATES['metric_node/html'] = Ember.Handlebars.compile(arguments[31]);
        Ember.TEMPLATES['monitoring/html'] = Ember.Handlebars.compile(arguments[32]);
        Ember.TEMPLATES['rule_edit/html'] = Ember.Handlebars.compile(arguments[33]);
        Ember.TEMPLATES['rule/html'] = Ember.Handlebars.compile(arguments[34]);
        Ember.TEMPLATES['user_menu/html'] = Ember.Handlebars.compile(arguments[35]);
        callback();
      });
      return;
    }
Ember.TEMPLATES["backend_add/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                </li>\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                    <label for=\"new-backend-second-field\">3. ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.secondFieldLabel", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>\n                    ");
  hashContexts = {'type': depth0,'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'type': "STRING",'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'type': ("password"),
    'id': ("new-backend-second-field"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendSecondField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                        <li data-icon=\"false\" data-theme=\"a\">\n                            <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                        </li>\n                    ");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"add-backend-panel\"\n     data-swipe-close=\"false\"\n     class=\"side-panel\"\n     data-role=\"panel\"\n     data-position=\"right\"\n     data-display=\"overlay\"\n     data-theme=\"b\">\n\n    <div data-role=\"header\">\n        <h1>Add backend</h1>\n        <a class=\"ui-btn-right\" data-icon=\"info\" data-iconpos=\"notext\" data-theme=\"b\"\n            target=\"_blank\" href=\"https://mistio.zendesk.com/hc/en-us\"></a>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"b\">\n\n        <label>1. Provider:</label>\n        <div id=\"new-backend-provider\"\n             class=\"mist-select\"\n             data-role=\"collapsible\"\n             data-collapsed-icon=\"carat-d\"\n             data-expanded-icon=\"carat-u\"\n             data-iconpos=\"right\"\n             data-theme=\"a\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendAddController.newBackendProvider.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul class=\"select-listmenu\" data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.providerList", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!--\n\n            COMMON\n\n        -->\n\n        <div id=\"common-bundle\">\n            <div data-theme=\"a\">\n                <label for=\"new-backend-first-field\">2. ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.firstFieldLabel", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":</label>\n                ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-first-field"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendFirstField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.secondFieldLabel", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n        </div>\n\n        <!--\n\n           HP Cloud\n\n        -->\n\n        <div id=\"hpcloud-bundle\" data-theme=\"a\">\n            <label for=\"new-backend-hpcloud-tenant\">4. Tenant Name:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-hpcloud-tenant"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackTenant")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </div>\n\n        <!--\n\n            OPENSTACK\n\n        -->\n\n        <div id=\"openstack-bundle\" data-theme=\"a\">\n            <label for=\"new-backend-openstack-url\">4. Auth URL:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-url"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackURL")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"new-backend-openstack-tenant\">5. Tenant Name:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-tenant"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackTenant")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <div id=\"opentack-advanced-wrapper\">\n                <select id=\"openstack-advanced\" data-role=\"slider\" data-theme=\"a\"\n                ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "advancedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                   <option value=\"0\">Basic settings</option>\n                    <option value=\"1\">Advanced settings</option>\n                </select>\n            </div>\n\n            <div id=\"non-hp-cloud\">\n\n                <label for=\"new-backend-openstack-region\">6. Region:</label>\n                ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-region"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackRegion")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n                <label for=\"new-backend-openstack-endpoint\">7. Compute Endpoint:</label>\n                ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-openstack-endpoint"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendOpenStackComputeEndpoint")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </div>\n        </div>\n\n        <!--\n\n            GCE\n\n        -->\n\n        <div id=\"gce-bundle\">\n\n            <label for =\"new-backend-key\">3. Private key:</label>\n\n            <!-- Value is sent to newBackendSecondField -->\n            <a class=\"ui-btn ui-btn-a ui-corner-all\"\n              ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "privateKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                Add key\n            </a>\n\n            <label for=\"new-backend-port\">4. Project ID:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-project-name"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendProjectName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </div>\n\n        <!--\n\n            BAREMETAL\n\n        -->\n\n        <div id=\"baremetal-bundle\">\n            <label for=\"new-backend-port\">4. Port:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-port"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendPort")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label>5. SSH Key:</label>\n            <div id=\"new-backend-key\"\n                 class=\"mist-select\"\n                 data-role=\"collapsible\"\n                 data-iconpos=\"right\"\n                 data-collapsed-icon=\"carat-d\"\n                 data-expanded-icon=\"carat-u\"\n                 data-theme=\"a\">\n                <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendAddController.newBackendKey.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n                <ul data-role=\"listview\">\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    <li data-icon=\"false\" data-theme=\"d\">\n                        <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Key</a>\n                    </li>\n                </ul>\n            </div>\n        </div>\n\n        <!--\n\n            DOCKER\n\n        -->\n\n        <div id=\"docker-bundle\">\n\n            <label for=\"new-backend-docker-url\">2. Host:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-url"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendDockerURL")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"new-backend-docker-port\">3. Port:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-port"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendPort")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"new-backend-docker-user\">4. BasicAuth User:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-user"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendFirstField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"new-backend-docker-pass\">5. BasicAuth Password:</label>\n            ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-backend-docker-pass"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.backendAddController.newBackendSecondField")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </div>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.addingBackend", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-theme=\"a\">Back</a>\n            <button id=\"new-backend-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a>\n        </div>\n    </div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.fileUploadView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["backend_button/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "buttonClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n");
  return buffer;
  
});
Ember.TEMPLATES["backend_edit/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"backend-edit-screen\"\n    class=\"ui-popup-screen\n        ui-overlay-b\n        ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n<div id=\"backend-edit-popup\"\n     class=\"pop\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"backend-edit\"\n         class=\"mid-popup\n            ui-popup\n            ui-body-a\n            ui-overlay-shadow\n            ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n         <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\">\n\n            <h1 class=\"ui-title\">Edit backend</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div role=\"main\" class=\"ui-content\" data-theme=\"a\">\n\n            <!-- New backend title text field -->\n\n            ");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.backendEditController.newTitle")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <!-- Backend state toggle switch -->\n\n            <div data-role=\"fieldcontain\">\n                <select id=\"backend-toggle\" data-role=\"slider\"\n                    ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "stateToggleSwitched", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        <option value=\"0\">Disabled</option>\n                        <option value=\"1\">Enabled</option>\n                </select>\n                <span class=\"state\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendEditController.backend.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n            </div>\n\n            <!-- Delete button -->\n\n            <a class=\"ui-btn ui-shadow ui-corner-all\"\n                ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view"),
    'on': ("click")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                Delete\n            </a>\n\n            <!-- Delete confirmation -->\n\n            <div id=\"backend-delete-confirm\">\n                <label>Confirm backend removal?</label>\n                <label id=\"monitoring-message\">There are monitored machines.\n                    <br />Monitoring for these will be disabled\n                </label>\n                <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n                    <a class=\"ui-btn ui-shadow ui-corner-all\" id=\"button-confirm-disable\"\n                        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "yesClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Yes</a>\n                    <a class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n                        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "noClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">No</a>\n                </div>\n            </div>\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.deletingBackend", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <!-- Back button -->\n\n            <a class=\"ui-btn ui-shadow ui-corner-all button-back\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["confirmation_dialog/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"confirmation-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.confirmationController.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.confirmationController.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <button data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "noClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">No</button>\n            <button ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "yesClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Yes</button>\n        </div>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["file_upload/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader add-key-loader\"></div>\n            ");
  }

  data.buffer.push("<div id=\"file-upload\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.fileUploadController.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <label for=\"textarea-private-key\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.fileUploadController.label", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(":\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.fileUploadController.uploadingFile", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </label>\n        ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("upload-area"),
    'valueBinding': ("Mist.fileUploadController.file")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <a class=\"ui-btn ui-corner-all ui-btn-a ui-btn-icon-right ui-icon-arrow-u\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Upload</a>\n\n        <input id=\"file-upload-input\" type=\"file\" name=\"file\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/>\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-corner-all ui-btn-a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"file-upload-ok\" class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Done</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_button/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
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
  data.buffer.push(">\n    <a class=\"ui-btn ui-btn-icon-left ui-icon-carat-u ui-corner-all\"\n        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "expandClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.graph.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </a>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                (");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.graph.unit", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.graph.pendingRemoval", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.graph.isBuiltIn", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <a class=\"ui-btn ui-btn-icon-notext ui-corner-all ui-icon-carat-d\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "collapseClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">-\n            </a>\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

function program8(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <a class=\"ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">x\n                </a>\n            ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n    <svg>\n    	<g class=\"grid-x\"></g>\n    	<g class=\"grid-y\"></g>\n        <g class=\"valueArea\">\n            <path></path>\n        </g>\n        <g class=\"valueLine\">\n            <path></path>\n        </g>\n        <g class=\"x-axis\"></g>\n        <rect class=\"hideAnimeLine\"></rect>\n        <line class=\"axisLine x\"></line>\n        <line class=\"axisLine y\"></line>\n        <g class=\"y-axis\"></g>\n    </svg>\n    ");
  }

  data.buffer.push("<div class=\"graph\" ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  options = {hash:{
    'id': ("view.graph.id")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n\n    <div class=\"header\">\n        <div class=\"title\">\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.graph.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.unit", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </div>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.pendingCreation", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.graph.metrics.length", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["home/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'backendBinding': depth0,'class': depth0};
  hashTypes = {'backendBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendButtonView", {hash:{
    'backendBinding': ("this"),
    'class': ("ui-btn ui-input-btn ui-corner-all ui-shadow")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"home-page\" data-role=\"page\" class=\"ui-page-active ui-page ui-page-theme-a\">\n\n    <!-- Page header -->\n\n    <div class=\"ui-header ui-bar-b\">\n\n        <h1 class=\"ui-title\">mist.io</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <!-- Page Body -->\n\n    <div role=\"main\" class=\"ui-content\" data-theme=\"a\">\n\n        <!-- Add backend button -->\n\n        <a id=\"add-backend-btn\" class=\"ui-link ui-btn ui-btn-d ui-icon-plus\n            ui-btn-icon-right ui-shadow ui-corner-all\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addBackend", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                Add backend\n        </a>\n\n        <!-- Backends list -->\n\n        <div id=\"backend-buttons\" data-role=\"controlgroup\" data-type=\"horizontal\"\n            class=\"ui-controlgroup ui-controlgroup-horizontal ui-corner-all\">\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        </div>\n\n        <!-- Navigation -->\n\n        <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow\">\n\n            <!-- Machines link -->\n\n            <li class=\"ui-li-has-count ui-first-child\">\n\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/machines\">\n\n                    Machines\n\n                    <span class=\"ui-li-count ui-body-inherit\">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendsController.machineCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </span>\n                </a>\n            </li>\n\n            <!-- Images link -->\n\n            <li class=\"ui-li-has-count\">\n\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/images\">\n\n                    Images\n\n                    <span class=\"ui-li-count ui-body-inherit\">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.backendsController.imageCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </span>\n                </a>\n            </li>\n\n            <!-- Keys link -->\n\n            <li class=\"ui-li-has-count ui-last-child\">\n\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\" href=\"#/keys\">\n\n                    Keys\n\n                    <span class=\"ui-li-count ui-body-inherit\">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.keysController.content.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </span>\n                </a>\n            </li>\n        </ul>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.backendEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["image_list/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'imageBinding': depth0,'class': depth0};
  hashTypes = {'imageBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.imageListItemView", {hash:{
    'imageBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                    Please wait...\n                ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n                    Continue search on server...\n                ");
  }

  data.buffer.push("<div id=\"image-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a>\n\n        <h1>Images</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingImages", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("search-term-input"),
    'placeholder': ("Search images ..."),
    'valueBinding': ("Mist.imageSearchController.searchTerm")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.imageSearchController.isSearching", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <ul id=\"image-list\"\n            data-role=\"listview\"\n            data-inset=\"true\"\n            class=\"checkbox-list\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.renderedImages", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.renderingMoreImages", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <button id=\"images-advanced-search\" data-theme=\"b\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "searchClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            <span>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.searchingImages", {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </span>\n        </button>\n\n        <div class=\"small-padding\"></div>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["image_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
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
  data.buffer.push("\n	");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleImageStar", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n	");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.image.star")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</label>\n\n<a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchImage", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    <h3>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h3>\n    <p class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n    <p class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.image.backend.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n</a>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_add/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                    <div class=\"ajax-loader key-add-loader\"></div>\n                ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.uploadingKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"key-add-screen\"\n    class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n\n<div id=\"key-add-popup\"\n    class=\"flip\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"key-add\"\n        class=\"large-popup\n            ui-popup\n            ui-body-inherit\n            ui-overlay-shadow\n            ui-corner-all\"\n        data-role=\"popup\"\n        data-enhanced=\"true\"\n        data-transition=\"flip\">\n\n\n        <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\" role=\"banner\">\n\n            <h1 class=\"ui-title\">Add key</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div class=\"ui-content ui-body-a\" role=\"main\">\n\n            <!-- Key Name Field -->\n\n            <label for=\"key-add-id\">Name:</label>\n\n            ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("key-add-id"),
    'valueBinding': ("Mist.keyAddController.keyId")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <!-- Key Private Field -->\n\n            <label for=\"key-add-private\">Private Key:\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.generatingKey", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </label>\n\n            ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("key-add-private"),
    'valueBinding': ("Mist.keyAddController.keyPrivate")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <!-- Generate and Upload buttons -->\n\n            <div class=\"generate-upload\n                    ui-controlgroup\n                    ui-controlgroup-horizontal\n                    ui-group-theme-a\n                    ui-corner-all\"\n                data-role=\"controlgroup\"\n                data-type=\"horizontal\">\n\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-gear\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "generateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        Generate\n                </a>\n\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-arrow-u\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        Upload\n                </a>\n            </div>\n\n            <!-- Hidden Input field for uploading ssh keys -->\n\n            <input id=\"key-add-upload\" type=\"file\" name=\"file\"\n                ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/>\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.addingKey", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <!-- Back and Add buttons -->\n\n            <div class=\"ok-cancel\n                    ui-controlgroup\n                    ui-controlgroup-horizontal\n                    ui-group-theme-a\n                    ui-corner-all\"\n                data-role=\"controlgroup\"\n                data-type=\"horizontal\">\n\n                <a class=\"ui-btn\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        Back\n                </a>\n                <a id=\"key-add-ok\" class=\"ui-btn ui-btn-d ui-state-disabled\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        Add\n                </a>\n            </div>\n\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_edit/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"rename-key-popup\" \n     class=\"small-popup\" \n     data-role=\"popup\" \n     data-overlay-theme=\"b\" \n     data-transition=\"slideup\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Rename key</h1>\n    </div>\n\n    <div data-role=\"content\">\n\n        <label for=\"new-key-name\">New name:</label>\n        ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-key-name"),
    'valueBinding': ("Mist.keyEditController.newKeyId")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.renamingKey", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n            <button id=\"rename-key-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Save</button>\n        </div>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n                ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <div id=\"single-key-machines\" data-role=\"collapsible\">\n\n            <h3>Machines\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h3>\n            <ul data-role=\"listview\" class=\"checkbox-list\" data-inset=\"true\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.machines", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                    ");
  hashContexts = {'machineBinding': depth0,'class': depth0};
  hashTypes = {'machineBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineListItemView", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-key-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#/keys\" class=\"responsive-button\" data-icon=\"arrow-l\">Keys</a>\n\n        <h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.loading", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n         <div data-role=\"collapsible\" data-collapsed=\"false\">\n            <h3>Public Key\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPublicKey", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h3>\n            <input id=\"public-key\" type=\"text\" readonly=\"readonly\" onclick=\"this.focus();this.select()\"/>\n        </div>\n\n        <div data-role=\"collapsible\">\n            <h3>Private key\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPrivateKey", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h3>\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "displayClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Display</a>\n        </div>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "machines", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"large-padding\"></div>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n\n    <!--\n     Since the private key is very sensitive information, it should be\n     erased as soon as the popup is closed. We set the data-dismissible\n     attribute to false to make sure that user will click the \"Back\" button\n     to leave the popup (which will remove the private key from the textarea)\n    -->\n    <div id=\"private-key-popup\"\n         class=\"medium-popup\"\n         data-role=\"popup\"\n         data-overlay-theme=\"b\"\n         data-transition=\"flip\"\n         data-dismissible=\"false\">\n        <div data-role=\"header\" data-theme=\"b\">\n            <h1>Private Key</h1>\n        </div>\n        <div data-role=\"content\">\n            <textarea id=\"private-key\" readonly=\"readonly\" onclick=\"this.focus();this.select()\"></textarea>\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n        </div>\n    </div>\n\n    <div class=\"dual-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a data-role=\"button\" data-icon=\"edit\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Rename</a>\n        </td><td>\n            <a data-role=\"button\" data-icon=\"delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Delete</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'keyBinding': depth0,'class': depth0};
  hashTypes = {'keyBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyListItemView", {hash:{
    'keyBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"key-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a>\n\n        <h1>Keys</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        <a id=\"select-keys-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"arrow-d\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Select</a>\n\n        <a id=\"add-key-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"plus\"\n           data-iconpos=\"right\"\n           data-theme=\"d\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a>\n\n        <ul data-role=\"listview\" \n            data-filter=\"true\" \n            data-inset=\"true\" \n            data-filter-placeholder=\"Filter...\"\n            class=\"checkbox-list\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    <div id=\"select-keys-popup\" data-role=\"popup\" data-transition=\"flip\" data-position-to=\"#select-keys-btn\">\n        <ul data-role='listview'>\n            <li data-icon=\"false\">\n                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", true, {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","BOOLEAN"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">All</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", false, {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","BOOLEAN"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">None</a>\n            </li>\n        </ul>\n    </div>\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a data-role=\"button\" data-icon=\"edit\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Rename</a>\n        </td><td>\n            <a data-role=\"button\" data-icon=\"delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Delete</a>\n        </td><td>\n            <a data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setDefaultClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Set default</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n\n    <div class=\"ui-grid-b\">\n        <div class=\"ui-block-a key-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.key.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n        <div class=\"ui-block-b\"></div>\n        <div class=\"ui-block-c key-tags\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.key.isDefault", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n             <span class=\"tag\">default</span>\n            ");
  }

  data.buffer.push("<label>");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.key.selected")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>\n\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "key", "view.key", options) : helperMissing.call(depth0, "link-to", "key", "view.key", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["login/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"login-popup\" class=\"mid-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Login to mist.io</h1>\n    </div>\n\n    <div data-role=\"content\">\n        <label for=\"email\">Email:</label>\n        ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("email"),
    'valueBinding': ("Mist.loginController.email")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <label for=\"password\">Password:</label>\n        ");
  hashContexts = {'id': depth0,'type': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'type': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("password"),
    'type': ("password"),
    'valueBinding': ("Mist.loginController.password")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.loginController.loggingIn", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "forgot", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" target=\"_new\">Forgot your password?</a>\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n            <button id=\"login-ok\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Log in</button>\n        </div>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_add/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isBareMetal", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                            <li data-icon=\"false\">\n                                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                            </li>\n                        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "Mist.machineAddController.newMachineProvider.images.hasStarred", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                        <li data-icon=\"false\">\n                            <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectImage", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                        </li>\n                    ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "star", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectSize", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                        <span class=\"size-decription\">\n                         - disk:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "disk", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(", ram:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "ram", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                        </span>\n                    </a>\n                </li>\n                ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectLocation", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                </li>\n                ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                    <li data-icon=\"false\">\n                        <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                    </li>\n                ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            Estimated price:\n            <span>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.price", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"create-machine-panel\"\n     data-swipe-close=\"false\"\n     class=\"side-panel\"\n     data-role=\"panel\"\n     data-position=\"right\"\n     data-display=\"overlay\"\n     data-theme=\"b\">\n\n    <div data-role=\"header\">\n        <h1>Create Machine</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"b\">\n\n        <!-- Select Name -->\n\n        <label for=\"create-machine-name\">1. Name:</label>\n        ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("create-machine-name"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <!-- Select Provider -->\n\n        <label>2. Provider:</label>\n        <div id=\"create-machine-provider\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineProvider.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Image -->\n\n        <label>3. Image:</label>\n        <div id=\"create-machine-image\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineImage.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.images.content", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Size -->\n\n        <label>4. Size:</label>\n        <div id=\"create-machine-size\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineSize.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.sizes.content", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Location -->\n\n        <label>5. Location:</label>\n        <div id=\"create-machine-location\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineLocation.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.locations.content", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Key -->\n\n        <label>6. Key:</label>\n        <div id=\"create-machine-key\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineKey.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                <li data-icon=\"false\" data-theme=\"d\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Key</a>\n                </li>\n            </ul>\n        </div>\n\n        <!-- Select Script -->\n\n        <label for=\"create-machine-script\">7.Script:</label>\n        ");
  hashContexts = {'id': depth0,'data-theme': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-script"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineScript")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <div id=\"create-machine-cost\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.price", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        <div class=\"ok-cancel\" data-role=\"ui-grid-a\" >\n            <div class=\"ui-block-a\">\n                <a data-role=\"button\"\n                   data-theme=\"a\"\n                   ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n            </div>\n            <div class=\"ui-block-b\">\n                <button id=\"create-machine-ok\"\n                        data-theme=\"d\"\n                        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Launch!</button>\n            </div>\n        </div>\n    </div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-plus\n                    ui-corner-all ui-state-disabled\">\n                        Add key\n                </a>\n            ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "keysCount", {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <a class=\"ui-btn ui-shadow ui-corner-all\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "manageKeysClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "keysCount", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" keys\n                </a>\n            ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <a class=\"ui-btn ui-btn-d ui-btn-icon-right ui-icon-plus ui-corner-all\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        Add key\n                </a>\n            ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingMonitoring", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program12(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\">\n            <span class=\"ui-icon ui-icon-loading\"></span>\n            <h1>Enabling monitoring. Please wait</h1>\n        </div>\n        ");
  }

function program14(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\">\n            <span class=\"ui-icon ui-icon-loading\"></span>\n            <h1>Disabling monitoring. Please wait</h1>\n        </div>\n        ");
  }

function program16(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\">\n            <span class=\"ui-icon ui-icon-loading\"></span>\n            <h1>Fetching stats...</h1>\n        </div>\n        ");
  }

function program18(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingMonitoring", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            ");
  return buffer;
  }
function program19(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "pendingFirstData", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.monitoringView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n                <div class=\"rules-container\" data-role=\"listview\">\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.rules", {hash:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.rulesController.creationPending", {hash:{},inverse:self.noop,fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n\n                <div id=\"monitoring-bottom-btns\">\n                    <div data-rule=\"ui-grid-a\">\n                        <div class=\"ui-block-a\">\n                            <a id=\"add-rule-button\"\n                                class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-plus\"\n                                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addRuleClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Rule</a>\n                        </div>\n                        <!--div class=\"ui-block-b\">\n                            <a id=\"add-metric-btn\"\n                                class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-plus\"\n                                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addMetricClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add Metric</a>\n                        </div-->\n                        <div class=\"ui-block-b\">\n                            <a id=\"disable-monitor-btn\"\n                            class=\"ui-btn ui-corner-all ui-btn-b ui-btn-icon-left ui-icon-delete\"\n                                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disableMonitoringClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Disable</a>\n                        </div>\n                    </div>\n                </div>\n\n            ");
  return buffer;
  }
function program20(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"single-machine-loader ui-loader ui-corner-all ui-body-a ui-loader-verbose\">\n                    <span class=\"ui-icon ui-icon-loading\"></span>\n                    <h1>Waiting for data</h1>\n                </div>\n                ");
  }

function program22(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                        ");
  hashContexts = {'ruleBinding': depth0};
  hashTypes = {'ruleBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.ruleView", {hash:{
    'ruleBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    ");
  return buffer;
  }

function program24(depth0,data) {
  
  
  data.buffer.push("\n                    <div class=\"rule-box\" id=\"creation-rule\">\n                        <div class=\"ajax-loader\"></div>\n                    </div>\n                    ");
  }

function program26(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n\n                <div class=\"monitoring-dialog-container\" id=\"monitoring-disabled\">\n\n                    <div id=\"enable-monitoring-bundle\">\n                        <div>Monitoring is currently disabled</div>\n\n                        <a id=\"enable-monitor-btn\"\n                           class=\"ui-btn ui-corner-all ui-btn-d ui-btn-icon-left ui-icon-star\"\n                           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enableMonitoringClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Enable</a>\n\n                       ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineManualMonitoringController.gettingCommand", {hash:{},inverse:self.noop,fn:self.program(27, program27, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </div>\n\n                </div>\n\n            ");
  return buffer;
  }
function program27(depth0,data) {
  
  
  data.buffer.push("\n                            <div class=\"ajax-loader\"></div>\n                       ");
  }

function program29(depth0,data) {
  
  
  data.buffer.push("\n                             probing... <div class=\"ajax-loader\"></div>\n                         ");
  }

function program31(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                             ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.lastProbe", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                             <a id=\"machine-probe-btn\"\n                                class=\"ui-btn ui-shadow ui-corner-all\"\n                                data-mini=\"true\"\n                                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                                    Probe\n                            </a>\n                         ");
  return buffer;
  }

function program33(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <tr>\n                    <td>Up and running for</td>\n                    <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.upFor", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n                </tr>\n                ");
  return buffer;
  }

function program35(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                <tr>\n                    <td>Load</td>\n                    <td>\n                        <div class=\"loadleds\">\n\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg15 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg5 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg1 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                        </div>\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loadavg", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" - ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loadavg5", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </td>\n                </tr>\n                ");
  return buffer;
  }

function program37(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                <tr>\n                    <td>Latency</td>\n                    <td>\n                        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":netleds")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled4 :netled1")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled3 :netled2")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled2 :netled3")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled1 :netled4")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                        </div>\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "latency", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("ms</td>\n                </tr>\n                ");
  return buffer;
  }

function program39(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <tr>\n                    <td>Packet loss</td>\n                    <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "loss", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n                </tr>\n                ");
  return buffer;
  }

function program41(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                <tr>\n                    <td>Tags</td>\n                    <td>\n                        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "tags", {hash:{},inverse:self.noop,fn:self.program(42, program42, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </td>\n                </tr>\n                ");
  return buffer;
  }
function program42(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                        <span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n                        ");
  return buffer;
  }

function program44(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                    <tr>\n                        <td>Public IPs</td>\n                        <td>\n                            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.public_ips", {hash:{},inverse:self.noop,fn:self.program(45, program45, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }
function program45(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                                <div class=\"ip\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n                            ");
  return buffer;
  }

function program47(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                    <tr>\n                        <td>Private IPs</td>\n                        <td>\n                            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.private_ips", {hash:{},inverse:self.noop,fn:self.program(45, program45, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }

function program49(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <tr>\n                    <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "key", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n                    <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n                </tr>\n                ");
  return buffer;
  }

function program51(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <div id=\"single-machine-metadata\" data-role=\"collapsible\">\n\n            <h3>Full metadata list</h3>\n\n            <table class=\"info-table\">\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.metadata", {hash:{},inverse:self.noop,fn:self.program(49, program49, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </table>\n\n        </div>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-machine-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#/machines\" class=\"responsive-button\" data-icon=\"arrow-l\">Machines</a>\n\n        <h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"header\" data-theme=\"a\" class=\"single-machine-header\">\n\n        <span class=\"single-view-icon-wrapper\">\n            <span id=\"single-view-provider-icon\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.providerIconClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></span>\n        </span>\n        <span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":single-view-icon-wrapper")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n            <span id=\"single-view-image-icon\"\n                ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.imageIconClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n            </span>\n        </span>\n\n        <h1 ");
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
  data.buffer.push("</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "view.machine.id", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        <span class=\"ui-btn-right\" id=\"mist-manage-keys\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingCreation", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </span>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        <!--\n\n             Info popups\n\n        -->\n\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "enablingMonitoring", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "disablingMonitoring", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingStats", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        <!--\n\n             Monitoring collapsible\n\n        -->\n\n        <div data-role=\"collapsible\" id=\"monitoring-collapsible\" data-collapsed=\"false\">\n\n            <h3>Monitoring</h3>\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasMonitoring", {hash:{},inverse:self.program(26, program26, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        </div>\n\n        <!--\n\n             Information collapsibles\n\n        -->\n\n        <div data-role=\"collapsible\" data-collapsed=\"false\">\n\n            <h3>Basic Info</h3>\n\n            <table class=\"info-table\">\n                <tr>\n                    <td>Last probed</td>\n                    <td> ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "probing", {hash:{},inverse:self.program(31, program31, data),fn:self.program(29, program29, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                    </td>\n                </tr>\n                </tr>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "probed", {hash:{},inverse:self.noop,fn:self.program(33, program33, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "loadavg", {hash:{},inverse:self.noop,fn:self.program(35, program35, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "latency", {hash:{},inverse:self.noop,fn:self.program(37, program37, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "loss", {hash:{},inverse:self.noop,fn:self.program(39, program39, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "tags", {hash:{},inverse:self.noop,fn:self.program(41, program41, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.public_ips", {hash:{},inverse:self.noop,fn:self.program(44, program44, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.private_ips", {hash:{},inverse:self.noop,fn:self.program(47, program47, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "view.basicInfo", {hash:{},inverse:self.noop,fn:self.program(49, program49, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            </table>\n        </div>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.metadata", {hash:{},inverse:self.noop,fn:self.program(51, program51, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.ruleEditView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineKeysView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineShellView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machinePowerView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineManualMonitoringView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    <div id=\"manual-monitoring-popup\" class=\"mid-popup\" data-role=\"popup\" data-transition=\"popp\"\n         data-overlay-theme=\"b\" data-disimissible=\"false\">\n\n        <div data-role=\"header\" data-theme=\"b\">\n            <h1>Manual collectd installation</h1>\n        </div>\n\n        <div data-role=\"content\" data-theme=\"c\">\n\n            <p>Run these commands on your server:</p>\n            <textarea>Command here...</textarea>\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeManualMonitoringPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n        </div>\n    </div>\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a id=\"single-machine-tags-btn\" data-role=\"button\" data-icon=\"grid\"");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Tags</a>\n        </td><td>\n            <a id=\"single-machine-shell-btn\" data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shell</a>\n        </td><td>\n            <a id=\"single-machine-power-btn\" data-role=\"button\" data-icon=\"power\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Power</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <ul id=\"machine-keys\" data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'keyBinding': depth0};
  hashTypes = {'keyBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineKeysListItemView", {hash:{
    'keyBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.disassociatingKey", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <li data-icon=\"false\">\n            <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "nonAssociatedKeyClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n        </li>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-keys-panel\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\"\n    data-theme=\"b\">\n\n    <div data-role=\"header\">\n        <h1>Manage Keys</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"b\">\n\n        <a id=\"associate-btn\"\n           data-role=\"button\"\n           data-theme=\"d\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "associateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Associate</a>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.keysController.associatingKey", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a data-role=\"button\" data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n\n    </div>\n\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.keyAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n<div id=\"key-actions-popup\" class=\"tiny-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"\n                                                                                        data-position-to=\"#machine-keys\"\n                                                                                        data-theme=\"b\">\n    <div data-role=\"header\">\n        <h1>Actions</h1>\n    </div>\n\n    <div data-role=\"content\">\n        <button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Remove</button>\n        <button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Probe</button>\n        <button data-theme=\"a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</button>\n    </div>\n</div>\n\n<div id=\"non-associated-keys-popup\" class=\"tiny-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\"\n                                                                                        data-position-to=\"#associate-btn\">\n    <ul data-role=\"listview\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.nonAssociatedKeys", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <li data-icon=\"false\" data-theme=\"d\">\n            <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newKeyClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">New key</a>\n        </li>\n    </ul>\n</div>\n<!-- data-position-to=\"#machine-keys-panel\" -->\n<div id=\"machine-userPort-popup\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-position-to=\"#machine-keys-panel\"  data-transition=\"pop\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h2 class='title'>SSH user & port</h2>\n    </div>\n\n    <div data-role=\"content\">\n        <div class=\"message\">\n            Cannot connect as root on port 22\n        </div>\n        <label for=\"user\">User:</label>\n        ");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("user"),
    'placeholder': ("root"),
    'valueBinding': ("Mist.machineKeysController.user")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <label for=\"port\">Port:</label>\n        ");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("port"),
    'placeholder': ("22"),
    'valueBinding': ("Mist.machineKeysController.port")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeSSH_Details", {hash:{
    'target': ("Mist.machineKeysController")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</a>\n            <a id=\"tryAssociate\" data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customAssociateClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Retry</a>\n        </div>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
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
  data.buffer.push(">\n\n    <p ");
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
  data.buffer.push("</p>\n\n</span>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "machines.content", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                    ");
  hashContexts = {'machineBinding': depth0,'class': depth0};
  hashTypes = {'machineBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineListItemView", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n            <li data-icon=\"false\">\n                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "title", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n            </li>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-list-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"c\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button\" data-icon=\"home\">Home</a>\n\n        <h1>Machines</h1>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.userMenuView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        <a id=\"create-machine-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"plus\"\n           data-iconpos=\"right\"\n           data-theme=\"d\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Create</a>\n\n        <a id=\"select-machines-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"arrow-d\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Select</a>\n\n        <ul id=\"machines\"\n            data-role=\"listview\"\n            data-inset=\"true\"\n            data-filter=\"true\"\n            data-filter-placeholder=\"Filter...\"\n            data-theme=\"c\"\n            class=\"checkbox-list\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineAddView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineShellView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machinePowerView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.confirmationDialog", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n    <div id=\"select-machines-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-position-to=\"#select-machines-btn\">\n        <ul data-role=\"listview\">\n            <li data-icon=\"false\">\n                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "all", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">All</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "none", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">None</a>\n            </li>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a id=\"machines-tags-btn\" data-role=\"button\" data-icon=\"grid\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Tags</a>\n        </td><td>\n            <a id=\"machines-shell-btn\" data-role=\"button\" data-icon=\"gear\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shell</a>\n        </td><td>\n            <a id=\"machines-power-btn\" data-role=\"button\" data-icon=\"power\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Power</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n\n    <label>");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.machine.selected")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>\n    ");
  hashContexts = {'classBinding': depth0};
  hashTypes = {'classBinding': "STRING"};
  options = {hash:{
    'classBinding': ("view.machine.hasMonitoring")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "machine", "view.machine", options) : helperMissing.call(depth0, "link-to", "machine", "view.machine", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    \n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    \n        <div class=\"ui-grid-b\">\n            <div class=\"ui-block-a machine-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n    \n            <span class=\"ui-block-b machine-state\">\n                <span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.machine.state")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "pendingCreation", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                </span>\n            </span>\n\n            <div class=\"ui-block-c machine-leds\">\n                <span>\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.machine.hasMonitoring", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                </span>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "pendingCreation", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                \n            </div>\n            \n            <div class=\"ui-block-c machine-tags\">              \n                <span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.backend.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "view.machine.tags", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("             \n            </div>    \n                                \n        </div>\n    ");
  return buffer;
  }
function program3(depth0,data) {
  
  
  data.buffer.push("\n                    <div class='ajax-loader'></div>\n                ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "waitState", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n                        <span></span>\n                    ");
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                    <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("probing probed")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                        <div class=\"loadleds\">                                                                      \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg15 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>                \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg5 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div> \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("loadavg1 :led")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                        </div>\n                        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":netleds")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled4 :netled1")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div> \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled3 :netled2")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div> \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled2 :netled3")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div> \n                            <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("netled1 :netled4")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                            </div>\n                        </div>\n                                                 \n                    </div>\n                ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <span class=\"tag\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n                ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n\n    <a class=\"ui-icon-delete\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disassociateGhostMachine", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n        \n        <div class=\"ui-grid-b\">\n            <div class=\"ui-block-a machine-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n    \n            <span class=\"ui-block-b machine-state\">\n                <span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.machine.state")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n                    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                </span>\n            </span> \n                                \n        </div>\n\n    </a>\n    \n");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.machine.isGhost", {hash:{},inverse:self.program(13, program13, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_manual_monitoring/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"manual-monitoring-popup\"\n     class=\"large-popup\"\n     data-role=\"popup\"\n     data-overlay-theme=\"b\"\n     data-transition=\"flip\"\n     data-dismissible=\"false\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h3>Enable Monitoring</h3>\n    </div>\n\n    <div data-role=\"content\">\n\n        <p>Automatic installation of monitoring requires a valid key.</p>\n        <p> Run this command on your server for manual install: </p>\n\n        <div id=\"manual-monitoring-command\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "STRING",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectCommandText", {hash:{
    'on': ("click"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.machineManualMonitoringController.command", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        </div>\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Cancel</a>\n            <a class=\"ui-btn ui-btn-d ui-corner-all\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Done</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_power/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "start", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Start</a>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "shutdown", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Shutdown</a>\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <a data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "reboot", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Reboot</a>\n        ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <a data-role=\"button\" data-theme=\"b\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "destroy", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Destroy</a>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-power-popup\" \n     class=\"tiny-popup\" \n     data-role=\"popup\" \n     data-overlay-theme=\"b\" \n     data-transition=\"slideup\"\n     data-position-to=\"#machines-power-btn\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Power</h1>\n    </div>\n\n    <div data-role=\"content\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canStart", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canShutdown", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canReboot", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canDestroy", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <a data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_shell/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"machine-shell\"\n     class=\"huge-popup\"\n     data-role=\"popup\"\n     data-theme=\"b\"\n     data-dismissible=\"false\"\n     data-overlay-theme=\"b\"\n     data-transition=\"slideup\">\n\n    <div data-role=\"content\">\n        <div id=\"shell-return\" data-theme=\"a\">\n            <span class=\"fontSizeTest\">-</span>\n\n        </div>\n        <div class=\"ui-grid-a shell-back\">\n            <a data-role=\"button\"\n               data-theme=\"a\"\n               ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n        </div>\n\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_shell_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
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
  data.buffer.push("\n    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCommand", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    data-theme=\"c\">\n    # ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.command.command", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    <div class=\"shell-li-arrow ui-icon-carat-d ui-btn-icon-notext\"></div>\n</h3>\n<div class=\"output\">\n    <pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.command.response", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'tagBinding': depth0};
  hashTypes = {'tagBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.machineTagsListItemView", {hash:{
    'tagBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.deletingTag", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-tags-popup\" \n     class=\"large-popup\" \n     data-role=\"popup\" \n     data-overlay-theme=\"b\" \n     data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Manage Tags</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        ");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.machineTagsController.newTag")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <a id=\"add-tag-ok\" data-role=\"button\" data-theme=\"d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Add</a>\n\n        <ul data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.machineTagsController.machine.tags", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.addingTag", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a id=\"add-tag-back\" data-role=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags_list_item/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<span class=\"small-list-item\">\n\n    <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n\n    <button data-icon=\"delete\" data-iconpos=\"notext\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></button>\n\n</span>");
  return buffer;
  
});
Ember.TEMPLATES["messagebox/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <p id=\"message-cmd\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgCmd", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"message-box-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div>\n<div id=\"message-box-popup-popup\"\n     class=\"ui-popup-container ui-popup-hidden large-popup ui-body-a ui-corner-all\">\n\n    <div id=\"message-box-popup\"\n         class=\"ui-popup ui-corner-all ui-overlay-shadow large-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\"\n         data-dismissible=\"false\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgHeader", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n        </div>\n        <div class=\"ui-content\">\n\n            <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart1", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n            <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart2", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n            <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart3", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.notificationController.msgCmd", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <p id=\"message-ps\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgPart4", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n            <a id=\"message-link\" target=\"_blank\">\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "Mist.notificationController.msgLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </a>\n            <a class=\"ui-btn ui-btn-a ui-corner-all\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeMessage", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">OK</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add_custom/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("\n<div id=\"metric-add-custom-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div>\n<div id=\"metric-add-custom-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-corner-all\">\n\n    <div id=\"metric-add-custom\"\n         class=\"ui-popup ui-corner-all ui-overlay-shadow\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\"\n         data-position-to=\"#add-metric-btn\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Add custom metric</h1>\n        </div>\n        <div class=\"ui-content\">\n\n            <label for=\"custom-plugin-name\">Name:</label>\n            ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-name"),
    'valueBinding': ("Mist.metricAddCustomController.metric.name")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"custom-plugin-script\">Python script:</label>\n            <pre id=\"custom-plugin-error\"></pre>\n            ");
  hashContexts = {'id': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("custom-plugin-script"),
    'valueBinding': ("Mist.metricAddCustomController.metric.script")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <label for=\"custom-plugin-unit\">Unit:</label>\n            ");
  hashContexts = {'id': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-unit"),
    'placeholder': ("e.g. bytes (optional)"),
    'valueBinding': ("Mist.metricAddCustomController.metric.unit")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <select id=\"advanced-toggle\" data-role=\"slider\" data-theme=\"a\"\n            ");
  hashContexts = {'target': depth0,'on': depth0};
  hashTypes = {'target': "STRING",'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "advancedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                <option value=\"0\">Basic settings</option>\n                <option value=\"1\">Advanced settings</option>\n            </select>\n\n            <div id=\"custom-plugin-advanced\">\n                <label>\n                ");
  hashContexts = {'data-mini': depth0,'checkedBinding': depth0};
  hashTypes = {'data-mini': "STRING",'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-mini': ("true"),
    'checkedBinding': ("Mist.metricAddCustomController.metric.type")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                Calculate derivative\n                </label>\n            </div>\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricAddCustomController.addingMetric", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n                <a class=\"ui-btn ui-corner-all\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n                <a class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\"\n                    id=\"deploy\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deployClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Deploy</a>\n            </div>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n\n            <a class=\"ui-btn ui-btn-d ui-corner-all ui-btn-icon-left ui-icon-plus\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">custom</a>\n\n            ");
  hashContexts = {'nodeBinding': depth0};
  hashTypes = {'nodeBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricNodeView", {hash:{
    'nodeBinding': ("Mist.metricAddController.metricsTree")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n            <div id=\"overlay\"></div>\n        ");
  }

  data.buffer.push("<div id=\"metric-add-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div>\n<div id=\"metric-add-popup\"\n     class=\"ui-popup-container mid-popup ui-popup-hidden ui-body-inherit ui-corner-all\">\n\n    <div id=\"metric-add\"\n         class=\"ui-popup ui-corner-all ui-overlay-shadow\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\"\n         data-position-to=\"#add-metric-btn\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Select Metric</h1>\n        </div>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricAddController.metrics.length", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.metricsController.addingMetric", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricAddCustomView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_node/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n\n    <a class=\"end-node\n        ui-btn\n        ui-corner-all\"\n        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectMetric", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.node.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.node.isRootNode", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <div class=\"nest\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.node.subTargets", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <a class=\"parent-node\n            ui-btn\n            ui-corner-all\n            ui-btn-icon-left\n            ui-icon-carat-d\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleUnfold", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.node.text", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n            ");
  hashContexts = {'nodeBinding': depth0};
  hashTypes = {'nodeBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.metricNodeView", {hash:{
    'nodeBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.node.isEndNode", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["monitoring/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n            ");
  hashContexts = {'graphBinding': depth0};
  hashTypes = {'graphBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.graphView", {hash:{
    'graphBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "pendingCreation", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                ");
  hashContexts = {'graphBinding': depth0};
  hashTypes = {'graphBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.graphButtonView", {hash:{
    'graphBinding': ("this")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"graphControls\">\n\n    <div class=\"graphZoomer\">\n        <select id='zoomSelect' data-inline=\"true\" onChange=\"Mist.monitoringController.UI.zoomChange()\">\n            <option value='0' selected='true'>Last 10 Minutes</option>\n            <option value='1' >Last 1 Hour</option>\n            <option value='2' >Last 1 Day</option>\n            <option value='3' >Last 1 Week</option>\n            <option value='4' >Last 1 Month</option>\n        </select>\n    </div>\n\n    <div class=\"graphMover\">\n        <a id='graphsGoBack' class=\"ui-btn ui-corner-all ui-btn-inline\"\n           ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goBack", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&lt;&lt;</a>\n\n        <a id='graphsResetHistory' class=\"ui-btn ui-btn-b ui-corner-all ui-state-disabled ui-btn-inline\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disable", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Reset</a>\n\n        <a id='graphsGoForward' class=\"ui-btn ui-corner-all ui-state-disabled ui-btn-inline\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goForward", {hash:{
    'target': ("Mist.monitoringController.history")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&gt;&gt;</a>\n    </div>\n\n</div>\n\n<div id=\"GraphsArea\">\n\n    <div class=\"valuePopUp\"></div>\n\n    <div id=\"graphs\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.graphs", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"graphBar\">\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.graphs", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"graphBtn\" id=\"add-metric-btn\">\n            <a class=\"ui-btn ui-btn-icon-left ui-icon-plus ui-corner-all ui-btn-d\"\n                ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addMetricClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                    Add Graph\n            </a>\n        </div>\n    </div>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["rule_edit/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n            <li data-icon=\"false\">\n                <a class=\"ui-btn\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "metricClicked", "id", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                </a>\n            </li>\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "operatorClicked", "title", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "symbol", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "aggregateClicked", "value", {hash:{
    'target': ("view")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"rule-metric-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-metric-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-metric\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "view.metrics", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-operator-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-operator-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-operator\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.rulesController.operatorList", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-action-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-action-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-action\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.rulesController.actionList", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <li class=\"ui-state-disabled\" data-icon=\"false\">\n                <a>launch</a>\n            </li>\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-command-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-command-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow ui-corner-all large-popup\">\n\n    <div id=\"rule-command\"\n         class=\"ui-popup ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Command</h1>\n        </div>\n\n        <div data-role=\"content\">\n\n            ");
  hashContexts = {'valueBinding': depth0,'name': depth0};
  hashTypes = {'valueBinding': "STRING",'name': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'valueBinding': ("view.newCommand"),
    'name': ("rule-command-content")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <div data-role=\"controlgroup\" class=\"btn-full ok-cancel\" data-type=\"horizontal\">\n                <a class=\"ui-btn ui-btn-a\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Back</a>\n                <a class=\"ui-btn ui-btn-d\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Save</a>\n            </div>\n        </div>\n    </div>\n</div>\n\n\n<div id=\"rule-aggregate-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-aggregate-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-aggregate\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "Mist.rulesController.aggregateList", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["rule/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n\n            <div class=\"rule-within rule-text\">within</div>\n\n            ");
  hashContexts = {'class': depth0,'type': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'type': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'class': ("rule-time-window"),
    'type': ("number"),
    'valueBinding': ("view.newRuleTimeWindow")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n            <div class=\"rule-mins rule-text\">min(s)</div>\n\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n    ");
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <div class=\"delete-rule-container\">\n            <a class=\"delete-rule-button ui-btn ui-btn-icon-notext ui-icon-delete ui-corner-all\"\n                    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteRuleClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&nbsp;</a>\n        </div>\n    ");
  return buffer;
  }

  data.buffer.push("<div id=\"");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\" class=\"rule-box\">\n\n    <div id=\"basic-condition\">\n        <div class=\"rule-if rule-text\">if</div>\n\n        <a class=\"rule-button rule-metric ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openMetricPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "metric.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </a>\n\n        <a class=\"rule-button rule-operator ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openOperatorPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "operator.symbol", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </a>\n\n        ");
  hashContexts = {'class': depth0,'type': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'type': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'class': ("rule-value"),
    'type': ("number"),
    'valueBinding': ("view.newRuleValue")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n        <div class=\"rule-unit rule-text\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "metric.unit", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n    </div>\n\n    <a class=\"rule-button rule-more ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openAdvancedCondition", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n        ...\n    </a>\n\n    <div class=\"advanced-condition\">\n\n        <div class=\"rule-for rule-text\">for</div>\n\n        <a class=\"rule-button rule-aggregate ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openAggregatePopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "aggregate.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </a>\n\n        <div class=\"rule-for rule-text\">value</div>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.aggregateIsAny", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </div>\n\n    <div class=\"rule-then rule-text\">then</div>\n\n    <a class=\"rule-button rule-action ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openActionPopup", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "actionToTake", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </a>\n\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "pendingAction", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["user_menu/html"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n        <img class=\"gravatar-image\" ");
  hashContexts = {'src': depth0};
  hashTypes = {'src': "STRING"};
  options = {hash:{
    'src': ("view.gravatarURL")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("/>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"gravatar-image user\"></div>\n    ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n\n            <a data-role=\"button\" data-mini=\"true\"\n               ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "STRING"};
  options = {hash:{
    'href': ("view.accountUrl")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("\n               ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  options = {hash:{
    'target': ("view.isNotCore")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">Account</a>\n\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <button data-mini=\"true\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logoutClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Logout</a>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "Mist.isCore", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                <button data-mini=\"true\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Login</a>\n            ");
  return buffer;
  }

  data.buffer.push("<a id=\"me-btn\"\n   class=\"ui-btn-right\"\n   data-role=\"button\"\n   ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "meClicked", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.gravatarURL", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    &nbsp;</a>\n\n<div id=\"user-menu-popup\" data-role=\"popup\" data-position-to=\"#me-btn\" data-theme=\"b\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"content\">\n\n        <div>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "EMAIL", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n\n        <a href=\"https://mistio.zendesk.com/access/login\"\n           target=\"_blank\"\n           data-role=\"button\"\n           data-mini=\"true\">Support</a>\n\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "Mist.authenticated", {hash:{},inverse:self.program(8, program8, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </div>\n\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.loginView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.messageboxView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
    callback();
  }
});
