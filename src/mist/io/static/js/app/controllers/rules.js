define('app/controllers/rules', ['app/models/rule', 'ember'],
    //
    //  Rules Controller
    //
    //  @returns Class
    //
    function (Rule) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: [],
            creationPending: false,

            aggregateList: [{
                'title': 'any',
                'value': 'any'
            }, {
                'title': 'every',
                'value': 'all'
            }, {
                'title': 'average',
                'value': 'avg'
            }],

            operatorList: [{
                'title': 'gt',
                'symbol': '>'
            }, {
                'title': 'lt',
                'symbol': '<'
            }],

            actionList: [
                'alert',
                'reboot',
                'destroy',
                'command'
            ],


            //
            //
            //  Initialization
            //
            //


            load: function(rules) {
                this._updateContent(rules);
            },


            //
            //
            //  Methods
            //
            //


            newRule: function (machine, callback) {

                var that = this;
                this.set('creationPending', true);
                Mist.ajax.POST('/rules', {
                    'cloudId': machine.cloud.id,
                    'machineId': machine.id,
                    'metric': 'load.shortterm',
                    'operator': 'gt',
                    'value': 5,
                    'action': 'alert'
                }).success(function (rule) {
                    that._addRule(rule);
                }).error(function (message) {
                    Mist.notificationController.notify(
                        'Error while creating rule: ' + message);
                }).complete(function (success, data) {
                    that.set('creationPending', false);
                    if (callback) callback(success, data);
                });
            },


            deleteRule: function (rule) {
                var that = this;
                rule.set('pendingAction', true);
                Mist.ajax.DELETE('/rules/' + rule.id, {
                }).success(function(){
                    that._deleteRule(rule);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Error while deleting rule: ' + message);
                    rule.set('pendingAction', false);
                });
            },


            editRule: function (args) {

                var payload = {
                    id: args.rule.id
                };

                // Construct payload
                forIn(args.properties, function (value, property) {
                    payload[property] = value;
                });

                var that = this;
                args.rule.set('pendingAction', true);
                Mist.ajax.POST('/rules',
                    payload
                ).success(function (data) {
                    that._updateRule(args.rule, data);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Error while updating rule: ' + message);
                }).complete(function (success, data) {
                    args.rule.set('pendingAction', false);
                    if (args.callback) args.callback(success, data);
                });
            },


            ruleExists: function (ruleId) {
                return !!this.getRuleById(ruleId);
            },


            getRule: function (ruleId) {
                return this.getRuleById(ruleId);
            },


            getRuleById: function(ruleId) {
                return this.content.findBy('id', ruleId);
            },


            getOperatorByTitle: function(ruleTitle) {
                return this.operatorList.findBy('title', ruleTitle);
            },


            getAggregateByValue: function (aggregateValue) {
                return this.aggregateList.findBy('value', aggregateValue);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _updateContent: function (rules) {
                Ember.run(this, function() {

                    // Remove deleted rules
                    this.content.forEach(function (rule) {
                        if (!rules[rule.id])
                            this._deleteRule(rule);
                    }, this);

                    forIn(this, rules, function (rule, ruleId) {

                        rule.id = ruleId;

                        var oldRule = this.getRuleById(ruleId);

                        if (oldRule)
                            this._updateRule(oldRule, rule);
                        else
                            // Add new rules
                            this._addRule(rule);
                    });

                    this.trigger('onRuleListChange');
                });
            },


            _addRule: function (rule) {
                Ember.run(this, function () {
                    var newRule = Rule.create(rule);
                    if (this.ruleExists(rule.id)) return;
                    this.content.addObject(newRule);
                    this.trigger('onRuleAdd', {
                        rule: newRule
                    });
                });
            },


            _updateRule: function (rule, data) {
                Ember.run(this, function () {
                    rule.updateFromRawData(data);
                    this.trigger('onRuleUpdate', {
                        rule: rule,
                    });
                });
            },


            _deleteRule: function (rule) {
                Ember.run(this, function () {
                    this.content.removeObject(rule);
                    this.trigger('onRuleDelete', {
                        rule: rule
                    });
                });
            },


            //
            //
            //  Observers
            //
            //


            creationPendingObserver: function() {
                if (this.creationPending)
                    $('#add-rule-button').addClass('ui-state-disabled');
                else
                    $('#add-rule-button').removeClass('ui-state-disabled');
            }.observes('creationPending'),

        });
    }
);
