@backends
Feature: showing off behave

    Background:
        Given "NinjaTester" as the persona
        #Given a browser
        When i visit mist.io
            Then I should see "mist.io"


    @web
    @ec2-backend
    @test
    Scenario: Add EC2 Backend
        When I click the link with text "Add backend"
        And I click the link with text "Select provider"
        And I click the link with text "EC2 AP NORTHEAST"
        And I use my "EC2" credentials
        And I click the "Add" button
            Then I should see the "EC2 AP NORTHEAST" Backend added within 30 seconds

    @web
    @ec2-backend
    Scenario: Delete Backend
        When I click the "EC2 AP NORTHEAST" button
        And I click the "Delete" button
        And I click the "Yes" button
            Then I should see the "EC2 AP NORTHEAST" Backend deleted within 30 seconds


    @web
    @rackspace
    @openstack
    @softlayer
    Scenario: Add Rest Of the Backends
        When I click the link with text "Add backend"
        And I click the link with text "Select provider"
        And I click the link with text "Rackspace DFW"
        And I use my "RACKSPACE" credentials
        And I click the "Add" button
            Then I should see the "Rackspace DFW" Backend added within 30 seconds

        When I wait for 2 seconds
        When I click the link with text "Add backend"
        And I click the link with text "Select provider"
        And I click the link with text "OpenStack"
        And I use my "OPENSTACK" credentials
        And I click the "Add" button
            Then I should see the "OpenStack" Backend added within 30 seconds

        When I wait for 2 seconds
        When I click the link with text "Add backend"
        And I click the link with text "Select provider"
        And I click the link with text "SoftLayer"
        And I use my "SOFTLAYER" credentials
        And I click the "Add" button
            Then I should see the "SoftLayer" Backend added within 30 seconds
