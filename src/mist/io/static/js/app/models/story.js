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
                cloud_id: 'cloudId',
                started_at: 'startedAt',
                finished_at: 'finishedAt',
                incident_id: 'incidentId',
                machine_id: 'machineId',
                rule_id: 'ruleId',
                story_id: 'id',
            },


            processProperties: {
                startedAt: function (startedAt) {
                    return new Date(parseInt(startedAt * 1000));
                },
                finishedAt: function (finishedAt) {
                    return new Date(parseInt(finishedAt * 1000));
                }
            },


            //
            //
            //  Computed properties
            //
            //


            cloud: function () {
                return Mist.cloudsController.getCloud(this.get('cloudId'));
            }.property('cloudId'),


            machine: function () {
                return Mist.cloudsController.getMachine(this.get('machineId'));
            }.property('machineId'),


            rule: function () {
                return Mist.rulesController.getRule(this.get('ruleId'));
            }.property('ruleId'),


            duration: function () {
                var start = this.get('startedAt');
                var end = this.get('finishedAt');
                if (end < start)
                    end = new Date();
                return end.diffToString(start);
            }.property('startedAt', 'finishedAt', 'Mist.clock.minute'),


            start: function () {
                return this.get('startedAt').getPrettyTime();
            }.property('startedAt'),


            closed: function () {
                return new Date().diffToString(this.get('finishedAt'));
            }.property('finishedAt', 'Mist.clock.minute'),


            prettyTime: function () {
                var timeFromNow = this.get('startedAt')
                    .getTimeFromNow()
                    .replace(' ago', '');
                // Add 'since' if timFromNow is not a number
                if (!timeFromNow.split('')[0].match(/^\d+$/))
                    timeFromNow = 'since ' + timeFromNow;
                return timeFromNow;
            }.property('startedAt', 'Mist.clock.second'),


            ruleText: function () {
                return this.get('logs')[0].condition;
            }.property('logs.@each'),


            machineName: function () {
                return this.get('logs')[0].machine_name;
            }.property('logs.@each'),


            isClosed: function () {
                return this.get('finishedAt') > this.get('startedAt');
            }.property('finishedAt')
        });
    }
);
