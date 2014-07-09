define('app/templates/templates', ['ember'], function() {

if (!JS_BUILD) {
  require([
    'text!app/templates/backend_add.html',
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
    'ember'],
  function() {
    Ember.TEMPLATES['backend_add/html'] = Ember.Handlebars.compile(arguments[0]);
    Ember.TEMPLATES['backend_edit/html'] = Ember.Handlebars.compile(arguments[1]);
    Ember.TEMPLATES['confirmation_dialog/html'] = Ember.Handlebars.compile(arguments[2]);
    Ember.TEMPLATES['file_upload/html'] = Ember.Handlebars.compile(arguments[3]);
    Ember.TEMPLATES['graph_button/html'] = Ember.Handlebars.compile(arguments[4]);
    Ember.TEMPLATES['graph/html'] = Ember.Handlebars.compile(arguments[5]);
    Ember.TEMPLATES['home/html'] = Ember.Handlebars.compile(arguments[6]);
    Ember.TEMPLATES['image_list/html'] = Ember.Handlebars.compile(arguments[7]);
    Ember.TEMPLATES['image_list_item/html'] = Ember.Handlebars.compile(arguments[8]);
    Ember.TEMPLATES['key_add/html'] = Ember.Handlebars.compile(arguments[9]);
    Ember.TEMPLATES['key_edit/html'] = Ember.Handlebars.compile(arguments[10]);
    Ember.TEMPLATES['key/html'] = Ember.Handlebars.compile(arguments[11]);
    Ember.TEMPLATES['key_list/html'] = Ember.Handlebars.compile(arguments[12]);
    Ember.TEMPLATES['key_list_item/html'] = Ember.Handlebars.compile(arguments[13]);
    Ember.TEMPLATES['login/html'] = Ember.Handlebars.compile(arguments[14]);
    Ember.TEMPLATES['machine_add/html'] = Ember.Handlebars.compile(arguments[15]);
    Ember.TEMPLATES['machine/html'] = Ember.Handlebars.compile(arguments[16]);
    Ember.TEMPLATES['machine_keys/html'] = Ember.Handlebars.compile(arguments[17]);
    Ember.TEMPLATES['machine_keys_list_item/html'] = Ember.Handlebars.compile(arguments[18]);
    Ember.TEMPLATES['machine_list/html'] = Ember.Handlebars.compile(arguments[19]);
    Ember.TEMPLATES['machine_list_item/html'] = Ember.Handlebars.compile(arguments[20]);
    Ember.TEMPLATES['machine_manual_monitoring/html'] = Ember.Handlebars.compile(arguments[21]);
    Ember.TEMPLATES['machine_power/html'] = Ember.Handlebars.compile(arguments[22]);
    Ember.TEMPLATES['machine_shell/html'] = Ember.Handlebars.compile(arguments[23]);
    Ember.TEMPLATES['machine_shell_list_item/html'] = Ember.Handlebars.compile(arguments[24]);
    Ember.TEMPLATES['machine_tags/html'] = Ember.Handlebars.compile(arguments[25]);
    Ember.TEMPLATES['machine_tags_list_item/html'] = Ember.Handlebars.compile(arguments[26]);
    Ember.TEMPLATES['messagebox/html'] = Ember.Handlebars.compile(arguments[27]);
    Ember.TEMPLATES['metric_add_custom/html'] = Ember.Handlebars.compile(arguments[28]);
    Ember.TEMPLATES['metric_add/html'] = Ember.Handlebars.compile(arguments[29]);
    Ember.TEMPLATES['metric_node/html'] = Ember.Handlebars.compile(arguments[30]);
    Ember.TEMPLATES['monitoring/html'] = Ember.Handlebars.compile(arguments[31]);
    Ember.TEMPLATES['rule_edit/html'] = Ember.Handlebars.compile(arguments[32]);
    Ember.TEMPLATES['rule/html'] = Ember.Handlebars.compile(arguments[33]);
    Ember.TEMPLATES['user_menu/html'] = Ember.Handlebars.compile(arguments[34]);
  });
  return;
}


});
