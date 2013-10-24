define('app/models/rule', ['ember'],
    /**
     *
     * Rule model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            id: null,
            machine: null,
            metric: null,
            operator: null,
            value: null,
            unit: null,
            maxValue: null,
            cycles: null,
            actionToTake: null,
            command: null,
            machineName: null,
            machineBackend: null,
            machineImage: null,
            machineSize: null,
            machineLocation: null,
            machineKey: null,
            machineScript: null,
            pendingAction: false,
        });
    }
);
