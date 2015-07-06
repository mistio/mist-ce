define('app/templates/templates', ['ember'], function() {
  return function (callback) {
    if (!JS_BUILD) {
      require([
        'text!app/templates/backend_add.hbs',
        'text!app/templates/backend_button.hbs',
        'text!app/templates/backend_edit.hbs',
        'text!app/templates/dialog.hbs',
        'text!app/templates/file_upload.hbs',
        'text!app/templates/graph_button.hbs',
        'text!app/templates/graph_list_bar.hbs',
        'text!app/templates/graph_list_control.hbs',
        'text!app/templates/graph_list.hbs',
        'text!app/templates/graph_list_item.hbs',
        'text!app/templates/home.hbs',
        'text!app/templates/image_list.hbs',
        'text!app/templates/image_list_item.hbs',
        'text!app/templates/ip_address_list_item.hbs',
        'text!app/templates/key_add.hbs',
        'text!app/templates/key_edit.hbs',
        'text!app/templates/key.hbs',
        'text!app/templates/key_list.hbs',
        'text!app/templates/key_list_item.hbs',
        'text!app/templates/login.hbs',
        'text!app/templates/log_list.hbs',
        'text!app/templates/log_list_item.hbs',
        'text!app/templates/machine_add.hbs',
        'text!app/templates/machine_edit.hbs',
        'text!app/templates/machine.hbs',
        'text!app/templates/machine_keys.hbs',
        'text!app/templates/machine_keys_list_item.hbs',
        'text!app/templates/machine_list.hbs',
        'text!app/templates/machine_list_item.hbs',
        'text!app/templates/machine_monitoring.hbs',
        'text!app/templates/machine_power.hbs',
        'text!app/templates/machine_shell.hbs',
        'text!app/templates/machine_tags.hbs',
        'text!app/templates/machine_tags_list_item.hbs',
        'text!app/templates/messagebox.hbs',
        'text!app/templates/metric_add_custom.hbs',
        'text!app/templates/metric_add.hbs',
        'text!app/templates/metric_node.hbs',
        'text!app/templates/missing.hbs',
        'text!app/templates/network_create.hbs',
        'text!app/templates/network.hbs',
        'text!app/templates/network_list.hbs',
        'text!app/templates/network_list_item.hbs',
        'text!app/templates/rule_edit.hbs',
        'text!app/templates/rule.hbs',
        'text!app/templates/rule_list.hbs',
        'text!app/templates/script_add.hbs',
        'text!app/templates/script_edit.hbs',
        'text!app/templates/script.hbs',
        'text!app/templates/script_list.hbs',
        'text!app/templates/script_list_item.hbs',
        'text!app/templates/script_log_list.hbs',
        'text!app/templates/script_run.hbs',
        'text!app/templates/subnet_list_item.hbs',
        'text!app/templates/user_menu.hbs',
      ], function () {
        Ember.TEMPLATES['backend_add'] = Ember.Handlebars.compile(arguments[0]);
        Ember.TEMPLATES['backend_button'] = Ember.Handlebars.compile(arguments[1]);
        Ember.TEMPLATES['backend_edit'] = Ember.Handlebars.compile(arguments[2]);
        Ember.TEMPLATES['dialog'] = Ember.Handlebars.compile(arguments[3]);
        Ember.TEMPLATES['file_upload'] = Ember.Handlebars.compile(arguments[4]);
        Ember.TEMPLATES['graph_button'] = Ember.Handlebars.compile(arguments[5]);
        Ember.TEMPLATES['graph_list_bar'] = Ember.Handlebars.compile(arguments[6]);
        Ember.TEMPLATES['graph_list_control'] = Ember.Handlebars.compile(arguments[7]);
        Ember.TEMPLATES['graph_list'] = Ember.Handlebars.compile(arguments[8]);
        Ember.TEMPLATES['graph_list_item'] = Ember.Handlebars.compile(arguments[9]);
        Ember.TEMPLATES['home'] = Ember.Handlebars.compile(arguments[10]);
        Ember.TEMPLATES['image_list'] = Ember.Handlebars.compile(arguments[11]);
        Ember.TEMPLATES['image_list_item'] = Ember.Handlebars.compile(arguments[12]);
        Ember.TEMPLATES['ip_address_list_item'] = Ember.Handlebars.compile(arguments[13]);
        Ember.TEMPLATES['key_add'] = Ember.Handlebars.compile(arguments[14]);
        Ember.TEMPLATES['key_edit'] = Ember.Handlebars.compile(arguments[15]);
        Ember.TEMPLATES['key'] = Ember.Handlebars.compile(arguments[16]);
        Ember.TEMPLATES['key_list'] = Ember.Handlebars.compile(arguments[17]);
        Ember.TEMPLATES['key_list_item'] = Ember.Handlebars.compile(arguments[18]);
        Ember.TEMPLATES['login'] = Ember.Handlebars.compile(arguments[19]);
        Ember.TEMPLATES['log_list'] = Ember.Handlebars.compile(arguments[20]);
        Ember.TEMPLATES['log_list_item'] = Ember.Handlebars.compile(arguments[21]);
        Ember.TEMPLATES['machine_add'] = Ember.Handlebars.compile(arguments[22]);
        Ember.TEMPLATES['machine_edit'] = Ember.Handlebars.compile(arguments[23]);
        Ember.TEMPLATES['machine'] = Ember.Handlebars.compile(arguments[24]);
        Ember.TEMPLATES['machine_keys'] = Ember.Handlebars.compile(arguments[25]);
        Ember.TEMPLATES['machine_keys_list_item'] = Ember.Handlebars.compile(arguments[26]);
        Ember.TEMPLATES['machine_list'] = Ember.Handlebars.compile(arguments[27]);
        Ember.TEMPLATES['machine_list_item'] = Ember.Handlebars.compile(arguments[28]);
        Ember.TEMPLATES['machine_monitoring'] = Ember.Handlebars.compile(arguments[29]);
        Ember.TEMPLATES['machine_power'] = Ember.Handlebars.compile(arguments[30]);
        Ember.TEMPLATES['machine_shell'] = Ember.Handlebars.compile(arguments[31]);
        Ember.TEMPLATES['machine_tags'] = Ember.Handlebars.compile(arguments[32]);
        Ember.TEMPLATES['machine_tags_list_item'] = Ember.Handlebars.compile(arguments[33]);
        Ember.TEMPLATES['messagebox'] = Ember.Handlebars.compile(arguments[34]);
        Ember.TEMPLATES['metric_add_custom'] = Ember.Handlebars.compile(arguments[35]);
        Ember.TEMPLATES['metric_add'] = Ember.Handlebars.compile(arguments[36]);
        Ember.TEMPLATES['metric_node'] = Ember.Handlebars.compile(arguments[37]);
        Ember.TEMPLATES['missing'] = Ember.Handlebars.compile(arguments[38]);
        Ember.TEMPLATES['network_create'] = Ember.Handlebars.compile(arguments[39]);
        Ember.TEMPLATES['network'] = Ember.Handlebars.compile(arguments[40]);
        Ember.TEMPLATES['network_list'] = Ember.Handlebars.compile(arguments[41]);
        Ember.TEMPLATES['network_list_item'] = Ember.Handlebars.compile(arguments[42]);
        Ember.TEMPLATES['rule_edit'] = Ember.Handlebars.compile(arguments[43]);
        Ember.TEMPLATES['rule'] = Ember.Handlebars.compile(arguments[44]);
        Ember.TEMPLATES['rule_list'] = Ember.Handlebars.compile(arguments[45]);
        Ember.TEMPLATES['script_add'] = Ember.Handlebars.compile(arguments[46]);
        Ember.TEMPLATES['script_edit'] = Ember.Handlebars.compile(arguments[47]);
        Ember.TEMPLATES['script'] = Ember.Handlebars.compile(arguments[48]);
        Ember.TEMPLATES['script_list'] = Ember.Handlebars.compile(arguments[49]);
        Ember.TEMPLATES['script_list_item'] = Ember.Handlebars.compile(arguments[50]);
        Ember.TEMPLATES['script_log_list'] = Ember.Handlebars.compile(arguments[51]);
        Ember.TEMPLATES['script_run'] = Ember.Handlebars.compile(arguments[52]);
        Ember.TEMPLATES['subnet_list_item'] = Ember.Handlebars.compile(arguments[53]);
        Ember.TEMPLATES['user_menu'] = Ember.Handlebars.compile(arguments[54]);
        callback();
      });
      return;
    }
Ember.TEMPLATES["backend_add"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                   <span class=\"provider-icon-small\">\n                        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("Mist.backendAddController.provider.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></span>\n                    </span>\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.backendAddController.provider.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                    Select provider\n                ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                            <span class=\"provider-icon-small\">\n                                <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></span>\n                            </span>\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </a>\n                    </li>\n                ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "field.show", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("field.className :field Mist.backendAddController.provider.provider")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n\n                <!-- Field Label -->\n\n                ");
  stack1 = helpers['if'].call(depth0, "field.label", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                <!-- Field Wrapper -->\n\n                <div class=\"field-wrapper\">\n                    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":first-child field.helpText::last-child")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isText", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isFile", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isCheckbox", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isRegion", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "field.isSlider", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(32, program32, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </div>\n                    ");
  stack1 = helpers['if'].call(depth0, "field.helpText", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n            </div>\n            ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers.unless.call(depth0, "field.isCheckbox", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'for': ("field.name")
  },hashTypes:{'for': "STRING"},hashContexts:{'for': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "field.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(":\n                        </label>\n                    ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'type': ("field.type"),
    'id': ("field.name"),
    'placeholder': ("field.placeholder"),
    'valueBinding': ("field.value")
  },hashTypes:{'data-theme': "STRING",'type': "ID",'id': "ID",'placeholder': "ID",'valueBinding': "STRING"},hashContexts:{'data-theme': depth0,'type': depth0,'id': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                        ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                            <a class=\"ui-btn ui-btn-a\"\n                                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("field.name")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadFile", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                    ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "field.buttonText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                            </a>\n                        ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <label>\n                                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-theme': ("a"),
    'checkedBinding': ("field.value")
  },hashTypes:{'data-theme': "STRING",'checkedBinding': "ID"},hashContexts:{'data-theme': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                                ");
  stack1 = helpers._triageMustache.call(depth0, "field.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                            </label>\n                        ");
  return buffer;
  }

function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("field.name")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                                class=\"mist-select\"\n                                data-role=\"collapsible\"\n                                data-iconpos=\"right\"\n                                data-collapsed-icon=\"carat-d\"\n                                data-expanded-icon=\"carat-u\"\n                                data-theme=\"a\">\n                                <h4>");
  stack1 = helpers['if'].call(depth0, "field.value", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(21, program21, data),fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n                                <ul data-role=\"listview\">\n                                    <li data-icon=\"false\" data-theme=\"a\">\n                                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(">-- None --</a>\n                                    </li>\n                                    ");
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                    <li data-icon=\"false\" data-theme=\"d\">\n                                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">Add Key</a>\n                                    </li>\n                                </ul>\n                            </div>\n                        ");
  return buffer;
  }
function program19(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "field.value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program21(depth0,data) {
  
  
  data.buffer.push("Select SSH Key");
  }

function program23(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                        <li data-icon=\"false\" data-theme=\"a\">\n                                            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                                        </li>\n                                    ");
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("field.name")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                                class=\"mist-select\"\n                                data-role=\"collapsible\"\n                                data-iconpos=\"right\"\n                                data-collapsed-icon=\"carat-d\"\n                                data-expanded-icon=\"carat-u\"\n                                data-theme=\"a\">\n                                <h4>");
  stack1 = helpers['if'].call(depth0, "field.value", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(28, program28, data),fn:self.program(26, program26, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n                                <ul data-role=\"listview\">\n                                    ");
  stack1 = helpers.each.call(depth0, "view.providerRegions", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(30, program30, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </ul>\n                            </div>\n                        ");
  return buffer;
  }
function program26(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "view.selectedRegion", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program28(depth0,data) {
  
  
  data.buffer.push("Select Region");
  }

function program30(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                        <li data-icon=\"false\" data-theme=\"a\">\n                                            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectRegion", "", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],data:data})));
  data.buffer.push(">\n                                                ");
  stack1 = helpers._triageMustache.call(depth0, "location", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                            </a>\n                                        </li>\n                                    ");
  return buffer;
  }

function program32(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                            <select class=\"toggle-field\" data-theme=\"a\" data-role=\"slider\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "switchToggled", "field", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                <option value=\"0\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "field.offLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</option>\n                                <option value=\"1\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "field.onLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</option>\n                            </select>\n                        ");
  return buffer;
  }

function program34(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <div class=\"last-child\">\n                            <a class=\"ui-btn ui-btn-a ui-btn-icon-notext ui-icon-question\"\n                                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("field.helpId")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "helpClicked", "field", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                            </a>\n                        </div>\n                    ");
  return buffer;
  }

