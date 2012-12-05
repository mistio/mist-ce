define('app/views/key_list_item', [
    'text!app/templates/key_list_item.html',
    'ember'
    ],
    /**
     *
     * Key List Item View
     *
     * @returns Class
     */
    function(key_list_item_html) {
        return Ember.View.extend({

                tagName:false,

                checkBoxClick: function(event, el){

                    log('key clicked');

                    if (event.target.tagName != 'A') {
                        if (event.target.tagName == 'INPUT') {
                            event.stopPropagation();
                            var $this = $(event.target);

                            $this.checkboxradio("refresh");

                            var len = $('.keys-list input:checked').length;

                            if (len > 0) {
                                $('.keys-footer').fadeIn(140);

                            } else {
                                $('.keys-footer').fadeOut(200);
                            }
                            return;
                        }
                    }
                    Mist.set('key', this.key);
                },

                keySelected: function(){
                    log('key selected changed');

                    var that = this;

                    Em.run.next(function() {
                        try {
                            that.get('parentView').$().find("input[type='checkbox']").checkboxradio('refresh');
                        } catch (e) {
                            if (that.get('parentView') != null) {
                              that.get('parentView').$().find("input[type='checkbox']").checkboxradio();
                            }
                        }

                        var len = $('#keys-list input:checked').length; //FIXME use data instead of DOM
                        if (len > 1) {
                            $('.keys-footer').fadeIn(140);
                            Mist.set('key', null);
                        } else if (len == 1) {
                            $('.keys-footer').fadeIn(140);
                            if (len == 1) {
                                var keys = new Array();
                                Mist.keysController.forEach(function(key) {
                                    if (key.selected) {
                                        keys.push(key);
                                    }
                                });
                                Mist.set('key', keys[0]);
                            }
                        } else {
                            $('.keys-footer').fadeOut(200);
                            Mist.set('key', null);
                        }
                    });

                }.observes('key.selected'),

                init: function() {
                    this._super();
                    // cannot have template in home.pt as pt complains
                    this.set('template', Ember.Handlebars.compile(key_list_item_html));
                },
        });

    }
);
