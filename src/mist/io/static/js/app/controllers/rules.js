define('app/controllers/rules',
    [
        'app/controllers/base_array',
        'app/models/rule',
    ],
    //
    //  Rules Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, RuleModel) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            //  Properties
            //

            baseModel: RuleModel,
            creationPending: false,
            model: [],

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
            //  Methods
            //

            setModel: function (model) {
                var modelToArray = [];
                forIn(model, function (rule) {
                    modelToArray.push(RuleModel.create(rule));
                });
                this.set('model', modelToArray);
            },

            getObject: function (id) {
                return this.model.findBy('id', id);
            },

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
                    that._addObject(rule);
                }).error(function (message) {
                    Mist.notificationController.notify(
                        'Error while creating rule: ' + message);
                }).complete(function (success, data) {
                    that.set('creationPending', false);
                    if (callback) callback(success, data);
                });
            },

            _addObject: function (object) {
                var newObject = RuleModel.create(object);
                this.model.pushObject(newObject);
                this.trigger('onAdd', {
                    object: newObject
                });
            },

            _deleteObject: function (object) {
                this.model.removeObject(object);
                this.trigger('onDelete', {
                    object: object
                });
            },

            _updateObject: function (object) {
                Ember.run.next(this, function(){
                    this.getObject(object.id).update(object);
                    this.trigger('onUpdate', {
                        object: object
                    });
                });
            },

            deleteRule: function (rule) {
                var that = this;
                rule.set('pendingAction', true);
                Mist.ajax.DELETE('/rules/' + rule.id, {
                }).success(function(){
                    that._deleteObject(rule);
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
                    that._updateObject(data);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Error while updating rule: ' + message);
                }).complete(function (success, data) {
                    args.rule.set('pendingAction', false);
                    if (args.callback) args.callback(success, data);
                });
            },


            getOperatorByTitle: function(ruleTitle) {
                return this.operatorList.findBy('title', ruleTitle);
            },


            getAggregateByValue: function (aggregateValue) {
                return this.aggregateList.findBy('value', aggregateValue);
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