function program36(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program38(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <a target=\"_blank\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("view.helpHref")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                Read more...\n            </a>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"backend-add\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\"\n    data-theme=\"c\">\n\n    <div data-role=\"header\">\n        <h1>Add cloud</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <label>Provider:</label>\n        <div id=\"new-backend-provider\"\n            class=\"mist-select\"\n            data-role=\"collapsible\"\n            data-collapsed-icon=\"carat-d\"\n            data-expanded-icon=\"carat-u\"\n            data-iconpos=\"right\"\n            data-theme=\"a\">\n            <h4>");
  stack1 = helpers['if'].call(depth0, "Mist.backendAddController.provider.title", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <ul class=\"mist-select\" data-role=\"listview\" data-theme=\"a\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.providerList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n        <style>\n\n        </style>\n        <div id=\"backend-add-fields\">\n        ");
  stack1 = helpers.each.call(depth0, "field", "in", "view.providerFields", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.addingBackend", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(36, program36, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Back\n            </a>\n            <a id=\"new-backend-ok\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isReady::ui-state-disabled :ui-btn :ui-btn-d")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add</a>\n        </div>\n    </div>\n</div>\n\n<div id=\"help-tooltip-screen\"\n    class=\"ui-popup-screen\n        ui-overlay-b\n        ui-screen-hidden\">\n</div>\n<div id=\"help-tooltip-popup\"\n     class=\"pop\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n    <div id=\"help-tooltip\"\n         class=\"ui-popup\n            ui-body-a\n            ui-overlay-shadow\n            ui-corner-all\"\n         data-role=\"popup\"\n         data-arrow=\"true\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n        <p>");
  stack1 = helpers._triageMustache.call(depth0, "view.helpText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "view.helpHref", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(38, program38, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </p>\n    </div>\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "fileUpload", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["backend_button"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "buttonClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n");
  return buffer;
  
});
Ember.TEMPLATES["backend_edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"backend-edit-screen\"\n    class=\"ui-popup-screen\n        ui-overlay-b\n        ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n<div id=\"backend-edit-popup\"\n     class=\"pop\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"backend-edit\"\n         class=\"mid-popup\n            ui-popup\n            ui-body-a\n            ui-overlay-shadow\n            ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n         <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\">\n\n            <h1 class=\"ui-title\">Edit cloud</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div role=\"main\" class=\"ui-content\" data-theme=\"a\">\n\n            <!-- New backend title text field -->\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.backendEditController.newTitle")
  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <!-- Backend state toggle switch -->\n\n            <div data-role=\"fieldcontain\">\n                <select id=\"backend-toggle\" data-role=\"slider\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "stateToggleSwitched", {hash:{
    'target': ("view"),
    'on': ("change")
  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        <option value=\"0\">Disabled</option>\n                        <option value=\"1\">Enabled</option>\n                </select>\n                <span class=\"state\">");
  stack1 = helpers._triageMustache.call(depth0, "Mist.backendEditController.backend.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n            </div>\n\n            <!-- Delete button -->\n\n            <a class=\"ui-btn ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view"),
    'on': ("click")
  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Delete\n            </a>\n\n            <!-- Delete confirmation -->\n\n            <div id=\"backend-delete-confirm\">\n                <label>Confirm backend removal?</label>\n                <label id=\"monitoring-message\">There are monitored machines.\n                    <br />Monitoring for these will be disabled\n                </label>\n                <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n                    <a class=\"ui-btn ui-shadow ui-corner-all\" id=\"button-confirm-disable\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "yesClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Yes</a>\n                    <a class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "noClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">No</a>\n                </div>\n            </div>\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.deletingBackend", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <!-- Back button -->\n\n            <a class=\"ui-btn ui-shadow ui-corner-all button-back\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["dialog"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "paragraph", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "link", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "command", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <p ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.class")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "paragraph", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n                ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("this.href"),
    'class': ("this.class"),
    'target': ("this.target")
  },hashTypes:{'href': "STRING",'class': "STRING",'target': "STRING"},hashContexts:{'href': depth0,'class': depth0,'target': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "linkClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "link", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </a>\n                ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <pre class=\"command-container\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "commandClicked", "", {hash:{
    'on': ("click"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "command", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n                ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n\n                <a class=\"ui-btn ui-btn-a ui-corner-all\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">OK</a>\n\n            ");
  return buffer;
  }

function program10(depth0,data) {
  
  var stack1;
  stack1 = helpers['if'].call(depth0, "view.isBack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program11(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n\n                <a class=\"ui-btn ui-btn-a ui-corner-all\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n\n            ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n                <div class=\"ok-cancel\n                        ui-controlgroup\n                        ui-controlgroup-horizontal\n                        ui-group-theme-a\n                        ui-corner-all\"\n                    data-role=\"controlgroup\"\n                    data-type=\"horizontal\">\n\n                    ");
  stack1 = helpers['if'].call(depth0, "view.isOKCancel", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                    ");
  stack1 = helpers['if'].call(depth0, "view.isYesNo", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                </div>\n\n            ");
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <a class=\"ui-btn\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "reject", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                Cancel\n                        </a>\n                        <a class=\"ui-btn ui-btn-d\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                OK\n                        </a>\n                    ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <a class=\"ui-btn ui-btn-d\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "reject", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                No\n                        </a>\n                        <a class=\"ui-btn\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                Yes\n                        </a>\n                    ");
  return buffer;
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"dialog-screen\"\n    class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n\n<div id=\"dialog-popup\"\n    class=\"flip\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"dialog\"\n        class=\"large-popup\n            ui-popup\n            ui-body-inherit\n            ui-overlay-shadow\n            ui-corner-all\"\n        data-role=\"popup\"\n        data-enhanced=\"true\"\n        data-transition=\"flip\"\n        data-dismissible=\"false\">\n\n\n        <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\" role=\"banner\">\n\n            <h1 class=\"ui-title\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.dialogController.options.head", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div class=\"ui-content ui-body-a\" role=\"main\">\n\n\n            ");
  stack1 = helpers.each.call(depth0, "Mist.dialogController.options.body", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n            <!-- Buttons -->\n\n            ");
  stack1 = helpers['if'].call(depth0, "view.isOK", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["file_upload"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader add-key-loader\"></div>\n            ");
  }

  data.buffer.push("<div id=\"file-upload\" class=\"large-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "Mist.fileUploadController.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <label for=\"textarea-private-key\">");
  stack1 = helpers._triageMustache.call(depth0, "Mist.fileUploadController.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(":\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.fileUploadController.uploadingFile", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("upload-area"),
    'valueBinding': ("Mist.fileUploadController.file")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <a class=\"ui-btn ui-corner-all ui-btn-a ui-btn-icon-right ui-icon-arrow-u\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Upload</a>\n\n        <input id=\"file-upload-input\" type=\"file\" name=\"file\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("/>\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-corner-all ui-btn-a\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"file-upload-ok\" class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doneClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Done</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_button"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"graph-button\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.buttonId")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <a class=\"ui-btn ui-btn-icon-left ui-icon-arrow-u ui-corner-all\"\n        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "graphButtonClicked", "view.graph", {hash:{
    'target': ("view.actionProxy")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n            ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.graph.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </a>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_list_bar"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphButton", {hash:{
    'graphBinding': ("this"),
    'actionProxyBinding': ("view.actionProxy")
  },hashTypes:{'graphBinding': "STRING",'actionProxyBinding': "STRING"},hashContexts:{'graphBinding': depth0,'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <div class=\"graph-button\" id=\"add-metric-btn\">\n            <a class=\"ui-btn ui-btn-icon-left ui-icon-plus ui-corner-all ui-btn-d\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addGraphClicked", {hash:{
    'target': ("view.actionProxy")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    Add Graph\n            </a>\n        </div>\n    ");
  return buffer;
  }

  data.buffer.push("<div id=\"graphBar\">\n\n    ");
  stack1 = helpers.each.call(depth0, "Mist.graphsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.config.canModify", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_list_control"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <a id=\"history-control-forward\"\n                class=\"time\n                    ui-btn\n                    ui-mini\n                    ui-corner-all\n                    ui-btn-inline\n                    ui-btn-icon-notext\n                    ui-icon-arrow-r\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "forwardClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            </a>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"graph-list-control\">\n\n    <div id=\"history-control\" class=\"ui-mini\">\n        <!--\n            Back Button\n        -->\n        <a id=\"history-control-back\"\n            class=\"time\n                ui-btn\n                ui-mini\n                ui-corner-all\n                ui-btn-inline\n                ui-btn-icon-notext\n                ui-icon-arrow-l\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        </a>\n        <!--\n            Forward Button\n        -->\n        ");
  stack1 = helpers.unless.call(depth0, "Mist.graphsController.stream.isStreaming", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div id=\"time-window-control\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":ui-mini Mist.graphsController.stream.isStreaming")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            <a class=\"ui-btn ui-btn-icon-right ui-icon-carat-d\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "view.timeWindowText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </a>\n        </div>\n\n    </div>\n\n    <div id=\"change-time-window\" data-role=\"popup\" data-transition=\"flip\" data-position-to=\"#time-window-control\">\n        <ul data-role='listview'>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "minutes", "last 10 mins", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    last 10 mins</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "hour", "last hour", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    last hour</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "day", "last day", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    last day</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "week", "last week", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    last week</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "month", "last month", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    last month</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "timeWindowChanged", "range", "range", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0,depth0],types:["STRING","STRING","STRING"],data:data})));
  data.buffer.push(">\n                    custom range</a>\n            </li>\n        </ul>\n    </div>\n\n\n    <!--\n        Pick Range Popup\n    -->\n\n    <div id=\"pick-range-screen\"\n        class=\"ui-popup-screen ui-screen-hidden\">\n    </div>\n    <div>\n        <div id=\"pick-range-popup\"\n            class=\"flip\n                ui-popup-container\n                ui-popup-hidden\n                ui-popup-truncate\">\n            <div id=\"pick-range\"\n                class=\"small-popup\n                    ui-popup\n                    ui-body-inherit\n                    ui-overlay-shadow\n                    ui-corner-all\"\n                data-role=\"popup\"\n                data-enhanced=\"true\"\n                data-position-to=\"#time-window-control\"\n                data-transition=\"flip\">\n\n                <div class=\"ui-header ui-bar-b\" role=\"banner\">\n                    <h1 class=\"ui-title\">Select Range</h1>\n                </div>\n                <div class=\"ui-content ui-body-a\" role=\"main\">\n                    <label>From:</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("range-start"),
    'placeholder': ("range start")
  },hashTypes:{'id': "STRING",'placeholder': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    <label>To:</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("range-stop"),
    'placeholder': ("range stop")
  },hashTypes:{'id': "STRING",'placeholder': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    <div class=\"ok-cancel\n                            ui-controlgroup\n                            ui-controlgroup-horizontal\n                            ui-group-theme-a\n                            ui-corner-all\"\n                        data-role=\"controlgroup\"\n                        data-type=\"horizontal\">\n\n                        <a class=\"ui-btn\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rangeBackClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                Back\n                        </a>\n                        <a id=\"key-add-ok\" class=\"ui-btn ui-btn-d\"\n                            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rangeOkClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                OK\n                        </a>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    <!--\n        Control Widget\n    -->\n    ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.config.canControl", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <!--\n        Graphs\n    -->\n\n    <div id=\"graphs\">\n        ");
  stack1 = helpers.each.call(depth0, "Mist.graphsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <!--\n        Minimized graph buttons\n    -->\n\n    ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.config.canMinimize", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <div id=\"top-history\">\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphListControl", {hash:{
    'actionProxyBinding': ("view.actionProxy")
  },hashTypes:{'actionProxyBinding': "STRING"},hashContexts:{'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        </div>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphListItem", {hash:{
    'graphBinding': ("this"),
    'actionProxyBinding': ("view.actionProxy")
  },hashTypes:{'graphBinding': "STRING",'actionProxyBinding': "STRING"},hashContexts:{'graphBinding': depth0,'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphListBar", {hash:{
    'actionProxyBinding': ("view.actionProxy")
  },hashTypes:{'actionProxyBinding': "STRING"},hashContexts:{'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "Mist.graphsController.isOpen", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["graph_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n            <div class=\"ajax-loader\"></div>\n\n        ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n            ");
  stack1 = helpers['if'].call(depth0, "view.graph.pendingRemoval", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.fetchingStats", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader fetching-stats-loader\"></div>\n            ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers.unless.call(depth0, "view.graph.isBuiltIn", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a class=\"ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", "view.graph", {hash:{
    'target': ("view.actionProxy")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">x\n                </a>\n            ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <a class=\"ui-btn ui-btn-c ui-btn-icon-notext ui-corner-all ui-icon-arrow-d\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "collapseClicked", "view.graph", {hash:{
    'target': ("view.actionProxy")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">-\n            </a>\n        ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <div class=\"graph-body\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("id")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        </div>\n    ");
  return buffer;
  }

  data.buffer.push("<div class=\"graph\" draggable=\"true\">\n\n    <!--\n        Graph Head\n    -->\n\n    <div class=\"header\">\n\n        <div class=\"title\">\n            ");
  stack1 = helpers._triageMustache.call(depth0, "view.graph.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n\n        ");
  stack1 = helpers['if'].call(depth0, "view.graph.pendingCreation", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <!--\n            Remove button\n        -->\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.config.canModify", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <!--\n            Minimize button\n        -->\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.graphsController.config.canMinimize", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <!--\n        Graph Body\n    -->\n    ");
  stack1 = helpers.each.call(depth0, "view.graph.batches", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["home"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "backendButton", {hash:{
    'backendBinding': ("this"),
    'class': ("ui-btn ui-input-btn ui-corner-all ui-shadow")
  },hashTypes:{'backendBinding': "STRING",'class': "STRING"},hashContexts:{'backendBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div class=\"ui-grid-a ui-responsive\">\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.hasIncidents::full-width :ui-block-a")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                <div class=\"ui-body\">\n                    <!-- Navigation -->\n                    <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow\">\n                        <!-- Machines link -->\n                        <li class=\"ui-li-has-count ui-first-child\">\n                            <a class=\"ui-btn\" href=\"#/machines\">\n                                <span class=\"ui-li-count ui-body-inherit\">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.backendsController.machineCount", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </span>\n                                Machines\n                            </a>\n                        </li>\n\n                        <!-- Images link -->\n                        <li class=\"ui-li-has-count\">\n                            <a class=\"ui-btn\" href=\"#/images\">\n                                <span class=\"ui-li-count ui-body-inherit\">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.backendsController.imageCount", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </span>\n                                Images\n                            </a>\n                        </li>\n\n                        <!-- Networks link -->\n                        ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.hasNetworks", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                        <!-- Keys link -->\n                        <li class=\"ui-li-has-count\">\n                            <a class=\"ui-btn\" href=\"#/keys\">\n                                <span class=\"ui-li-count ui-body-inherit\">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.keysController.content.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </span>\n                                Keys\n                            </a>\n                        </li>\n\n                        ");
  stack1 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </ul>\n                </div>\n            </div>\n\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.hasIncidents::no-width :ui-block-b")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                <div class=\"ui-body\">\n                    <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow incidents header\">\n                        <li class=\"ui-li-divider ui-bar-c ui-first-child\">Incidents</li>\n                        <li class=\"ui-li-divider ui-bar-c ui--child\" style=\"display:none;\"></li>\n                    </ul>\n                    <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow incidents\">\n                        ");
  stack1 = helpers.each.call(depth0, "Mist.openIncidents", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </ul>\n                </div>\n            </div>\n        </div><!-- /grid-a -->\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphList", {hash:{
    'actionProxyBinding': ("view")
  },hashTypes:{'actionProxyBinding': "STRING"},hashContexts:{'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <li class=\"ui-li-has-count\">\n                            <a class=\"ui-btn\" href=\"#/networks\">\n                                <span class=\"ui-li-count ui-body-inherit\">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.backendsController.networkCount", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </span>\n                                Networks\n                            </a>\n                        </li>\n                        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <!-- Scripts link -->\n                        <li class=\"ui-li-has-count\">\n                            <a class=\"ui-btn\" href=\"#/scripts\">\n                                <span class=\"ui-li-count ui-body-inherit\">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.scriptsController.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </span>\n                                Scripts\n                            </a>\n                        </li>\n                        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            ");
  stack1 = helpers['if'].call(depth0, "isClosed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                <li class=\"ui-mini incident\">\n                                    <a class=\"ui-icon-check ui-btn ui-btn-icon-right\"\n                                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "incidentClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                        <span class=\"machine\">\n                                            ");
  stack1 = helpers._triageMustache.call(depth0, "machineName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(":\n                                        </span>\n                                        <span class=\"rule-condition\">\n                                            ");
  stack1 = helpers._triageMustache.call(depth0, "ruleText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                        </span>\n                                        <span class=\"duration\">\n                                            for ");
  stack1 = helpers._triageMustache.call(depth0, "duration", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                        </span>\n                                        <span class=\"time\">");
  stack1 = helpers._triageMustache.call(depth0, "closed", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ago </span>\n                                    </a>\n                                </li>\n                            ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                <li class=\"ui-bar-b incident\">\n                                    <a class=\"ui-icon-alert ui-btn ui-btn-icon-right\"\n                                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "incidentClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                        <span class=\"machine\">\n                                            ");
  stack1 = helpers._triageMustache.call(depth0, "machineName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(":\n                                        </span>\n                                        <span class=\"rule-condition\">\n                                            ");
  stack1 = helpers._triageMustache.call(depth0, "ruleText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                        </span>\n                                        <span class=\"time\">\n                                            ");
  stack1 = helpers._triageMustache.call(depth0, "prettyTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                        </span>\n                                    </a>\n                                </li>\n                            ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div class=\"logs\" data-role=\"collapsible\" data-collapsed=\"false\">\n               <h4>Activity log</h4>\n               ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "logList", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            </div>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"home-page\" data-role=\"page\" class=\"ui-page-active ui-page\">\n    <!-- Page header -->\n    <div class=\"ui-header ui-bar-b\">\n        <h1 class=\"ui-title\">mist.io</h1>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n    </div>\n\n    <!-- Page Body -->\n    <div role=\"main\" class=\"ui-content\" data-theme=\"c\">\n\n        <!-- Add backend button -->\n        <a id=\"add-backend-btn\" class=\"ui-link ui-btn ui-btn-d ui-icon-plus\n            ui-btn-icon-right ui-shadow ui-corner-all ui-mini\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addBackend", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" data-mini=\"true\">\n                Add cloud\n        </a>\n\n        <!-- Backends list -->\n        <div id=\"backend-buttons\" data-role=\"controlgroup\" data-type=\"horizontal\"\n            class=\"ui-controlgroup ui-controlgroup-horizontal ui-corner-all\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.length", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "backendAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "backendEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["image_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "imageListItem", {hash:{
    'imageBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'imageBinding': "STRING",'class': "STRING"},hashContexts:{'imageBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                    Please wait...\n                ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n                    Continue search on server...\n                ");
  }

  data.buffer.push("<div id=\"image-list-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button ui-btn-left ui-btn ui-icon-home\n            ui-btn-icon-left ui-shadow ui-corner-all\">Home</a>\n\n        <h1>Images</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingImages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("search-term-input"),
    'placeholder': ("Search images ..."),
    'valueBinding': ("Mist.imageSearchController.searchTerm")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.imageSearchController.isSearching", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <ul id=\"image-list\"\n            data-role=\"listview\"\n            data-inset=\"true\"\n            class=\"checkbox-list\">\n            ");
  stack1 = helpers.each.call(depth0, "view.renderedImages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        ");
  stack1 = helpers['if'].call(depth0, "view.renderingMoreImages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a id=\"images-advanced-search\" class=\"ui-btn ui-btn-b ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "searchClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            <span>\n                ");
  stack1 = helpers['if'].call(depth0, "view.searchingImages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </span>\n        </a>\n\n        <div class=\"small-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["image_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.starClass")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleImageStar", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.image.star")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</label>\n\n<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchImage", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n    <h3>");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</h3>\n    <p class=\"tag\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.image.id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</p>\n    <p class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "view.image.backend.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n</a>\n");
  return buffer;
  
});
Ember.TEMPLATES["ip_address_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"ajax-loader\"></span>\n            ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "server.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                        --\n                    ");
  }

  data.buffer.push("<td>");
  stack1 = helpers._triageMustache.call(depth0, "ipaddress", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n<td>\n    <div class=\"reserved\">\n        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isTogglingReserve:ui-state-disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers['if'].call(depth0, "isTogglingReserve", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <select name=\"reserved-slider\" data-role=\"slider\" data-mini=\"true\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "reservedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                <option value=\"off\"></option>\n                <option value=\"on\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'selected': ("reserved")
  },hashTypes:{'selected': "STRING"},hashContexts:{'selected': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Reserved</option>\n            </select>\n        <span>\n    </div>\n    <div class=\"associate\">\n        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isAssociating:ui-state-disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            <a ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.domID"),
    'class': ("isAssociating:associating\n                    isAssociating::ui-icon-carat-d\n                    isAssociating:ui-state-disabled\n                    :assign-network-btn\n                    :ui-btn-icon-right\n                    :ui-mini\n                    :ui-btn\n                    :ui-corner-all\n                    :ui-btn-a")
  },hashTypes:{'id': "STRING",'class': "STRING"},hashContexts:{'id': depth0,'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "assignClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers['if'].call(depth0, "server.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </a>\n        </span>\n    </div>\n</td>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_add"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                    <div class=\"ajax-loader key-add-loader\"></div>\n                ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.uploadingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"key-add-screen\"\n    class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n\n<div id=\"key-add-popup\"\n    class=\"flip\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"key-add\"\n        class=\"large-popup\n            ui-popup\n            ui-body-inherit\n            ui-overlay-shadow\n            ui-corner-all\"\n        data-role=\"popup\"\n        data-enhanced=\"true\"\n        data-position-to=\"origin\"\n        data-transition=\"flip\">\n\n\n        <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\" role=\"banner\">\n\n            <h1 class=\"ui-title\">Add key</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div class=\"ui-content ui-body-a\" role=\"main\">\n\n            <!-- Key Name Field -->\n\n            <label for=\"key-add-id\">Name:</label>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("key-add-id"),
    'valueBinding': ("Mist.keyAddController.keyId")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <!-- Key Private Field -->\n\n            <label for=\"key-add-private\">Private Key:\n                ");
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.generatingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </label>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("key-add-private"),
    'valueBinding': ("Mist.keyAddController.keyPrivate")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <!-- Generate and Upload buttons -->\n\n            <div class=\"generate-upload\n                    ui-controlgroup\n                    ui-controlgroup-horizontal\n                    ui-group-theme-a\n                    ui-corner-all\"\n                data-role=\"controlgroup\"\n                data-type=\"horizontal\">\n\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-gear\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "generateClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Generate\n                </a>\n\n                <a class=\"ui-btn ui-btn-icon-right ui-icon-arrow-u\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Upload\n                </a>\n            </div>\n\n            <!-- Hidden Input field for uploading ssh keys -->\n\n            <input id=\"key-add-upload\" type=\"file\" name=\"file\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "uploadInputChanged", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("/>\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.keyAddController.addingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <!-- Back and Add buttons -->\n\n            <div class=\"ok-cancel\n                    ui-controlgroup\n                    ui-controlgroup-horizontal\n                    ui-group-theme-a\n                    ui-corner-all\"\n                data-role=\"controlgroup\"\n                data-type=\"horizontal\">\n\n                <a class=\"ui-btn\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Back\n                </a>\n                <a id=\"key-add-ok\" class=\"ui-btn ui-btn-d ui-state-disabled\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Add\n                </a>\n            </div>\n\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"rename-key-popup\"\n     class=\"small-popup\"\n     data-role=\"popup\"\n     data-overlay-theme=\"b\"\n     data-transition=\"slideup\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Rename key</h1>\n    </div>\n\n    <div data-role=\"content\">\n\n        <label for=\"new-key-name\">New name:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("new-key-name"),
    'valueBinding': ("Mist.keyEditController.newKeyId")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.renamingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"rename-key-ok\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</a>\n        </div>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n                ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div id=\"single-key-machines\" data-role=\"collapsible\">\n\n            <h4>Machines\n                ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <ul data-role=\"listview\" class=\"checkbox-list\" data-inset=\"true\">\n                ");
  stack1 = helpers.each.call(depth0, "view.machines", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineListItem", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'machineBinding': "STRING",'class': "STRING"},hashContexts:{'machineBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-key-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#/keys\" class=\"responsive-button ui-btn-left ui-btn ui-icon-arrow-l\n            ui-btn-icon-left ui-shadow ui-corner-all\">\n            Keys\n        </a>\n\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n         <div data-role=\"collapsible\" data-collapsed=\"false\">\n            <h4>Public Key\n                ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPublicKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <input id=\"public-key\" type=\"text\" readonly=\"readonly\" onclick=\"this.focus();this.select()\"/>\n        </div>\n\n        <div data-role=\"collapsible\">\n            <h4>Private key\n                ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.gettingPrivateKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <a class=\"ui-btn ui-shadow ui-corner-all\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "displayClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Display\n            </a>\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "machines", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"large-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div class=\"dual-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a class=\"ui-btn ui-icon-edit ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Rename</a>\n        </td><td>\n            <a class=\"ui-btn ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Delete</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyListItem", {hash:{
    'keyBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'keyBinding': "STRING",'class': "STRING"},hashContexts:{'keyBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"key-list-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button ui-btn-left ui-btn ui-icon-home\n            ui-btn-icon-left ui-shadow ui-corner-all\">Home</a>\n\n        <h1>Keys</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <a id=\"select-keys-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"arrow-d\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Select</a>\n\n        <a id=\"add-key-btn\"\n           class=\"responsive-button  ui-btn ui-btn-d ui-icon-plus\n                ui-btn-icon-right ui-shadow ui-corner-all\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add</a>\n\n        <ul data-role=\"listview\"\n            data-filter=\"true\"\n            data-inset=\"true\"\n            data-filter-placeholder=\"Filter...\"\n            class=\"checkbox-list\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div id=\"select-keys-popup\" data-role=\"popup\" data-transition=\"flip\" data-position-to=\"#select-keys-btn\">\n        <ul data-role='listview'>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", true, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">All</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", false, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">None</a>\n            </li>\n        </ul>\n    </div>\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a class=\"ui-btn ui-icon-edit ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Rename</a>\n        </td><td>\n            <a class=\"ui-btn ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Delete</a>\n        </td><td>\n            <a class=\"ui-btn ui-icon-gear ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setDefaultClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Set default</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["key_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    <div class=\"ui-grid-b\">\n        <div class=\"ui-block-a key-name\">");
  stack1 = helpers._triageMustache.call(depth0, "view.key.id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        <div class=\"ui-block-b\"></div>\n        <div class=\"ui-block-c key-tags\">\n            ");
  stack1 = helpers['if'].call(depth0, "view.key.isDefault", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n             <span class=\"tag\">default</span>\n            ");
  }

  data.buffer.push("<label>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.key.selected")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</label>\n\n");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "key", "view.key", options) : helperMissing.call(depth0, "link-to", "key", "view.key", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["login"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"login-popup\" class=\"mid-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Login to mist.io</h1>\n    </div>\n\n    <div data-role=\"content\">\n        <label for=\"login-email\">Email:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("login-email"),
    'valueBinding': ("Mist.loginController.email")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <label for=\"login-password\">Password:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("login-password"),
    'type': ("password"),
    'valueBinding': ("Mist.loginController.password")
  },hashTypes:{'id': "STRING",'type': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'type': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.loginController.loggingIn", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "forgot", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" target=\"_new\">Forgot your password?</a>\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"login-ok\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Log in</a>\n        </div>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["log_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n    ");
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "logListItem", {hash:{
    'logBinding': ("this")
  },hashTypes:{'logBinding': "STRING"},hashContexts:{'logBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"no-logs\"></div>\n    ");
  }

  data.buffer.push("<div class=\"log-list\">\n    <div class=\"filter-wrapper\">\n        <fieldset data-role=\"controlgroup\" data-type=\"horizontal\">\n\n            <input name=\"event\"\n                id=\"event-all\"\n                data-mini=\"true\"\n                value=\"on\"\n                checked=\"checked\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "all", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-all\">All</label>\n\n            <input name=\"event\"\n                id=\"event-jobs\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "job", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-jobs\">Jobs</label>\n\n            <input name=\"event\"\n                id=\"event-requests\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "request", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-requests\">Requests</label>\n\n            <input name=\"event\"\n                id=\"event-incidents\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "incident", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-incidents\">Incidents</label>\n\n            <input name=\"event\"\n                id=\"event-sessions\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "session", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-sessions\">Sessions</label>\n\n            <input name=\"event\"\n                id=\"event-shell\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "shell", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-shell\">Shell</label>\n\n            <input name=\"event\"\n                id=\"event-error\"\n                data-mini=\"true\"\n                value=\"off\"\n                type=\"radio\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "updateFilterFlags", "error", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <label for=\"event-error\">Errors</label>\n        </fieldset>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("log-filter"),
    'valueBinding': ("view.filterString"),
    'placeholder': ("Filter logs...")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING",'placeholder': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </div>\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.searching", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow ui-mini\"\n        data-role=\"listview\"\n        data-enhanced=\"true\"\n        data-inset=\"true\">\n        ");
  stack1 = helpers.each.call(depth0, "Mist.logsController", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.fetchingHistory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.noMoreLogs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"mid-padding\"></div>\n</div>");
  return buffer;
  
});
Ember.TEMPLATES["log_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push(": ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.log.condition", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                    <div class=\"ui-btn-icon-notext ui-icon-alert error\"></div>\n                ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <div class=\"details info-table\">\n        <table>\n            <tbody>\n            <tr>\n                <td>Date</td>\n                <td>");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.fullPrettyTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n            </tr>\n            ");
  stack1 = helpers['if'].call(depth0, "view.backendTitle", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "view.machineLink", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  stack1 = helpers.each.call(depth0, "view.details", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </tbody>\n        </table>\n    </div>\n");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <tr>\n                <td>Backend Title</td>\n                <td>");
  stack1 = helpers._triageMustache.call(depth0, "view.backendTitle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n            </tr>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            <tr>\n                <td>Machine</td>\n                <td>\n                    ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "machine", "view.machineLink", options) : helperMissing.call(depth0, "link-to", "machine", "view.machineLink", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </td>\n            </td>\n            ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.machineLink.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <tr>\n                    <td>");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</td>\n                    <td><div>");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div></td>\n                </tr>\n            ");
  return buffer;
  }

  data.buffer.push("<span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.collapsedClass")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <a class=\"ui-btn\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCollapse", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n\n        <div class=\"ui-grid-b\">\n            <div class=\"ui-block-a\">\n                <div>\n                    ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.formatedAction", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  stack1 = helpers['if'].call(depth0, "view.isIncident", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n                ");
  stack1 = helpers['if'].call(depth0, "view.log.error", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n            <div class=\"ui-block-b\">\n                <div class=\"tag\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.log.type", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>\n            </div>\n            <div class=\"ui-block-c\">\n                <div class=\"time\">");
  stack1 = helpers._triageMustache.call(depth0, "view.prettyTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n            </div>\n        </div>\n    </a>\n");
  stack1 = helpers.unless.call(depth0, "view.isCollapsed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</span>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_add"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                   <span class=\"provider-icon-small\">\n                        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("Mist.machineAddController.newMachineProvider.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                        </span>\n                    </span>\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "canCreateMachine", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <li data-icon=\"false\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProvider", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                    <span class=\"provider-icon-small\">\n                                        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></span>\n                                    </span>\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </a>\n                            </li>\n                        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <span class=\"image-icon-small\">\n                        <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("Mist.machineAddController.newMachineImage.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                        </span>\n                    </span>\n                ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers.unless.call(depth0, "Mist.machineAddController.newMachineProvider.images.hasStarred", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <li data-icon=\"false\">\n                            <span class=\"image-icon-small\">\n                                <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></span>\n                            </span>\n                            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectImage", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                        </li>\n                    ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "star", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }
function program12(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <li data-icon=\"false\">\n                            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectImage", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                <span class=\"image-icon-small\">\n                                    <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.className")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></span>\n                                </span>\n                                ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                            </a>\n                        </li>\n                    ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectSize", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        <span class=\"size-decription\">\n                         - disk:");
  stack1 = helpers._triageMustache.call(depth0, "disk", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(", ram:");
  stack1 = helpers._triageMustache.call(depth0, "ram", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </span>\n                    </a>\n                </li>\n                ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectLocation", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                    </li>\n                    ");
  return buffer;
  }

function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectKey", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                    </li>\n                ");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <input ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("this.id"),
    'name': ("this.id"),
    'checked': ("this.selected")
  },hashTypes:{'id': "STRING",'name': "STRING",'checked': "STRING"},hashContexts:{'id': depth0,'name': depth0,'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                            type=\"checkbox\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleNetworkSelection", "", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                        <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'for': ("this.id")
  },hashTypes:{'for': "STRING"},hashContexts:{'for': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" data-corners=\"false\">\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </label>\n                    ");
  return buffer;
  }

function program22(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.scriptsController.length", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program23(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <select class=\"toggle-field ui-mini\" data-theme=\"a\" data-role=\"slider\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "switchToggled", {hash:{
    'on': ("change"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    <option value=\"basic\">basic</option>\n                    <option value=\"advanced\">advanced</option>\n                </select>\n            ");
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineScript.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }

function program27(depth0,data) {
  
  
  data.buffer.push(" Select ");
  }

function program29(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <li data-icon=\"false\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectScript", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                            </li>\n                        ");
  return buffer;
  }

function program31(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            Estimated price:\n            <span>");
  stack1 = helpers._triageMustache.call(depth0, "view.price", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"create-machine-panel\"\n     data-swipe-close=\"false\"\n     class=\"side-panel\"\n     data-role=\"panel\"\n     data-position=\"right\"\n     data-display=\"overlay\"\n     data-theme=\"c\">\n\n    <div data-role=\"header\">\n        <h1 class=\"ui-title\">Create Machine</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <!-- Select Name -->\n\n        <label for=\"create-machine-name\">Name:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("create-machine-name"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineName")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <!-- Select Provider -->\n\n        <label>Provider:</label>\n        <div id=\"create-machine-provider\"\n            data-role=\"collapsible\"\n            data-iconpos=\"right\"\n            data-collapsed-icon=\"arrow-d\"\n            data-expanded-icon=\"arrow-u\"\n            data-theme=\"a\"\n            class=\"mist-select\">\n            <h4>");
  stack1 = helpers['if'].call(depth0, "Mist.machineAddController.newMachineProvider.provider", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineProvider.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Image -->\n\n        <label>Image:</label>\n        <div id=\"create-machine-image\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h4>\n                ");
  stack1 = helpers['if'].call(depth0, "Mist.machineAddController.newMachineImage.id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineImage.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h4>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.images.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n\n        <!-- Select Size -->\n        <div id=\"size\">\n        <label>Size:</label>\n        <div id=\"create-machine-size\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h4>");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineSize.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.sizes.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n        </div>\n\n        <!-- Select Location -->\n\n        <div id=\"location\">\n            <label>Location:</label>\n            <div id=\"create-machine-location\"\n                 data-role=\"collapsible\"\n                 data-iconpos=\"right\"\n                 data-collapsed-icon=\"arrow-d\"\n                 data-expanded-icon=\"arrow-u\"\n                 data-theme=\"a\"\n                 class=\"mist-select\">\n                <h4>");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineLocation.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n                <ul data-role=\"listview\" data-theme=\"a\">\n                    ");
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.locations.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </ul>\n            </div>\n        </div>\n\n        <!-- Docker Specific -->\n\n        <div class=\"docker\">\n\n            <!-- Environment Vars -->\n            <label for=\"create-machine-env\">Environment Variables:</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-env"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineDockerEnvironment")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <!-- Command -->\n            <label for=\"create-machine-command\">Command:</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-command"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineDockerCommand")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        </div>\n\n        <!-- Select Key -->\n\n        <div id=\"key\">\n        <label>Key:</label>\n        <div id=\"create-machine-key\"\n             data-role=\"collapsible\"\n             data-iconpos=\"right\"\n             data-collapsed-icon=\"arrow-d\"\n             data-expanded-icon=\"arrow-u\"\n             data-theme=\"a\"\n             class=\"mist-select\">\n            <h4>");
  stack1 = helpers._triageMustache.call(depth0, "Mist.machineAddController.newMachineKey.id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n            <ul data-role=\"listview\" data-theme=\"a\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.keysController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                <li data-icon=\"false\" data-theme=\"d\">\n                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createKeyClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add Key</a>\n                </li>\n            </ul>\n        </div>\n        </div>\n\n        <!-- Select Networks -->\n\n        <div id=\"create-machine-network\">\n            <label>Networks:</label>\n            <div data-role=\"collapsible\"\n                    data-iconpos=\"right\"\n                    data-collapsed-icon=\"arrow-d\"\n                    data-expanded-icon=\"arrow-u\"\n                    data-theme=\"a\"\n                    class=\"mist-select\">\n                <h4>Networks</h4>\n                <fieldset data-role=\"controlgroup\" data-theme=\"a\">\n                    ");
  stack1 = helpers.each.call(depth0, "Mist.machineAddController.newMachineProvider.networks.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </fieldset>\n            </div>\n        </div>\n\n        <!-- Select Script -->\n        <div id=\"script\">\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <label for=\"create-machine-script\">Script:</label>\n\n            <div class=\"script-option basic\">\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-script"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.machineAddController.newMachineScript")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n            <div class=\"script-option advanced\">\n                <div id=\"create-machine-script-select\"\n                     data-role=\"collapsible\"\n                     data-iconpos=\"right\"\n                     data-collapsed-icon=\"arrow-d\"\n                     data-expanded-icon=\"arrow-u\"\n                     data-theme=\"a\"\n                     class=\"mist-select\">\n                    <h4>");
  stack1 = helpers['if'].call(depth0, "Mist.machineAddController.newMachineScript.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(27, program27, data),fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </h4>\n                    <ul data-role=\"listview\" data-theme=\"a\">\n                        ");
  stack1 = helpers.each.call(depth0, "Mist.scriptsController", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(29, program29, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </ul>\n                </div>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-script-params"),
    'data-theme': ("a"),
    'placeholder': ("optional parameters"),
    'valueBinding': ("Mist.machineAddController.newMachineScriptParams")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n        </div>\n\n        <div id=\"ports\">\n            <!-- Expose Ports -->\n            <label>Ports:</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-ports"),
    'data-theme': ("a"),
    'placeholder': ("e.g. 80:80"),
    'valueBinding': ("Mist.machineAddController.newMachineDockerPorts")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n\n        <div class=\"azure\">\n\n            <!-- Expose Ports -->\n            <label>Ports:</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("create-machine-azure-ports"),
    'data-theme': ("a"),
    'placeholder': ("e.g. http tcp 80:80, smtp tcp 25:25, https tcp 443:443"),
    'valueBinding': ("Mist.machineAddController.newMachineAzurePorts")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        </div>\n\n\n        <!-- Enable monitoring -->\n        <div id=\"create-machine-monitoring\" class=\"ui-state-disabled\">\n            <label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-theme': ("a"),
    'checkedBinding': ("Mist.machineAddController.newMachineMonitoring")
  },hashTypes:{'data-theme': "STRING",'checkedBinding': "STRING"},hashContexts:{'data-theme': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            Enable monitoring\n            </label>\n        </div>\n\n        <div id=\"create-machine-cost\">\n        ");
  stack1 = helpers['if'].call(depth0, "view.price", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(31, program31, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\" >\n                <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\"\n                   ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n                <a id=\"create-machine-ok\"\n                    class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "launchClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Launch!</a>\n        </div>\n    </div>\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"machine-edit-screen\"\n    class=\"ui-popup-screen\n        ui-overlay-b\n        ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n<div id=\"machine-edit-popup\"\n     class=\"pop\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"machine-edit\"\n         class=\"mid-popup\n            ui-popup\n            ui-body-a\n            ui-overlay-shadow\n            ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n         <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\">\n\n            <h1 class=\"ui-title\">Rename machine</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div role=\"main\" class=\"ui-content\" data-theme=\"a\">\n\n            <!-- New backend name text field -->\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("machine-edit-new-name"),
    'valueBinding': ("Mist.machineEditController.newName")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.machineEditController.renamingMachine", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\" >\n                    <a class=\"ui-btn ui-btn-a ui-corner-all ui-shadow\"\n                       ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n                    <a id=\"machine-edit-ok\"\n                        class=\"ui-btn ui-btn-d ui-corner-all ui-shadow\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</a>\n            </div>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers._triageMustache.call(depth0, "state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.backendsController.loadingMachines", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <span id=\"mist-manage-keys\"\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isRunning::ui-state-disabled\n                :ui-btn-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n\n            <!-- If machine is beging created, hide keys UI -->\n            ");
  stack1 = helpers.unless.call(depth0, "pendingCreation", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </span>\n        ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "keysCount", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <a class=\"ui-btn\n                            ui-shadow\n                            ui-corner-all\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "manageKeysClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "keysCount", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" keys\n                    </a>\n                ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <a class=\"ui-btn\n                            ui-btn-d\n                            ui-btn-icon-right\n                            ui-icon-plus\n                            ui-corner-all\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addKeyClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Add key\n                    </a>\n                ");
  return buffer;
  }

function program12(depth0,data) {
  
  
  data.buffer.push("\n                             probing... <div class=\"ajax-loader\"></div>\n                         ");
  }

function program14(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                             ");
  stack1 = helpers._triageMustache.call(depth0, "view.lastProbe", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                             <a id=\"machine-probe-btn\"\n                                class=\"ui-btn ui-shadow ui-corner-all\"\n                                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                    Probe\n                            </a>\n                         ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Up and running for</td>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "view.upFor", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                    </tr>\n                ");
  return buffer;
  }

function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Load</td>\n                        <td>\n                            <div class=\"loadleds\">\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg15 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg5 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg1 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                            </div>\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "loadavg", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "cores", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("- ");
  stack1 = helpers._triageMustache.call(depth0, "loadavg5", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }
function program19(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("- ");
  stack1 = helpers._triageMustache.call(depth0, "cores", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" cores ");
  return buffer;
  }

function program21(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Latency</td>\n                        <td>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":netleds")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled4 :netled1")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled3 :netled2")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled2 :netled3")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled1 :netled4")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                                </div>\n                            </div>\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "latency", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("ms</td>\n                    </tr>\n                ");
  return buffer;
  }

function program23(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Packet loss</td>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "loss", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                    </tr>\n                ");
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Tags</td>\n                        <td>\n                            ");
  stack1 = helpers.each.call(depth0, "tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(26, program26, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }
function program26(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <span class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                            ");
  return buffer;
  }

function program28(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Public IPs</td>\n                        <td>\n                            ");
  stack1 = helpers.each.call(depth0, "view.public_ips", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(29, program29, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }
function program29(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                <div class=\"ip\">");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n                            ");
  return buffer;
  }

function program31(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>Private IPs</td>\n                        <td>\n                            ");
  stack1 = helpers.each.call(depth0, "view.private_ips", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(29, program29, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }

function program33(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td colspan=\"2\"><div class=\"df\">");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.df", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></td>\n                    </tr>\n                ");
  return buffer;
  }

function program35(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                    </tr>\n                ");
  return buffer;
  }

function program37(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div id=\"single-machine-metadata\" data-role=\"collapsible\">\n\n                <h4>Full metadata list</h4>\n\n                <table class=\"info-table\">\n                    <tbody>\n                    ");
  stack1 = helpers.each.call(depth0, "view.metadata", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(38, program38, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </tbody>\n                </table>\n\n            </div>\n        ");
  return buffer;
  }
function program38(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <tr>\n                            <td>");
  stack1 = helpers._triageMustache.call(depth0, "key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                            <td>");
  stack1 = helpers._triageMustache.call(depth0, "value", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                        </tr>\n                    ");
  return buffer;
  }

function program40(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a id=\"single-machine-shell-btn\"\n                    target=\"_blank\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("rdpURL"),
    'class': ("canConnect::ui-state-disabled\n                        :ui-btn\n                        :ui-btn-icon-left\n                        :ui-icon-gear")
  },hashTypes:{'href': "STRING",'class': "STRING"},hashContexts:{'href': depth0,'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Connect</a>\n            ");
  return buffer;
  }

function program42(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a id=\"single-machine-shell-btn\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("canConnect::ui-state-disabled\n                        :ui-btn\n                        :ui-btn-icon-left\n                        :ui-icon-gear")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Shell</a>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-machine-page\" data-role=\"page\" class=\"ui-page-active\" data-theme=\"a\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a class=\"ui-btn\n                ui-btn-icon-left\n                ui-icon-arrow-l\n                responsive-button\"\n            href=\"#/machines\">Machines</a>\n\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"header\" data-theme=\"a\" class=\"single-machine-header\">\n\n        <!-- Provider Icon -->\n        <span class=\"single-view-icon-wrapper\">\n            <span id=\"single-view-provider-icon\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.providerIconClass")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            </span>\n        </span>\n\n        <!-- OS Icon -->\n        <span class=\"single-view-icon-wrapper\">\n            <span id=\"single-view-image-icon\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.imageIconClass")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            </span>\n        </span>\n\n        <!-- State label -->\n        <h1 ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers.unless.call(depth0, "isUnknown", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </h1>\n\n        <!-- Show spinner if machines are being loaded -->\n        ");
  stack1 = helpers.unless.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n        <!-- If machine is not running created, disable keys UI -->\n        ");
  stack1 = helpers.unless.call(depth0, "isWindows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n\n        <!--\n\n             Monitoring collapsible\n\n        -->\n\n\n        <div id=\"monitoring-collapsible\" data-role=\"collapsible\" data-collapsed=\"false\">\n\n            <h4>Monitoring</h4>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineMonitoring", {hash:{
    'machineBinding': ("view.machine")
  },hashTypes:{'machineBinding': "STRING"},hashContexts:{'machineBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n        </div>\n\n\n        <!--\n\n             Information collapsibles\n\n        -->\n\n\n        <div data-role=\"collapsible\" data-collapsed=\"false\">\n\n            <h4>Basic Info</h4>\n\n            <table class=\"info-table\">\n                <tbody>\n                <tr>\n                    <td>Last probed</td>\n                    <td> ");
  stack1 = helpers['if'].call(depth0, "probing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </td>\n                </tr>\n                ");
  stack1 = helpers['if'].call(depth0, "probed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "loadavg", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "latency", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "loss", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "view.public_ips", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "view.private_ips", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(31, program31, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "view.machine.df", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(33, program33, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers.each.call(depth0, "view.basicInfo", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(35, program35, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </tbody>\n            </table>\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "view.metadata", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(37, program37, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "metricAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineKeys", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineTags", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineShell", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machinePower", {hash:{
    'position': ("#single-machine-power-btn")
  },hashTypes:{'position': "STRING"},hashContexts:{'position': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a id=\"single-machine-tags-btn\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("id::ui-state-disabled\n                    can_tag::ui-state-disabled\n                    :ui-btn\n                    :ui-btn-icon-left\n                    :ui-icon-grid")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Tags</a>\n        </td><td>\n            ");
  stack1 = helpers['if'].call(depth0, "isWindows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(42, program42, data),fn:self.program(40, program40, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </td><td>\n            <a id=\"single-machine-power-btn\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("id::ui-state-disabled\n                    :ui-btn\n                    :ui-btn-icon-left\n                    :ui-icon-bars")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Actions</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <ul id=\"machine-keys\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineKeysListItem", {hash:{
    'keyBinding': ("this")
  },hashTypes:{'keyBinding': "STRING"},hashContexts:{'keyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.disassociatingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <li data-icon=\"false\">\n            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "nonAssociatedKeyClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n        </li>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-keys-panel\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\"\n    data-theme=\"c\">\n\n    <div data-role=\"header\">\n        <h1>Manage Keys</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"c\">\n\n        <a id=\"associate-btn\"\n            class=\"ui-btn ui-btn-d ui-btn-icon-right ui-icon-plus ui-corner-all\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "associateClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add Key</a>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machineKeysController.associatedKeys", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.keysController.associatingKey", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a class=\"ui-btn ui-btn-a ui-corner-all\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n\n    </div>\n\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "keyAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n<div id=\"key-actions-popup\"\n    class=\"tiny-popup\"\n    data-role=\"popup\"\n    data-overlay-theme=\"b\"\n    data-transition=\"flip\"\n    data-position-to=\"#machine-keys\"\n    data-theme=\"a\">\n    <ul data-role=\"listview\">\n        <li data-icon=\"false\"><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Remove</a></li>\n        <li data-icon=\"false\"><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "probeClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Probe</a></li>\n        <li data-icon=\"false\"><a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "viewClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">View</a></li>\n    </ul>\n</div>\n\n<div id=\"non-associated-keys-popup\"\n    class=\"tiny-popup\"\n    data-role=\"popup\"\n    data-overlay-theme=\"b\"\n    data-transition=\"flip\"\n    data-position-to=\"#associate-btn\">\n\n    <ul data-role=\"listview\">\n        ");
  stack1 = helpers.each.call(depth0, "Mist.machineKeysController.nonAssociatedKeys", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <li data-icon=\"false\" data-theme=\"d\">\n            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newKeyClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">New key</a>\n        </li>\n    </ul>\n</div>\n\n<div id=\"machine-userPort-popup\"\n    class=\"large-popup\"\n    data-role=\"popup\"\n    data-theme=\"c\"\n    data-overlay-theme=\"b\"\n    data-position-to=\"#machine-keys-panel\"\n    data-transition=\"flip\">\n\n    <div data-role=\"header\">\n        <h2>SSH user &amp; port</h2>\n    </div>\n\n    <div data-role=\"content\">\n        <div class=\"message\">\n            Cannot connect as root on port 22\n        </div>\n        <label for=\"user\">User:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("user"),
    'data-theme': ("a"),
    'placeholder': ("root"),
    'valueBinding': ("Mist.machineKeysController.user")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <label for=\"port\">Port:</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("port"),
    'data-theme': ("a"),
    'placeholder': ("22"),
    'valueBinding': ("Mist.machineKeysController.port")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeSSH_Details", {hash:{
    'target': ("Mist.machineKeysController")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Cancel\n            </a>\n            <a id=\"tryAssociate\" class=\"ui-btn ui-btn-d\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customAssociateClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Retry</a>\n        </div>\n\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_keys_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<span class=\"small-list-item\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "associatedKeyClicked", "", {hash:{
    'on': ("click"),
    'target': ("view")
  },hashTypes:{'on': "STRING",'target': "STRING"},hashContexts:{'on': depth0,'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n\n    <p ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.keyIcon")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n\n</span>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers.each.call(depth0, "machines.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineListItem", {hash:{
    'machineBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'machineBinding': "STRING",'class': "STRING"},hashContexts:{'machineBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                    ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "title", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </a>\n                    </li>\n                ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a id=\"single-machine-shell-btn\"\n                    target=\"_blank\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("view.selectedMachine.rdpURL"),
    'class': ("view.selectedMachine.canConnect::ui-state-disabled\n                        :ui-btn\n                        :ui-btn-icon-left\n                        :ui-icon-gear")
  },hashTypes:{'href': "STRING",'class': "STRING"},hashContexts:{'href': depth0,'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Connect</a>\n            ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a id=\"machines-shell-btn\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.selectedMachine.canConnect::ui-state-disabled\n                    :ui-btn\n                    :ui-btn-icon-left\n                    :ui-icon-gear")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "shellClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Shell</a>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-list-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button ui-btn-left ui-btn ui-icon-home\n            ui-btn-icon-left ui-shadow ui-corner-all\">Home</a>\n\n        <h1>Machines</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <a id=\"create-machine-btn\"\n           class=\"responsive-button ui-btn ui-btn-d ui-icon-plus\n                ui-btn-icon-right ui-shadow ui-corner-all\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Create</a>\n\n        <a id=\"select-machines-btn\"\n           class=\"responsive-button\"\n           data-role=\"button\"\n           data-icon=\"arrow-d\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Select</a>\n\n        <ul id=\"machines\"\n            data-role=\"listview\"\n            data-inset=\"true\"\n            data-filter=\"true\"\n            data-filter-placeholder=\"Filter...\"\n            data-theme=\"c\"\n            class=\"checkbox-list\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineTags", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineShell", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machinePower", {hash:{
    'position': ("#machines-power-btn")
  },hashTypes:{'position': "STRING"},hashContexts:{'position': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div id=\"select-machines-popup\" data-role=\"popup\" data-overlay-theme=\"b\" data-transition=\"flip\" data-position-to=\"#select-machines-btn\">\n        <ul data-role=\"listview\">\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "all", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">All</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", "none", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">None</a>\n            </li>\n            ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n\n    <div class=\"tri-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <table><tbody><tr><td>\n            <a id=\"machines-tags-btn\" class=\"ui-btn ui-icon-grid ui-btn-icon-left ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tagsClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Tags</a>\n        </td><td>\n            ");
  stack1 = helpers['if'].call(depth0, "view.selectedMachine.isWindows", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        </td><td>\n            <a id=\"machines-power-btn\" data-role=\"button\" data-icon=\"bars\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "powerClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Actions</a>\n        </td></tr></tbody></table>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    <label>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.machine.selected")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</label>\n    ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'classBinding': ("view.monitoringIcon")
  },hashTypes:{'classBinding': "STRING"},hashContexts:{'classBinding': depth0},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "machine", "view.machine", options) : helperMissing.call(depth0, "link-to", "machine", "view.machine", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n        <div class=\"ui-grid-b\">\n            <div class=\"ui-block-a machine-name\">");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n\n            <span class=\"ui-block-b machine-state\">\n                ");
  stack1 = helpers.unless.call(depth0, "view.machine.isUnknown", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </span>\n\n            <div class=\"ui-block-c machine-leds\">\n                <span>\n                    ");
  stack1 = helpers['if'].call(depth0, "view.machine.hasMonitoring", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </span>\n                ");
  stack1 = helpers.unless.call(depth0, "pendingCreation", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            </div>\n\n            <div class=\"ui-block-c machine-tags\">\n                <span class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.backend.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                ");
  stack1 = helpers.each.call(depth0, "view.machine.tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n\n        </div>\n    ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.machine.state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "pendingCreation", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </span>\n                ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("\n                    <div class='ajax-loader'></div>\n                ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "waitState", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program8(depth0,data) {
  
  
  data.buffer.push("\n                        <span></span>\n                    ");
  }

function program10(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("probing probed")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                        <div class=\"loadleds\">\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg15 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg5 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("loadavg1 :led")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                        </div>\n                        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":netleds")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled4 :netled1")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled3 :netled2")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled2 :netled3")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("netled1 :netled4")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                            </div>\n                        </div>\n\n                    </div>\n                ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <span class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    <a class=\"ui-icon-delete\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disassociateGhostMachine", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(">\n\n        <div class=\"ui-grid-b\">\n            <div class=\"ui-block-a machine-name\">");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n\n            <span class=\"ui-block-b machine-state\">\n                <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.machine.state")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "view.machine.state", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </span>\n            </span>\n\n        </div>\n\n    </a>\n\n");
  return buffer;
  }

  stack1 = helpers.unless.call(depth0, "view.machine.isGhost", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_monitoring"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "view.pendingFirstStats", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div id=\"graphs-wrapper\"\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.pendingFirstStats:hidden")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graphList", {hash:{
    'actionProxyBinding': ("view")
  },hashTypes:{'actionProxyBinding': "STRING"},hashContexts:{'actionProxyBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        </div>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ruleList", {hash:{
    'rulesBinding': ("view.rules")
  },hashTypes:{'rulesBinding': "STRING"},hashContexts:{'rulesBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n        <div id=\"monitoring-bottom-btns\">\n            <div data-rule=\"ui-grid-a\">\n                <div class=\"ui-block-a\">\n                    <a id=\"add-rule-button\"\n                      ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("\n                            Mist.rulesController.creatingPending:ui-state-disabled\n                            :ui-btn\n                            :ui-corner-all\n                            :ui-btn-d\n                            :ui-btn-icon-left\n                            :ui-icon-plus")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addRuleClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                            Add Rule\n                    </a>\n                </div>\n            </div>\n            <div class=\"ui-block-b\">\n                <a id=\"disable-monitor-btn\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("\n                        view.machine.disablingMonitoring:ui-state-disabled\n                        :ui-btn\n                        :ui-corner-all\n                        :ui-btn-b\n                        :ui-btn-icon-left\n                        :ui-icon-delete")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "disableMonitoringClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Disable\n                </a>\n            </div>\n        </div>\n\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div id=\"machine-monitoring-disabled\">\n\n                <label id=\"enable-monitoring-label\">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "view.monitoringMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </label>\n\n                <div class=\"ajax-loader l\"></div>\n            </div>\n        ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n        <div id=\"machine-monitoring-disabled\">\n\n            ");
  stack1 = helpers['if'].call(depth0, "view.machine.enablingMonitoring", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n       </div>\n    ");
  return buffer;
  }
function program5(depth0,data) {
  
  
  data.buffer.push("\n\n                <label id=\"enable-monitoring-label\">\n                    Enabling monitoring, please wait...\n                </label>\n\n                <div class=\"ajax-loader l\"></div>\n\n            ");
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "view.machine.disablingMonitoring", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }
function program8(depth0,data) {
  
  
  data.buffer.push("\n\n                <label id=\"enable-monitoring-label\">\n                    Disabling monitoring...\n                </label>\n\n                <div class=\"ajax-loader l\"></div>\n\n            ");
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n                <label id=\"enable-monitoring-label\">\n                    View real time server analytics, get alerts\n                    and set up automated actions.\n                </label>\n\n                <a id=\"enable-monitoring-btn\"\n                    ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("\n                        view.machine.enablingMonitoring:ui-state-disabled\n                        view.gettingCommand:ui-state-disabled\n                        :ui-btn\n                        :ui-corner-all\n                        :ui-btn-d\n                        :ui-btn-icon-left\n                        :ui-icon-star")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enableMonitoringClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Enable Monitoring\n                </a>\n\n               ");
  stack1 = helpers['if'].call(depth0, "view.gettingCommand", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n           ");
  return buffer;
  }
function program11(depth0,data) {
  
  
  data.buffer.push("\n                    <div class=\"ajax-loader\"></div>\n               ");
  }

  data.buffer.push("<div id=\"machine-monitoring\">\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.machine.hasMonitoring", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ruleEdit", {hash:{
    'metricsBinding': ("this.metrics")
  },hashTypes:{'metricsBinding': "STRING"},hashContexts:{'metricsBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_power"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a id=\"rename-machine-option\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "rename", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Rename</a>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a id=\"start-machine-option\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "start", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Start</a>\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a id=\"shutdown-machine-option\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "shutdown", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Shutdown</a>\n        ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a id=\"reboot-machine-option\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "reboot", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Reboot</a>\n        ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a id=\"destroy-machine-option\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "destroy", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Destroy</a>\n        ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-power-popup\"\n     class=\"tiny-popup\"\n     data-role=\"popup\"\n     data-overlay-theme=\"c\"\n     data-transition=\"slideup\"\n     ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'data-position-to': ("view.position")
  },hashTypes:{'data-position-to': "STRING"},hashContexts:{'data-position-to': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Actions</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canRename", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canStart", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canShutdown", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canReboot", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machinePowerController.canDestroy", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <a class=\"ui-btn ui-shadow ui-corner-all\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n    </div>\n</div>\n\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_shell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"machine-shell\"\n     data-role=\"popup\"\n     data-theme=\"b\"\n     data-dismissible=\"false\"\n     data-overlay-theme=\"b\"\n     data-transition=\"slideup\">\n\n    <div data-role=\"content\" data-theme=\"b\">\n        <div id=\"shell-return\"></div>\n        <a id=\"shell-back\" class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "machineTagsListItem", {hash:{
    'tagBinding': ("this")
  },hashTypes:{'tagBinding': "STRING"},hashContexts:{'tagBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.deletingTag", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

  data.buffer.push("<div id=\"machine-tags-popup\"\n     class=\"large-popup\"\n     data-role=\"popup\"\n     data-overlay-theme=\"b\"\n     data-transition=\"flip\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Manage Tags</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'valueBinding': ("Mist.machineTagsController.newTag")
  },hashTypes:{'valueBinding': "STRING"},hashContexts:{'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <a id=\"add-tag-ok\" class=\"ui-btn ui-btn-d ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add</a>\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.machineTagsController.machine.tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.machineTagsController.addingTag", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a id=\"add-tag-back\" class=\"ui-btn ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["machine_tags_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<span class=\"small-list-item\">\n\n    <p>");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n\n    <button class=\"ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></button>\n\n</span>\n");
  return buffer;
  
});
Ember.TEMPLATES["messagebox"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <p>");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <p id=\"message-cmd\">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.notificationController.messageBox.options.command", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </p>\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <p id=\"message-ps\">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.notificationController.messageBox.options.ps", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </p>\n            ");
  return buffer;
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"message-box-screen\"\n    class=\"ui-popup-screen ui-overlay-b ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n\n<div id=\"message-box-popup\"\n    class=\"flip\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"message-box\"\n        class=\"large-popup\n            ui-popup\n            ui-body-inherit\n            ui-overlay-shadow\n            ui-corner-all\"\n        data-role=\"popup\"\n        data-transition=\"flip\"\n        data-dismissible=\"false\">\n\n\n        <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\" role=\"banner\">\n            <h1 class=\"ui-title\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.notificationController.messageBox.options.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </h1>\n        </div>\n\n        <!-- Body -->\n\n        <div class=\"ui-content ui-body-a\" role=\"main\">\n\n\n            <!--\n                Paragraphs\n            -->\n\n\n            ");
  stack1 = helpers.each.call(depth0, "Mist.notificationController.messageBox.options.paragraphs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n            <!--\n                Command\n            -->\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.notificationController.messageBox.options.command", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n            <!--\n                Postscript\n            -->\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.notificationController.messageBox.options.ps", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n            <!--\n                OK Button\n            -->\n\n\n            <a class=\"ui-btn ui-btn-a ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "okClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">OK</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add_custom"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("\n<div id=\"metric-add-custom-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div>\n<div id=\"metric-add-custom-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-corner-all\">\n\n    <div id=\"metric-add-custom\"\n         class=\"ui-popup ui-corner-all ui-overlay-shadow\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\"\n         data-position-to=\"#add-metric-btn\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Add custom metric</h1>\n        </div>\n        <div class=\"ui-content\">\n\n            <div class=\"ui-grid-a\">\n                <div class=\"ui-block-a\">\n                    <label for=\"custom-plugin-name\">Name:</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-name"),
    'placeholder': ("e.g. my metric"),
    'valueBinding': ("Mist.metricAddCustomController.metric.name")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n                <div class=\"ui-block-b\">\n                    <label for=\"custom-plugin-unit\">Unit:</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("custom-plugin-unit"),
    'placeholder': ("e.g. bytes (optional)"),
    'valueBinding': ("Mist.metricAddCustomController.metric.unit")
  },hashTypes:{'id': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n            </div>\n            <label for=\"custom-plugin-script\">Python script:</label>\n            <pre id=\"custom-plugin-error\"></pre>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'id': ("custom-plugin-script"),
    'valueBinding': ("Mist.metricAddCustomController.metric.script")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <select id=\"advanced-toggle\" data-role=\"slider\" data-theme=\"a\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "advancedToggled", {hash:{
    'target': ("view"),
    'on': ("change")
  },hashTypes:{'target': "STRING",'on': "STRING"},hashContexts:{'target': depth0,'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                <option value=\"0\">Basic settings</option>\n                <option value=\"1\">Advanced settings</option>\n            </select>\n\n            <div id=\"custom-plugin-advanced\">\n                <label>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-mini': ("true"),
    'checkedBinding': ("Mist.metricAddCustomController.metric.type")
  },hashTypes:{'data-mini': "STRING",'checkedBinding': "STRING"},hashContexts:{'data-mini': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                Calculate derivative\n                </label>\n            </div>\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.metricAddCustomController.addingMetric", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n                <a class=\"ui-btn ui-corner-all\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n                <a class=\"ui-btn ui-corner-all ui-btn-d ui-state-disabled\"\n                    id=\"deploy\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deployClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Deploy</a>\n            </div>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_add"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "metricNode", {hash:{
    'nodeBinding': ("Mist.metricAddController.metricsTree")
  },hashTypes:{'nodeBinding': "STRING"},hashContexts:{'nodeBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ui-body-a\">\n                    <p>Checking available metrics on your server</p>\n                    <div class=\"ajax-loader\"></div>\n                </div>\n            ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                <div id=\"overlay\"></div>\n            ");
  }

  data.buffer.push("<div id=\"metric-add-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-a\"></div>\n<div id=\"metric-add-popup\"\n     class=\"ui-popup-container mid-popup ui-popup-hidden ui-body-inherit ui-corner-all\">\n\n    <div id=\"metric-add\"\n         class=\"ui-popup ui-corner-all ui-overlay-shadow\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\"\n         data-position-to=\"#add-metric-btn\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Select Metric</h1>\n        </div>\n\n        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("\n                Mist.metricAddController.metrics.length::no-metrics\n                :ui-content\n                :ui-body-a")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n            role=\"main\">\n\n            <a class=\"ui-btn ui-btn-d ui-corner-all ui-btn-icon-left ui-icon-plus\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "customClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">custom</a>\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.metricAddController.metrics.length", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.metricsController.addingMetric", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        </div>\n    </div>\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "metricAddCustom", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["metric_node"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    <a class=\"end-node\n        ui-btn\n        ui-corner-all\"\n        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectMetric", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "view.node.text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    ");
  stack1 = helpers.unless.call(depth0, "view.node.isRootNode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <div class=\"nest\">\n        ");
  stack1 = helpers.each.call(depth0, "view.node.subTargets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <a class=\"parent-node\n            ui-btn\n            ui-corner-all\n            ui-btn-icon-left\n            ui-icon-carat-d\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleUnfold", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "view.node.text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "metricNode", {hash:{
    'nodeBinding': ("this")
  },hashTypes:{'nodeBinding': "STRING"},hashContexts:{'nodeBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "view.node.isEndNode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["missing"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div id=\"missing-page\" data-role=\"page\" class=\"ui-page-active ui-page ui-page-theme-a\">\n    <div id=\"splash\">\n        <div id=\"container\">\n            <a id=\"logo\" href=\"/#\"></a>\n            <div id=\"message\">\n                404. Got lost in the clouds\n            </div>\n        </div>\n    </div>\n</div>\n");
  
});
Ember.TEMPLATES["network_create"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "backend", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "backend.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                            Select backend\n                        ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            ");
  stack1 = helpers['if'].call(depth0, "isOpenStack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                <li data-icon=\"false\">\n                                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backendSelected", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                        ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                    </a>\n                                </li>\n                            ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"network-create\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n        <h1>Create Network</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <!--\n            Select Backend\n\n            Allow only openstack backends for now\n        -->\n        <div id=\"network-create-backend-wrapper\">\n\n            <label for=\"network-create-backend\">Backend:</label>\n\n            <div id=\"network-create-backend\"\n                data-role=\"collapsible\"\n                data-iconpos=\"right\"\n                data-collapsed-icon=\"arrow-d\"\n                data-expanded-icon=\"arrow-u\"\n                data-theme=\"a\"\n                class=\"mist-select\">\n\n                <h4>\n                    ");
  stack1 = helpers['with'].call(depth0, "Mist.networkCreateController.network", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </h4>\n\n                <ul data-role=\"listview\" data-theme=\"a\">\n\n                    ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                </ul> <!-- list -->\n            </div> <!-- collapsible -->\n        </div><!-- wrapper -->\n\n\n        <!--\n            Select Network Name\n        -->\n        <div id=\"network-create-name-wrapper\">\n\n            <label for=\"network-create-name\">Network Name:</label>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-name"),
    'valueBinding': ("Mist.networkCreateController.network.name")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n\n        <!--\n            Select Admin State\n        -->\n\n\n        <div id=\"network-create-admin-state-wrapper\">\n            <label>Admin State:</label>\n            <div id=\"network-create-admin-state\"\n                data-role=\"collapsible\"\n                data-iconpos=\"right\"\n                data-collapsed-icon=\"arrow-d\"\n                data-expanded-icon=\"arrow-u\"\n                data-theme=\"a\"\n                class=\"mist-select\">\n\n                <h4>\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.networkCreateController.adminStateUpToText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </h4>\n\n                <ul data-role=\"listview\" data-theme=\"a\">\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "adminStateSelected", true, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">\n                            UP\n                        </a>\n                    </li>\n                    <li data-icon=\"false\">\n                        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "adminStateSelected", false, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">\n                            DOWN\n                        </a>\n                    </li>\n                </ul> <!-- list -->\n            </div><!-- collapsible -->\n        </div><!-- wrapper -->\n\n\n        <!--\n            Create Subnet\n        -->\n\n\n        <div id=\"network-create-subnet-wrapper\">\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-create"),
    'checkedBinding': ("Mist.networkCreateController.network.createSubnet")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'checkedBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            <label for=\"network-create-subnet-create\">\n                Create Subnet\n            </label>\n\n\n            <div id=\"network-create-subnet-form\">\n\n\n                <!--\n                    Select Subnet Name\n                -->\n                <div id=\"network-create-subnet-name-wrapper\">\n                    <label for=\"network-create-subnet-name\">Subnet Name:</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-name"),
    'valueBinding': ("Mist.networkCreateController.network.subnet.name")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n\n\n                <!--\n                    Select Network Address\n                -->\n                <div id=\"network-create-subnet-address-wrapper\">\n                    <label for=\"network-create-subnet-address\">Network Address (CIDR):</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-address"),
    'valueBinding': ("Mist.networkCreateController.network.subnet.address")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n\n\n                <div id=\"network-create-subnet-other-wrapper\">\n                    <!--\n                        Select IP Version\n                    -->\n                    <div id=\"network-create-subnet-ipv-wrapper\">\n                        <label>IP Version:</label>\n                        <div id=\"network-create-subnet-ipv\"\n                            data-role=\"collapsible\"\n                            data-iconpos=\"right\"\n                            data-collapsed-icon=\"arrow-d\"\n                            data-expanded-icon=\"arrow-u\"\n                            data-theme=\"a\"\n                            class=\"mist-select\">\n\n                            <h4>\n                                ");
  stack1 = helpers._triageMustache.call(depth0, "Mist.networkCreateController.network.subnet.ipv", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                            </h4>\n\n                            <ul data-role=\"listview\" data-theme=\"a\">\n                                <li data-icon=\"false\">\n                                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "ipvSelected", "IPv4", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n                                        IPv4\n                                    </a>\n                                </li>\n                                <li data-icon=\"false\">\n                                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "ipvSelected", "IPv6", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n                                        IPv6\n                                    </a>\n                                </li>\n                            </ul> <!-- list -->\n                        </div><!-- collapsible -->\n                    </div><!-- wrapper -->\n\n\n                    <!--\n                        Enable Gateway\n                    -->\n                    <div>\n                        <div id=\"network-create-subnet-gateway-ip-wrapper\">\n                            <label for=\"network-create-subnet-gateway-ip\">Gateway IP:</label>\n                            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-gateway-ip"),
    'valueBinding': ("Mist.networkCreateController.network.subnet.gatewayIP")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                        </div>\n                        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-gateway"),
    'checkedBinding': ("Mist.networkCreateController.network.subnet.disableGateway")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'checkedBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                        <label for=\"network-create-subnet-gateway\">\n                            Disable Gateway\n                        </label>\n                    </div>\n\n\n                    <!--\n                        Enable DHCP\n                    -->\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'data-theme': ("a"),
    'id': ("network-create-subnet-dhcp"),
    'checkedBinding': ("Mist.networkCreateController.network.subnet.enableDHCP")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'checkedBinding': "STRING"},hashContexts:{'data-theme': depth0,'id': depth0,'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    <label for=\"network-create-subnet-dhcp\">\n                        Enable DHCP\n                    </label>\n\n\n                    <!--\n                        Allocation Pools\n                    -->\n                    <label for=\"network-create-subnet-allocation-pools\">\n                        Allocation Pools:\n                    </label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'id': ("network-create-subnet-allocation-pools"),
    'data-theme': ("a"),
    'valueBinding': ("Mist.networkCreateController.network.subnet.allocationPools")
  },hashTypes:{'id': "STRING",'data-theme': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n            </div>\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.networkCreateController.creatingNetwork", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a\"\n               ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a class=\"ui-btn ui-btn-d\" id=\"network-create-ok\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Create</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["network"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <tr>\n                    <td>Status</td>\n                    <td>");
  stack1 = helpers._triageMustache.call(depth0, "status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                </tr>\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div id=\"single-network-subnets\" data-role=\"collapsible\" data-collapsed=\"false\">\n            <h4>Subnets (");
  stack1 = helpers._triageMustache.call(depth0, "subnets.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")</h4>\n\n            ");
  stack1 = helpers.each.call(depth0, "subnets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "subnetListItem", {hash:{
    'model': ("")
  },hashTypes:{'model': "ID"},hashContexts:{'model': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "assignMachine", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </a>\n            </li>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    <div class=\"single-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <a class=\"ui-btn ui-corner-all ui-btn-icon-right ui-icon-delete\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Delete\n        </a>\n    </div>\n    ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-network-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#/networks\" class=\"responsive-button ui-btn-left ui-btn ui-icon-arrow-l\n            ui-btn-icon-left ui-shadow ui-corner-all\">Networks</a>\n\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <div id=\"single-network-info\" data-role=\"collapsible\" data-collapsed=\"false\">\n\n            <h4>Network Information</h4>\n\n            <table class=\"info-table\">\n                <tbody>\n                <tr>\n                    <td>Name</td>\n                    <td>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                </tr>\n                <tr>\n                    <td>Id</td>\n                    <td>");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                </tr>\n                ");
  stack1 = helpers['if'].call(depth0, "status", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </tbody>\n            </table>\n\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "subnets", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    <div id=\"assign-machine\"\n        class=\"tiny-popup\"\n        data-role=\"popup\"\n        data-overlay-theme=\"b\"\n        data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "view.network.backend.machines.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  stack1 = helpers['if'].call(depth0, "backend.isOpenStack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["network_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                  ");
  stack1 = helpers.each.call(depth0, "networks", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "networkListItem", {hash:{
    'networkBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'networkBinding': "STRING",'class': "STRING"},hashContexts:{'networkBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                  ");
  return buffer;
  }

  data.buffer.push("<div id=\"network-list-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\"\n        class=\"responsive-button ui-btn-left ui-btn ui-icon-home\n            ui-btn-icon-left ui-shadow ui-corner-all\">Home</a>\n\n        <h1>Networks</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n        <a id=\"network-create-btn\"\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("Mist.backendsController.hasOpenStack::ui-disabled\n                :responsive-button\n                :ui-btn :ui-btn-d\n                :ui-icon-plus\n                :ui-btn-icon-right\n                :ui-corner-all\n                :ui-shadow")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Create</a>\n        <ul id=\"networks\"\n            data-role=\"listview\"\n            data-inset=\"true\"\n            data-filter=\"true\"\n            data-filter-placeholder=\"Filter...\"\n            data-theme=\"c\"\n            class=\"checkbox-list\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <div class=\"mid-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "networkCreate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div class=\"single-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <a class=\"ui-btn ui-corner-all ui-btn-icon-right ui-icon-delete\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Delete\n        </a>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["network_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.network.selected")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("view.network.selected"),
    'data-disabled': ("true")
  },hashTypes:{'checkedBinding': "STRING",'data-disabled': "STRING"},hashContexts:{'checkedBinding': depth0,'data-disabled': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n    <div class=\"ui-grid-b\">\n        <div class=\"ui-block-a network-name\">");
  stack1 = helpers._triageMustache.call(depth0, "view.network.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        <div class=\"ui-block-b\">");
  stack1 = helpers._triageMustache.call(depth0, "view.network.status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        <div class=\"ui-block-c key-tags\">\n            <span class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "view.network.backend.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        </div>\n    </div>\n\n");
  return buffer;
  }

  data.buffer.push("<label>\n    ");
  stack1 = helpers['if'].call(depth0, "view.network.backend.isOpenStack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</label>\n");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "network", "view.network", options) : helperMissing.call(depth0, "link-to", "network", "view.network", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["rule_edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <li data-icon=\"false\">\n                <a class=\"ui-btn\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "metricClicked", "id", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </a>\n            </li>\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "operatorClicked", "title", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "symbol", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <li data-icon=\"false\">\n                    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "aggregateClicked", "value", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </a>\n                </li>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"rule-metric-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-metric-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-metric\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "view.sortedMetrics", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-operator-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-operator-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-operator\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.rulesController.operatorList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-action-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-action-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-action\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.rulesController.actionList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <li class=\"ui-state-disabled\" data-icon=\"false\">\n                <a>launch</a>\n            </li>\n        </ul>\n    </div>\n</div>\n\n\n<div id=\"rule-command-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-command-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow ui-corner-all large-popup\">\n\n    <div id=\"rule-command\"\n         class=\"ui-popup ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <div class=\"ui-header ui-bar-b\">\n            <h1 class=\"ui-title\">Command</h1>\n        </div>\n\n        <div data-role=\"content\">\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'valueBinding': ("view.newCommand"),
    'name': ("rule-command-content")
  },hashTypes:{'valueBinding': "STRING",'name': "STRING"},hashContexts:{'valueBinding': depth0,'name': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <div data-role=\"controlgroup\" class=\"btn-full ok-cancel\" data-type=\"horizontal\">\n                <a class=\"ui-btn ui-btn-a\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n                <a class=\"ui-btn ui-btn-d\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</a>\n            </div>\n        </div>\n    </div>\n</div>\n\n\n<div id=\"rule-aggregate-screen\" class=\"ui-popup-screen ui-screen-hidden ui-overlay-b\"></div>\n<div id=\"rule-aggregate-popup\"\n     class=\"ui-popup-container ui-popup-hidden ui-body-inherit ui-overlay-shadow\">\n\n    <div id=\"rule-aggregate\"\n         class=\"ui-popup\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n        <ul data-role=\"listview\">\n            ");
  stack1 = helpers.each.call(depth0, "Mist.rulesController.aggregateList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["rule"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n\n            <div class=\"rule-within rule-text\">within</div>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'class': ("rule-time-window"),
    'type': ("number"),
    'valueBinding': ("view.newRuleTimeWindow")
  },hashTypes:{'class': "STRING",'type': "STRING",'valueBinding': "STRING"},hashContexts:{'class': depth0,'type': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            <div class=\"rule-mins rule-text\">min(s)</div>\n\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n    ");
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <div class=\"delete-rule-container\">\n            <a class=\"delete-rule-button ui-btn ui-btn-icon-notext ui-icon-delete ui-corner-all\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteRuleClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(">&nbsp;</a>\n        </div>\n    ");
  return buffer;
  }

  data.buffer.push("<div id=\"");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\" class=\"rule-box\">\n\n    <div id=\"basic-condition\">\n        <div class=\"rule-if rule-text\">if</div>\n\n        <a class=\"rule-button rule-metric ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openMetricPopup", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "metric.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </a>\n\n        <a class=\"rule-button rule-operator ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openOperatorPopup", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "operator.symbol", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </a>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'class': ("rule-value"),
    'type': ("number"),
    'valueBinding': ("view.newRuleValue")
  },hashTypes:{'class': "STRING",'type': "STRING",'valueBinding': "STRING"},hashContexts:{'class': depth0,'type': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n        <div class=\"rule-unit rule-text\">");
  stack1 = helpers._triageMustache.call(depth0, "metric.unit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n    </div>\n\n    <a class=\"rule-button rule-more ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openAdvancedCondition", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        ...\n    </a>\n\n    <div class=\"advanced-condition\">\n\n        <div class=\"rule-for rule-text\">for</div>\n\n        <a class=\"rule-button rule-aggregate ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openAggregatePopup", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "aggregate.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </a>\n\n        <div class=\"rule-for rule-text\">value</div>\n\n        ");
  stack1 = helpers.unless.call(depth0, "view.aggregateIsAny", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </div>\n\n    <div class=\"rule-then rule-text\">then</div>\n\n    <a class=\"rule-button rule-action ui-btn ui-btn-inline ui-shadow ui-corner-all\"\n        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openActionPopup", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers._triageMustache.call(depth0, "actionToTake", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </a>\n\n    ");
  stack1 = helpers['if'].call(depth0, "pendingAction", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["rule_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "rule", {hash:{
    'model': ("")
  },hashTypes:{'model': "ID"},hashContexts:{'model': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"rule-box\" id=\"creation-rule\">\n            <div class=\"ajax-loader\"></div>\n        </div>\n    ");
  }

  data.buffer.push("<div class=\"rules-container\" data-role=\"listview\">\n\n    ");
  stack1 = helpers.each.call(depth0, "view.rules", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    ");
  stack1 = helpers['if'].call(depth0, "Mist.rulesController.creationPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script_add"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                ");
  stack1 = helpers['if'].call(depth0, "type", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "type.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                                    Select\n                                ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <li data-icon=\"false\" data-theme=\"a\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectType", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                            </li>\n                        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                ");
  stack1 = helpers['if'].call(depth0, "source", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "source.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <li data-icon=\"false\" data-theme=\"a\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectSource", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                            </li>\n                        ");
  return buffer;
  }

function program13(depth0,data) {
  
  
  data.buffer.push("\n                ");
  }

function program15(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"script-add\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\"\n    data-theme=\"c\">\n\n    <div data-role=\"header\">\n        <h1>Add script</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <div class=\"form-field\">\n            <label for=\"script-name\">Name:</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("script-name"),
    'valueBinding': ("Mist.scriptAddController.newScript.name")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n        <!--\n            Select script type\n        -->\n\n        <div id=\"script-add-type\" class=\"form-field\">\n            <label >Type:</label>\n            <div class=\"mist-select\"\n                data-role=\"collapsible\"\n                data-iconpos=\"right\"\n                data-collapsed-icon=\"carat-d\"\n                data-expanded-icon=\"carat-u\"\n                data-theme=\"a\">\n                    <h4>\n                        ");
  stack1 = helpers['with'].call(depth0, "Mist.scriptAddController.newScript.type", "as", "type", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </h4>\n                    <ul data-role=\"listview\">\n                        ");
  stack1 = helpers.each.call(depth0, "view.scriptTypes", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </ul>\n            </div>\n        </div>\n\n        <!--\n            Select script source\n        -->\n\n        <div id=\"script-add-source\" class=\"form-field\">\n            <label>Source:</label>\n            <div  class=\"mist-select\"\n                data-role=\"collapsible\"\n                data-iconpos=\"right\"\n                data-collapsed-icon=\"carat-d\"\n                data-expanded-icon=\"carat-u\"\n                data-theme=\"a\">\n                    <h4>\n                        ");
  stack1 = helpers['with'].call(depth0, "Mist.scriptAddController.newScript.source", "as", "source", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </h4>\n                    <ul data-role=\"listview\">\n                        ");
  stack1 = helpers.each.call(depth0, "view.scriptSources", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </ul>\n            </div>\n        </div>\n\n        <div class=\"github source\">\n            <div class=\"form-field\">\n                <label for=\"github-script-url\">Github Repo:</label>\n                ");
  stack1 = helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("github-script-url"),
    'valueBinding': ("Mist.scriptAddController.newScript.url")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n\n            <div class=\"form-field\">\n                <label for=\"github-script-entry-point\">Entry point (optional):</label>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("github-script-entry-point"),
    'valueBinding': ("Mist.scriptAddController.newScript.entryPoint")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n        </div>\n\n        <div class=\"url source\">\n            <div class=\"form-field\">\n                <label for=\"url-script-url\">Url:</label>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("url-script-url"),
    'valueBinding': ("Mist.scriptAddController.newScript.url")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n\n            <div class=\"form-field\">\n                <label for=\"url-script-entry-point\">Entry point (optional):</label>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'data-theme': ("a"),
    'id': ("url-script-entry-point"),
    'valueBinding': ("Mist.scriptAddController.newScript.entryPoint")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n        </div>\n\n        <div class=\"inline source\">\n            <div class=\"form-field\">\n                <label for=\"url-script-script\">Script:</label>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'data-theme': ("a"),
    'id': ("url-script-script"),
    'valueBinding': ("Mist.scriptAddController.newScript.script")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </div>\n        </div>\n\n        <!--\n            Description\n        -->\n\n        <div id=\"script-add-description\" class=\"form-field\">\n          <label>Description (optional):</label>\n          ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'data-theme': ("a"),
    'valueBinding': ("Mist.scriptAddController.newScript.description")
  },hashTypes:{'data-theme': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.scriptsController.addingScript", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\" \n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"new-script-ok\" data-theme=\"d\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isReady::ui-state-disabled :ui-btn :ui-btn-d")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script_edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <div class=\"ajax-loader\"></div>\n            ");
  }

  data.buffer.push("<!-- Popup Overlay -->\n\n<div id=\"script-edit-screen\"\n    class=\"ui-popup-screen\n        ui-overlay-b\n        ui-screen-hidden\">\n</div>\n\n<!-- Popup Wrapper -->\n<div id=\"script-edit-popup\"\n     class=\"pop\n        ui-popup-container\n        ui-popup-hidden\n        ui-popup-truncate\">\n\n    <!-- Popup -->\n\n    <div id=\"script-edit\"\n         class=\"mid-popup\n            ui-popup\n            ui-body-a\n            ui-overlay-shadow\n            ui-corner-all\"\n         data-role=\"popup\"\n         data-enhanced=\"true\"\n         data-transition=\"flip\">\n\n         <!-- Header -->\n\n        <div class=\"ui-header ui-bar-b\">\n\n            <h1 class=\"ui-title\">Rename script</h1>\n\n        </div>\n\n        <!-- Body -->\n\n        <div role=\"main\" class=\"ui-content\" data-theme=\"a\">\n\n            <!-- New backend name text field -->\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextField", {hash:{
    'id': ("script-edit-new-name"),
    'valueBinding': ("Mist.scriptEditController.newName")
  },hashTypes:{'id': "STRING",'valueBinding': "STRING"},hashContexts:{'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.scriptsController.renamingScript", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\" >\n                    <a class=\"ui-btn ui-btn-a ui-corner-all ui-shadow\"\n                       ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n                    <a id=\"script-edit-ok\"\n                        class=\"ui-btn ui-btn-d ui-corner-all ui-shadow\"\n                        ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</a>\n            </div>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                 <tr>\n                     <td>Description</td>\n                     <td>");
  stack1 = helpers._triageMustache.call(depth0, "description", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                 </tr>\n             ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                   <tr>\n                       <td>Entry Point</td>\n                       <td>");
  stack1 = helpers._triageMustache.call(depth0, "entrypoint", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                   </tr>\n               ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n               <tr>\n                   <td>Script</td>\n                   <td><div class=\"command-container\">");
  stack1 = helpers._triageMustache.call(depth0, "script", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div></td>\n               </tr>\n               ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n               <tr>\n                   <td>Url</td>\n                   <td>");
  stack1 = helpers._triageMustache.call(depth0, "script", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n               </tr>\n               ");
  return buffer;
  }

  data.buffer.push("<div id=\"single-script-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#/scripts\" class=\"responsive-button ui-btn-left ui-btn ui-icon-arrow-l\n            ui-btn-icon-left ui-shadow ui-corner-all\">Scripts</a>\n\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.scriptsController.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <a id=\"run-script-btn\"\n           class=\"responsive-btn ui-btn ui-btn-d ui-btn-icon-right ui-icon-plus ui-corner-all ui-shadow\"\n           ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "runClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Run</a>\n\n       <div data-role=\"collapsible\" data-collapsed=\"false\">\n\n           <h4>Basic Info</h4>\n\n           <table class=\"info-table\">\n           <tbody>\n             ");
  stack1 = helpers['if'].call(depth0, "description", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n               <tr>\n                   <td>Type</td>\n                   <td>");
  stack1 = helpers._triageMustache.call(depth0, "type", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n               </tr>\n               ");
  stack1 = helpers['if'].call(depth0, "entrypoint", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n               ");
  stack1 = helpers['if'].call(depth0, "view.isInline", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n           </tbody>\n           </table>\n       </div>\n\n       <div data-role=\"collapsible\" data-collapsed=\"false\">\n\n           <h4>Logs</h4>\n\n           ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptLogList", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n       </div>\n\n        <div class=\"large-padding\"></div>\n\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptRun", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div class=\"dual-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <div class=\"ui-grid-a\">\n            <div class=\"ui-block-a\">\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-edit\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Rename</a>\n            </div>\n            <div class=\"ui-block-b\">\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-delete\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Delete</a>\n            </div>\n    </div>\n\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptListItem", {hash:{
    'model': ("this"),
    'scriptBinding': ("this"),
    'class': ("checkbox-link")
  },hashTypes:{'model': "STRING",'scriptBinding': "STRING",'class': "STRING"},hashContexts:{'model': depth0,'scriptBinding': depth0,'class': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("<div id=\"script-list-page\" data-role=\"page\" class=\"ui-page-active\">\n\n    <div data-role=\"header\" data-theme=\"b\">\n\n        <a href=\"#\" class=\"responsive-button ui-btn-left ui-btn ui-icon-home\n            ui-btn-icon-left ui-shadow ui-corner-all\">Home</a>\n\n        <h1>Scripts</h1>\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "userMenu", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <div class=\"list-wrapper\">\n\n            <a id=\"select-scripts-btn\"\n               class=\"responsive-btn ui-btn ui-btn-icon-left ui-icon-arrow-d ui-corner-all ui-shadow\"\n               ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Select</a>\n\n            <a id=\"run-script-btn\"\n               class=\"responsive-btn ui-btn ui-btn-d ui-btn-icon-right ui-icon-plus ui-corner-all ui-shadow\"\n               ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Add</a>\n\n            <ul data-role=\"listview\"\n                data-filter=\"true\"\n                data-inset=\"true\"\n                data-filter-placeholder=\"Filter Scripts...\"\n                class=\"checkbox-list\">\n                ");
  stack1 = helpers.each.call(depth0, "Mist.scriptsController", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </ul>\n        </div>\n        <div class=\"mid-padding\"></div>\n    </div>\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "dialog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptAdd", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "scriptEdit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n    <div id=\"select-scripts-popup\" data-role=\"popup\" data-transition=\"flip\" data-position-to=\"#select-scripts-btn\">\n        <ul data-role='listview'>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", true, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">All</a>\n            </li>\n            <li data-icon=\"false\">\n                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectionModeClicked", false, {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","BOOLEAN"],data:data})));
  data.buffer.push(">None</a>\n            </li>\n        </ul>\n    </div>\n\n    <div class=\"dual-action-footer\" data-role=\"footer\" data-theme=\"b\">\n        <div class=\"ui-grid-a\">\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.canRename::ui-state-disabled :ui-block-a")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-edit\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "renameClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Rename</a>\n            </div>\n            <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.canDelete::ui-state-disabled :ui-block-b")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                <a class=\"ui-btn ui-btn-icon-left ui-icon-delete\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Delete</a>\n            </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <div class=\"ui-grid-b\">\n        <div class=\"ui-block-a\">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        <div class=\"ui-block-b\">\n          <span class=\"tag\">");
  stack1 = helpers._triageMustache.call(depth0, "type", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        </div>\n        <div class=\"ui-block-c\"></div>\n    </div>\n");
  return buffer;
  }

  data.buffer.push("<label>");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.Checkbox", {hash:{
    'checkedBinding': ("selected")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</label>\n\n");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "script", "", options) : helperMissing.call(depth0, "link-to", "script", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
Ember.TEMPLATES["script_log_list"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"ajax-loader\"></div>\n    ");
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "logListItem", {hash:{
    'logBinding': ("this")
  },hashTypes:{'logBinding': "STRING"},hashContexts:{'logBinding': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"no-logs\"></div>\n    ");
  }

  data.buffer.push("<div class=\"log-list\">\n    ");
  stack1 = helpers['if'].call(depth0, "view.searching", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <ul class=\"ui-listview ui-listview-inset ui-corner-all ui-shadow\"\n        data-role=\"listview\"\n        data-enhanced=\"true\"\n        data-inset=\"true\">\n        ");
  stack1 = helpers.each.call(depth0, "Mist.logsController", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.fetchingHistory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    ");
  stack1 = helpers['if'].call(depth0, "view.noMoreLogs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["script_run"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "machine", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "machine.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                            Select\n                        ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "enabled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers.each.call(depth0, "machines.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers['if'].call(depth0, "hasKeys", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <li data-icon=\"false\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "machineClicked", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                </a>\n                            </li>\n                        ");
  return buffer;
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"ajax-loader\"></div>\n        ");
  }

  data.buffer.push("<div id=\"script-run\"\n    data-swipe-close=\"false\"\n    class=\"side-panel\"\n    data-role=\"panel\"\n    data-position=\"right\"\n    data-display=\"overlay\"\n    data-theme=\"c\">\n\n    <div data-role=\"header\">\n        <h1>Run script</h1>\n    </div>\n\n    <div data-role=\"content\" data-theme=\"a\">\n\n        <div class=\"form-field\">\n            <label>Machine:</label>\n            <div id=\"script-run-machine\"\n                data-role=\"collapsible\"\n                data-iconpos=\"right\"\n                data-collapsed-icon=\"arrow-d\"\n                data-expanded-icon=\"arrow-u\"\n                data-theme=\"a\"\n                class=\"mist-select\">\n                <h4>\n                    ");
  stack1 = helpers['with'].call(depth0, "Mist.scriptRunController.scriptToRun", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </h4>\n                <ul data-role=\"listview\" data-theme=\"a\">\n                    ");
  stack1 = helpers.each.call(depth0, "Mist.backendsController.content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </ul>\n            </div>\n        </div>\n\n        <div class=\"form-field\">\n            <label for=\"script-params\">Parameters (optional):</label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Mist.TextArea", {hash:{
    'data-theme': ("a"),
    'id': ("script-params"),
    'valueBinding': ("Mist.scriptRunController.scriptToRun.parameters")
  },hashTypes:{'data-theme': "STRING",'id': "STRING",'valueBinding': "ID"},hashContexts:{'data-theme': depth0,'id': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.scriptsController.runningScript", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <div class=\"ok-cancel\" data-role=\"controlgroup\" data-type=\"horizontal\">\n            <a class=\"ui-btn ui-btn-a ui-shadow ui-corner-all\"\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "backClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Back</a>\n            <a id=\"new-script-ok\" data-theme=\"d\"\n                ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isReady::ui-state-disabled :ui-btn :ui-btn-d")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "runClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Run</a>\n        </div>\n    </div>\n</div>\n");
  return buffer;
  
});
Ember.TEMPLATES["subnet_list_item"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <td class=\"subnet-name\">Name</td>\n        <td class=\"subnet-name\">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n    </tr>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <td>Id</td>\n        <td>");
  stack1 = helpers._triageMustache.call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n    </tr>\n    ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <td>Zone</td>\n        <td>");
  stack1 = helpers._triageMustache.call(depth0, "zone.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n    </tr>\n    ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <td>Cidr</td>\n        <td>");
  stack1 = helpers._triageMustache.call(depth0, "cidr", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n    </tr>\n    ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <td>DHCP Enabled</td>\n        <td>");
  stack1 = helpers._triageMustache.call(depth0, "enable_dhcp", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n    </tr>\n    ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    <tr>\n        <td>Gateway IP</td>\n        <td>");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "gateway_ip", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </tr>\n        ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <tr>\n            <td>DNS Nameservers</td>\n            <td>\n                ");
  stack1 = helpers.each.call(depth0, "dns_nameservers", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n        </tr>\n        ");
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div class=\"ip\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>\n                ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <tr>\n            <td>Allocation pools</td>\n            <td>\n                ");
  stack1 = helpers.each.call(depth0, "allocation_pools", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n        </tr>\n        ");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div class=\"ip\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "start", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div> -\n                <div class=\"ip\">");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "end", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</div>\n                ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <tr>\n            <td class=\"usable-ips\" colspan=\"2\">\n                <h4>Usable ip addresses (");
  stack1 = helpers._triageMustache.call(depth0, "ipAddresses.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")</h4>\n                <table>\n                    <tbody>\n                    ");
  stack1 = helpers.each.call(depth0, "ipAddresses", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </tbody>\n            </table>\n        </td>\n    </tr>\n    ");
  return buffer;
  }
function program20(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "ipAddressListItem", {hash:{
    'model': ("")
  },hashTypes:{'model': "ID"},hashContexts:{'model': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n                    ");
  return buffer;
  }

  data.buffer.push("<table class=\"info-table\">\n    <tbody>\n    ");
  stack1 = helpers['if'].call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "id", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "zone", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "cidr", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "enable_dhcp", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "gateway_ip", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "dns_nameservers.length", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "allocation_pools.length", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  stack1 = helpers['if'].call(depth0, "ipAddresses", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n</table>\n");
  return buffer;
  
});
Ember.TEMPLATES["user_menu"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <img class=\"gravatar-image\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("view.gravatarURL")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("/>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"gravatar-image user\"></div>\n    ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n            <a class=\"ui-btn ui-btn-b ui-shadow ui-corner-all ui-mini\"\n               ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("view.accountUrl")
  },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n               ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'target': ("view.isNotCore")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Account</a>\n\n\n            ");
  stack1 = helpers['if'].call(depth0, "Mist.isCore", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a class=\"ui-btn ui-btn-b ui-shadow ui-corner-all ui-mini\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logoutClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Logout</a>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers.unless.call(depth0, "Mist.isCore", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <a class=\"ui-btn ui-btn-b ui-shadow ui-corner-all ui-mini\"\n                    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "loginClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Login</a>\n            ");
  return buffer;
  }

  data.buffer.push("<a id=\"me-btn\"\n   class=\"ui-btn-right ui-btn ui-shadow ui-corner-all\"\n   ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "meClicked", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers['if'].call(depth0, "view.gravatarURL", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    &nbsp;</a>\n\n<div id=\"user-menu-popup\" class=\"ui-mini\" data-role=\"popup\" data-position-to=\"#me-btn\" data-theme=\"c\" data-overlay-theme=\"b\" data-transition=\"flip\">\n\n    <div data-role=\"content\">\n\n        <div id=\"user-email\">");
  stack1 = helpers._triageMustache.call(depth0, "EMAIL", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n\n        <a href=\"http://docs.mist.io/contact\"\n           target=\"_blank\"\n           class=\"ui-btn ui-btn-b ui-shadow ui-corner-all ui-mini\">\n           Support</a>\n\n        <a href=\"http://docs.mist.io/\"\n           target=\"_blank\"\n           class=\"ui-btn ui-btn-b ui-shadow ui-corner-all ui-mini\">\n           Docs</a>\n\n        ");
  stack1 = helpers['if'].call(depth0, "Mist.authenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(8, program8, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </div>\n\n</div>\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "login", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "messageBox", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
    callback();
  }
});
