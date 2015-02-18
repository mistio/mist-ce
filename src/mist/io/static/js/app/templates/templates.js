define('app/templates/templates', ['ember'], function() {
  return function (callback) {
    if (!JS_BUILD) {
      require([
        'text!app/templates/backend_add.html',
        'text!app/templates/backend_button.html',
        'text!app/templates/backend_edit.html',
        'text!app/templates/confirmation_dialog.html',
        'text!app/templates/dialog.html',
        'text!app/templates/file_upload.html',
        'text!app/templates/graph_button.html',
        'text!app/templates/graph_list_bar.html',
        'text!app/templates/graph_list_control.html',
        'text!app/templates/graph_list.html',
        'text!app/templates/graph_list_item.html',
        'text!app/templates/home.html',
        'text!app/templates/image_list.html',
        'text!app/templates/image_list_item.html',
        'text!app/templates/ip_address_list_item.html',
        'text!app/templates/key_add.html',
        'text!app/templates/key_edit.html',
        'text!app/templates/key.html',
        'text!app/templates/key_list.html',
        'text!app/templates/key_list_item.html',
        'text!app/templates/login.html',
        'text!app/templates/log_list.html',
        'text!app/templates/log_list_item.html',
        'text!app/templates/machine_add.html',
        'text!app/templates/machine.html',
        'text!app/templates/machine_keys.html',
        'text!app/templates/machine_keys_list_item.html',
        'text!app/templates/machine_list.html',
        'text!app/templates/machine_list_item.html',
        'text!app/templates/machine_monitoring.html',
        'text!app/templates/machine_power.html',
        'text!app/templates/machine_shell.html',
        'text!app/templates/machine_tags.html',
        'text!app/templates/machine_tags_list_item.html',
        'text!app/templates/messagebox.html',
        'text!app/templates/metric_add_custom.html',
        'text!app/templates/metric_add.html',
        'text!app/templates/metric_node.html',
        'text!app/templates/missing.html',
        'text!app/templates/network_create.html',
        'text!app/templates/network.html',
        'text!app/templates/network_list.html',
        'text!app/templates/network_list_item.html',
        'text!app/templates/rule_edit.html',
        'text!app/templates/rule.html',
        'text!app/templates/rule_list.html',
        'text!app/templates/script_add.html',
        'text!app/templates/script.html',
        'text!app/templates/script_list.html',
        'text!app/templates/script_list_item.html',
        'text!app/templates/subnet_list_item.html',
        'text!app/templates/user_menu.html',
      ], function () {
        Ember.TEMPLATES['backend_add/html'] = Ember.Handlebars.compile(arguments[0]);
        Ember.TEMPLATES['backend_button/html'] = Ember.Handlebars.compile(arguments[1]);
        Ember.TEMPLATES['backend_edit/html'] = Ember.Handlebars.compile(arguments[2]);
        Ember.TEMPLATES['confirmation_dialog/html'] = Ember.Handlebars.compile(arguments[3]);
        Ember.TEMPLATES['dialog/html'] = Ember.Handlebars.compile(arguments[4]);
        Ember.TEMPLATES['file_upload/html'] = Ember.Handlebars.compile(arguments[5]);
        Ember.TEMPLATES['graph_button/html'] = Ember.Handlebars.compile(arguments[6]);
        Ember.TEMPLATES['graph_list_bar/html'] = Ember.Handlebars.compile(arguments[7]);
        Ember.TEMPLATES['graph_list_control/html'] = Ember.Handlebars.compile(arguments[8]);
        Ember.TEMPLATES['graph_list/html'] = Ember.Handlebars.compile(arguments[9]);
        Ember.TEMPLATES['graph_list_item/html'] = Ember.Handlebars.compile(arguments[10]);
        Ember.TEMPLATES['home/html'] = Ember.Handlebars.compile(arguments[11]);
        Ember.TEMPLATES['image_list/html'] = Ember.Handlebars.compile(arguments[12]);
        Ember.TEMPLATES['image_list_item/html'] = Ember.Handlebars.compile(arguments[13]);
        Ember.TEMPLATES['ip_address_list_item/html'] = Ember.Handlebars.compile(arguments[14]);
        Ember.TEMPLATES['key_add/html'] = Ember.Handlebars.compile(arguments[15]);
        Ember.TEMPLATES['key_edit/html'] = Ember.Handlebars.compile(arguments[16]);
        Ember.TEMPLATES['key/html'] = Ember.Handlebars.compile(arguments[17]);
        Ember.TEMPLATES['key_list/html'] = Ember.Handlebars.compile(arguments[18]);
        Ember.TEMPLATES['key_list_item/html'] = Ember.Handlebars.compile(arguments[19]);
        Ember.TEMPLATES['login/html'] = Ember.Handlebars.compile(arguments[20]);
        Ember.TEMPLATES['log_list/html'] = Ember.Handlebars.compile(arguments[21]);
        Ember.TEMPLATES['log_list_item/html'] = Ember.Handlebars.compile(arguments[22]);
        Ember.TEMPLATES['machine_add/html'] = Ember.Handlebars.compile(arguments[23]);
        Ember.TEMPLATES['machine/html'] = Ember.Handlebars.compile(arguments[24]);
        Ember.TEMPLATES['machine_keys/html'] = Ember.Handlebars.compile(arguments[25]);
        Ember.TEMPLATES['machine_keys_list_item/html'] = Ember.Handlebars.compile(arguments[26]);
        Ember.TEMPLATES['machine_list/html'] = Ember.Handlebars.compile(arguments[27]);
        Ember.TEMPLATES['machine_list_item/html'] = Ember.Handlebars.compile(arguments[28]);
        Ember.TEMPLATES['machine_monitoring/html'] = Ember.Handlebars.compile(arguments[29]);
        Ember.TEMPLATES['machine_power/html'] = Ember.Handlebars.compile(arguments[30]);
        Ember.TEMPLATES['machine_shell/html'] = Ember.Handlebars.compile(arguments[31]);
        Ember.TEMPLATES['machine_tags/html'] = Ember.Handlebars.compile(arguments[32]);
        Ember.TEMPLATES['machine_tags_list_item/html'] = Ember.Handlebars.compile(arguments[33]);
        Ember.TEMPLATES['messagebox/html'] = Ember.Handlebars.compile(arguments[34]);
        Ember.TEMPLATES['metric_add_custom/html'] = Ember.Handlebars.compile(arguments[35]);
        Ember.TEMPLATES['metric_add/html'] = Ember.Handlebars.compile(arguments[36]);
        Ember.TEMPLATES['metric_node/html'] = Ember.Handlebars.compile(arguments[37]);
        Ember.TEMPLATES['missing/html'] = Ember.Handlebars.compile(arguments[38]);
        Ember.TEMPLATES['network_create/html'] = Ember.Handlebars.compile(arguments[39]);
        Ember.TEMPLATES['network/html'] = Ember.Handlebars.compile(arguments[40]);
        Ember.TEMPLATES['network_list/html'] = Ember.Handlebars.compile(arguments[41]);
        Ember.TEMPLATES['network_list_item/html'] = Ember.Handlebars.compile(arguments[42]);
        Ember.TEMPLATES['rule_edit/html'] = Ember.Handlebars.compile(arguments[43]);
        Ember.TEMPLATES['rule/html'] = Ember.Handlebars.compile(arguments[44]);
        Ember.TEMPLATES['rule_list/html'] = Ember.Handlebars.compile(arguments[45]);
        Ember.TEMPLATES['script_add/html'] = Ember.Handlebars.compile(arguments[46]);
        Ember.TEMPLATES['script/html'] = Ember.Handlebars.compile(arguments[47]);
        Ember.TEMPLATES['script_list/html'] = Ember.Handlebars.compile(arguments[48]);
        Ember.TEMPLATES['script_list_item/html'] = Ember.Handlebars.compile(arguments[49]);
        Ember.TEMPLATES['subnet_list_item/html'] = Ember.Handlebars.compile(arguments[50]);
        Ember.TEMPLATES['user_menu/html'] = Ember.Handlebars.compile(arguments[51]);
        callback();
      });
      return;
    }
    callback();
  }
});
