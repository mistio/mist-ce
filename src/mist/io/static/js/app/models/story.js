define('app/models/story', ['app/models/base'],
    //
    //  Story Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use sctrict';

        return BaseModel.extend({


            //
            //
            //  Properties
            //
            //



            convertProperties: {
                'backend_id': 'backendId',
                'finished_at': 'finishedAt',
                'incident_id': 'incidentId',
                'machine_id': 'machineId',
                'rule_id': 'ruleId',
                'story_id': 'id',
            },



            backend: function () {
                return Mist.backendsController.getBackend(this.get('backendId'));
            }.property('backendId'),


            machine: function () {
                return Mist.backendsController.getMachine(this.get('machineId'));
            }.property('machineId'),


            rule: function () {
                return Mist.rulesController.getRule(this.get('ruleId'));
            }.property('ruleId'),
        });
    }
);
