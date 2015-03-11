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
                'started_at': 'startedAt',
                'finished_at': 'finishedAt',
                'incident_id': 'incidentId',
                'machine_id': 'machineId',
                'rule_id': 'ruleId',
                'story_id': 'id',
            },



            //
            //
            //  Computed properties
            //
            //


            backend: function () {
                return Mist.backendsController.getBackend(this.get('backendId'));
            }.property('backendId'),


            machine: function () {
                return Mist.backendsController.getMachine(this.get('machineId'));
            }.property('machineId'),


            rule: function () {
                return Mist.rulesController.getRule(this.get('ruleId'));
            }.property('ruleId'),


            duration: function () {
                var start = parseInt(this.get('startedAt') * 1000);
                var end = parseInt(this.get('finishedAt') * 1000);
                if (!end)
                    end = Date.now();
                return new Date(end).diffToString(new Date(start));
            }.property('startedAt', 'finishedAt', 'Mist.clock.minute'),
        });
    }
);
