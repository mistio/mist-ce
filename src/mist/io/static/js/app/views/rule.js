define('app/views/rule', ['app/views/templated','ember'],
    /**
     *  Rule View
     *
     *  @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            didInsertElement: function() {
                Ember.run.next(this, function() {
                    this.metricObserver();
                    $('#'+this.elementId).find('.ui-slider-track').hide();
                });
            },

            valueObserver: function() {
                $('#' + this.rule.id + ' .rule-value').val(this.rule.value);
                $('#' + this.rule.id + ' .rule-value').slider('refresh');
            }.observes('this.rule.value'),

            metricObserver: function() {
                var metric = this.rule.metric;
                if (metric == 'network-tx' || metric == 'disk-write') {
                    this.rule.set('unit','KB/s');
                } else if (metric == 'cpu' || metric == 'ram') {
                    this.rule.set('unit','%');
                } else {
                    this.rule.set('unit','');
                }
            }.observes('this.rule.metric'),

            pendingActionObserver: function() {
                Ember.run.next(function() {
                    $('.delete-rule-container').trigger('create');
                });
            }.observes('this.rule.pendingAction'),

            selectMetric: function(event) {
                $('.rule-metric-popup').popup('close');
                $('.rule-metric-popup li a').off('click');
                info(event.data.id);
                info(this.title);
                Mist.rulesController.updateRule(event.data.id, this.title);
                return false;
            },

            selectOperator: function(event) {
                $('.rule-operator-popup').popup('close');
                $('.rule-operator-popup li a').off('click');
                var operator = {
                    'title': this.title,
                    'symbol': this.text
                };
                Mist.rulesController.updateRule(event.data.id, null, operator);
                return false;
            },


            actions: {


                openMetricPopup: function() {
                    $('.rule-metric-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.metric').popup('open');
                    $('.rule-metric-popup li a').on('click', this.rule, this.selectMetric);
                },


                openOperatorPopup: function() {
                    $('.rule-operator-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.operator').popup('open');
                    $('.rule-operator-popup li a').on('click', this.rule, this.selectOperator);
                },


                openActionPopup: function() {
                    $('.rule-action-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.action').popup('open');
                    $('.rule-action-popup li a').on('click', this.rule, this.selectAction);
                },


                deleteRuleClicked: function(){
                    this.rule.set('pendingAction', true);
                    var that = this;
                    Mist.ajax.DELETE('/rules/' + that.rule.id, {
                    }).success(function(){
                        info('Successfully deleted rule ', that.rule.id);
                        Mist.rulesController.removeObject(that.rule);
                        Mist.rulesController.redrawRules();
                        that.rule.set('pendingAction', false);
                    }).error(function(message) {
                        Mist.notificationController.notify('Error while deleting rule: ' + message);
                        that.rule.set('pendingAction', false);
                    });
                }
            },


            selectAction: function(event) {
                $('.rule-action-popup').popup('close');
                $('.rule-action-popup li a').off('click');
                var rule = event.data;
                var action = this.title;
                // if 'command' is selected open the popup. Rule is updated by saveCommand()
                if (action == 'command') {
                    Mist.rulesController.set('commandRule', rule);
                    Mist.rulesController.set('command', rule.command);
                    $('.rule-command-popup textarea').val(rule.command);
                    $('.rule-command-popup').css('width', 0.7 * $(window).width());
                    $('.rule-command-popup').popup('open');
                    return false;
                };
                Mist.rulesController.updateRule(rule.id, null, null, null, action);
                return false;
            }
        });
    }
);
