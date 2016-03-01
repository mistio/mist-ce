define('app/controllers/members', ['app/models/member'],
    //
    //  Members Controller
    //
    //  @returns Class
    //
    function(Member) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            // Properties
            //

            model: [],
            loading: null,
            team: null,

            //
            //  Initialization
            //

            init: function() {
                this._super();
                this.set('model', []);
                this.set('loading', true);
            },

            load: function(members) {
                this._updateModel(members);
                this.set('loading', false);
            },

            //
            //  Methods
            //

            getMember: function(memberId) {
                return this.model.findBy('id', memberId);
            },

            memberExists: function(memberId) {
                return !!this.getMember(memberId);
            },


            //
            //  Pseudo-Private Methods
            //

            _updateModel: function(members) {
                var that = this;
                Ember.run(function() {
                    // Replace dummy members (newly created)
                    var dummyMembers = that.model.filterBy('id', -1);

                    dummyMembers.forEach(function(member) {
                        var realMember = members.findBy('name', member.name);
                        if (realMember) {
                            for (var attr in realMember) {
                                member.set(attr, realMember[attr]);
                            }
                        }
                    });

                    // Remove deleted members
                    that.model.forEach(function(member) {
                        if (!members.findBy('id', member.id)) {
                            if (member.id != -1) {
                                that.model.removeObject(member);
                            }
                        }
                    });

                    // Update model
                    members.forEach(function(member) {
                        if (that.memberExists(member.id)) {
                            // Update existing members
                            var old_member = that.getMember(member.id);

                            for (var attr in member) {
                                old_member.set(attr, member[attr]);
                            }
                        } else {
                            // Add new member
                            member.organization = that.organization;
                            that.model.pushObject(Member.create(member));
                        }
                    });

                    Mist.organizationsController.updateMembers();
                    that.trigger('onMemberListChange');
                });
            },

        });
    }
);
