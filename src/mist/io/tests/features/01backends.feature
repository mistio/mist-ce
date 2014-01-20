@backends
Feature: Backends

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"

    @web
    Scenario Outline: Add Backends
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "<provider>" button
        And I use my "<credentials>" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "<provider>" Backend added within 30 seconds

        Examples: Providers
        | provider          | credentials |
        | EC2 AP NORTHEAST  | EC2         |
        | Rackspace DFW     | RACKSPACE   |
        | OpenStack         | OPENSTACK   |
        | SoftLayer         | SOFTLAYER   |
        | NephoScale        | NEPHOSCALE  |

    @web
    Scenario Outline: Delete Backends
        When I click the "<provider>" button
        And I click the "Delete" button
        And I click the "Yes" button
            Then I should see the "<provider>" Backend deleted within 5 seconds

    Examples: Providers
    | provider          |
    | EC2 AP NORTHEAST  |
    | Rackspace DFW     |
    | OpenStack         |
    | SoftLayer         |
    | NephoScale        |






#    @web
#    @text
#    Scenario: Disable Backend
#        When I click the "OpenStack" button
#        And I wait for 2 seconds
#        When I flip the backend switch
#        And I click the "Back" button
#        And I wait for 1 seconds
#        And I click the "OpenStack" button
#            Then "OpenStack" backend should be "Disabled"


#    @web
#    Scenario: Enable Backend
#        When I click the "OpenStack" button
#        And I wait for 2 seconds
#        When I flip the backend switch
#        And I click the "Back" button
#            Then "OpenStack" backend should be "Enabled"

#    @web
#    Scenario: Rename Backend
#        When I click the "OpenStack" button
#        And I wait for 2 seconds
#        And I change the name of the backend to "Renamed Backend"
#        And I wait for 2 seconds
#        And I click the "Back" button
#            Then I should see the "Renamed Backend" Backend added within 30 seconds