@backends
Feature: Backends

    Background:
        Given PhantomJS as the default browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"

    @web
    @test
    Scenario Outline:
        When I click the link with text "Add backend"
        And I click the link with text "Select provider"
        And i click the link with text "<provider>"
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


#COMMENTED OUT SCENARIOS
#
#
#####Commented out cause phantomjs does not recognize Delete button
#    @web
#    @ec2-backend
#    Scenario: Delete Backend
#        When I click the "EC2 AP NORTHEAST" button
#            Then I should see an element with id "edit-backend-popup" within 3 seconds
#        When I press "Delete"
#        And I click the "Yes" button
#            Then I should see the "EC2 AP NORTHEAST" Backend deleted within 30 seconds