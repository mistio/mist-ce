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
        'text!app/templates/graph_list.hbs',
        'text!app/templates/graph_list_bar.hbs',
        'text!app/templates/graph_list_control.hbs',
        'text!app/templates/graph_list_item.hbs',
        'text!app/templates/home.hbs',
        'text!app/templates/image_list.hbs',
        'text!app/templates/image_list_item.hbs',
        'text!app/templates/ip_address_list_item.hbs',
        'text!app/templates/key.hbs',
        'text!app/templates/key_add.hbs',
        'text!app/templates/key_edit.hbs',
        'text!app/templates/key_list.hbs',
        'text!app/templates/key_list_item.hbs',
        'text!app/templates/log_list.hbs',
        'text!app/templates/log_list_item.hbs',
        'text!app/templates/login.hbs',
        'text!app/templates/machine.hbs',
        'text!app/templates/machine_add.hbs',
        'text!app/templates/machine_edit.hbs',
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
        'text!app/templates/metric_add.hbs',
        'text!app/templates/metric_add_custom.hbs',
        'text!app/templates/metric_node.hbs',
        'text!app/templates/missing.hbs',
        'text!app/templates/network.hbs',
        'text!app/templates/network_create.hbs',
        'text!app/templates/network_list.hbs',
        'text!app/templates/network_list_item.hbs',
        'text!app/templates/rule.hbs',
        'text!app/templates/rule_edit.hbs',
        'text!app/templates/rule_list.hbs',
        'text!app/templates/script.hbs',
        'text!app/templates/script_add.hbs',
        'text!app/templates/script_edit.hbs',
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
        Ember.TEMPLATES['graph_list'] = Ember.Handlebars.compile(arguments[6]);
        Ember.TEMPLATES['graph_list_bar'] = Ember.Handlebars.compile(arguments[7]);
        Ember.TEMPLATES['graph_list_control'] = Ember.Handlebars.compile(arguments[8]);
        Ember.TEMPLATES['graph_list_item'] = Ember.Handlebars.compile(arguments[9]);
        Ember.TEMPLATES['home'] = Ember.Handlebars.compile(arguments[10]);
        Ember.TEMPLATES['image_list'] = Ember.Handlebars.compile(arguments[11]);
        Ember.TEMPLATES['image_list_item'] = Ember.Handlebars.compile(arguments[12]);
        Ember.TEMPLATES['ip_address_list_item'] = Ember.Handlebars.compile(arguments[13]);
        Ember.TEMPLATES['key'] = Ember.Handlebars.compile(arguments[14]);
        Ember.TEMPLATES['key_add'] = Ember.Handlebars.compile(arguments[15]);
        Ember.TEMPLATES['key_edit'] = Ember.Handlebars.compile(arguments[16]);
        Ember.TEMPLATES['key_list'] = Ember.Handlebars.compile(arguments[17]);
        Ember.TEMPLATES['key_list_item'] = Ember.Handlebars.compile(arguments[18]);
        Ember.TEMPLATES['log_list'] = Ember.Handlebars.compile(arguments[19]);
        Ember.TEMPLATES['log_list_item'] = Ember.Handlebars.compile(arguments[20]);
        Ember.TEMPLATES['login'] = Ember.Handlebars.compile(arguments[21]);
        Ember.TEMPLATES['machine'] = Ember.Handlebars.compile(arguments[22]);
        Ember.TEMPLATES['machine_add'] = Ember.Handlebars.compile(arguments[23]);
        Ember.TEMPLATES['machine_edit'] = Ember.Handlebars.compile(arguments[24]);
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
        Ember.TEMPLATES['metric_add'] = Ember.Handlebars.compile(arguments[35]);
        Ember.TEMPLATES['metric_add_custom'] = Ember.Handlebars.compile(arguments[36]);
        Ember.TEMPLATES['metric_node'] = Ember.Handlebars.compile(arguments[37]);
        Ember.TEMPLATES['missing'] = Ember.Handlebars.compile(arguments[38]);
        Ember.TEMPLATES['network'] = Ember.Handlebars.compile(arguments[39]);
        Ember.TEMPLATES['network_create'] = Ember.Handlebars.compile(arguments[40]);
        Ember.TEMPLATES['network_list'] = Ember.Handlebars.compile(arguments[41]);
        Ember.TEMPLATES['network_list_item'] = Ember.Handlebars.compile(arguments[42]);
        Ember.TEMPLATES['rule'] = Ember.Handlebars.compile(arguments[43]);
        Ember.TEMPLATES['rule_edit'] = Ember.Handlebars.compile(arguments[44]);
        Ember.TEMPLATES['rule_list'] = Ember.Handlebars.compile(arguments[45]);
        Ember.TEMPLATES['script'] = Ember.Handlebars.compile(arguments[46]);
        Ember.TEMPLATES['script_add'] = Ember.Handlebars.compile(arguments[47]);
        Ember.TEMPLATES['script_edit'] = Ember.Handlebars.compile(arguments[48]);
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
    callback();
  }
});
