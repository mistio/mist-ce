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


            actions: {


                openMetricPopup: function() {
                    Mist.ruleEditController.open(this.rule, 'metric');
                },


                openOperatorPopup: function() {
                    Mist.ruleEditController.open(this.rule, 'operator');
                },


                openActionPopup: function() {
                    Mist.ruleEditController.open(this.rule, 'action');
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

            }
        });
    }
);
