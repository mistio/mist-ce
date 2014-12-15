define('app/views/log_list_item', ['app/views/list_item'],
    //
    //  Log List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict';

        return ListItemView.extend({


            //
            //
            //  Properties
            //
            //


            log: null,
            tagName: 'li',
            isCollapsed: true,


            //
            //
            //  Computed Properties
            //
            //


            details: function () {
                var details = [];
                forIn(this.log, function (value, property) {
                    if (property == 'time')
                        return;
                    if (value !== undefined && value !== null)
                        details.push({
                            key: property,
                            value: value instanceof Object ? JSON.stringify(value) : value
                        });
                })
                return details.sort(function (a, b) {
                    if (a.key > b.key)
                        return 1;
                    if (a.key < b.key)
                        return -1;
                    return 0;
                });
            }.property('log'),


            collapsedClass: function () {
                return this.get('isCollapsed') ? '' : 'open';
            }.property('isCollapsed'),


            prettyTime: function () {
                return Mist.dateFromNow(this.get('log').get('time'));
            }.property('log.time'),


            fullPrettyTime: function () {
                return Mist.prettyDateTime(this.get('log').get('time'));
            }.property('log.time'),


            formatedAction: function () {
                return this.get('log').get('action').split('_').map(function (word) {
                    return word.capitalize();
                }).join(' ');
            }.property('log.action'),


            filteredEmail: function () {
                var email = this.get('log').get('email');
                return email !== 'None' ? email : '';
            }.property('log.email'),


            isIncident: function () {
                return this.get('log').get('type') == 'incident';
            }.property('log.type'),


            backendTitle: function () {
                var log = this.get('log');
                var backendId = log.get('backend_id');
                if (Mist.backendsController.backendExists(backendId))
                    return Mist.backendsController.getBackend(backendId).title;
                return false;
            }.property('log.backend_id'),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('isCollapsed', true);
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                toggleCollapse: function () {
                    if (this.get('isCollapsed')) {
                        this.set('isCollapsed', false);
                        this.$().find('.details').slideDown();
                    } else {
                        this.set('isCollapsed', true);
                        this.$().find('.details').slideUp();
                    }
                },


                userClicked: function (user) {
                    Mist.Router.router.transitionTo('user',
                        Mist.usersController.getUser(
                            this.get('log').get('email')
                        )
                    );
                }
            }
        });
    }
);
