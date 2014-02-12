@backends
Feature: Backends


    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"


    @web
    Scenario: Add Backend
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "EC2 AP NORTHEAST" button
        And I use my "EC2" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "EC2 AP NORTHEAST" Backend added within 60 seconds


    @web
    Scenario: Disable Backend
        When I click the "EC2 AP NORTHEAST" button
        And I wait for 1 seconds
        When I flip the backend switch
        And I wait for 1 seconds
        And I click the "Back" button
        And I wait for 5 seconds
            Then "EC2 AP NORTHEAST" backend should be "offline"


    @web
    Scenario: Enable Backend
        When I wait for 1 seconds
            Then "EC2 AP NORTHEAST" backend should be "offline"
        When I click the "EC2 AP NORTHEAST" button
        And I wait for 1 seconds
        When I flip the backend switch
        And I wait for 1 seconds
        And I click the "Back" button
        And I wait for 5 seconds
            Then "EC2 AP NORTHEAST" backend should be "online"


    @web
    Scenario: Rename Backend
        When I click the "EC2 AP NORTHEAST" button
        And I wait for 3 seconds
        And I change the name of the backend to "New"
        And I wait for 5 seconds
            Then I should see the "New" Backend added within 10 seconds


    @web
    Scenario: Delete Backend
        When I click the "New" button
        And I wait for 1 seconds
        And I click the "Delete" button
        And I wait for 1 seconds
        And I click the "Yes" button
        And I wait for 3 seconds
            Then I should see the "New" Backend deleted within 5 seconds


    @web
    @stress
    Scenario Outline: Add Rest of the Backends
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "<provider>" button
        And I use my "<credentials>" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "<provider>" Backend added within 60 seconds

        Examples: Providers
        | provider          | credentials |
        | Rackspace DFW     | RACKSPACE   |
        | OpenStack         | OPENSTACK   |
        | SoftLayer         | SOFTLAYER   |
        | NephoScale        | NEPHOSCALE  |
        | Linode            | LINODE      |
        | HP Cloud US East  | HPCLOUD     |
