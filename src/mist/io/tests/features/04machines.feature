@machines
Feature: Machines

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"

    @web
    @test
    Scenario: Create Machine
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "EC2 AP NORTHEAST" button
        And I use my "EC2" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "EC2 AP NORTHEAST" Backend added within 30 seconds

        Given a key for the machine
        When I visit mist.io
        And I click the "Machines" button
        And I click the "Create" button
        And I type "tester" as machine name
        And I click the "Select Provider" button
        And I click the link with text that contains "EC2"
        And I click the "Select Image" button
        And I click the link with text that contains "Amazon Linux"
        And I click the "Select Size" button
        And I click the link with text that contains "Micro Instance"
        And I click the "Select Location" button
        And I click the link with text that contains "ap-northeast"
        And I click the "Select Key" button
        And I click the link with text that contains "$key_name"
        And I click the "Launch!" button
        And I wait for 2 seconds
            Then "$machine_name" state should be "pending" within 60 seconds
        When I wait for 1 seconds
            Then "$machine_name" state should be "running" within 400 seconds
        When I wait for 1 seconds
            Then "$machine_name" should be probed within 400 seconds
        When I wait for 1 seconds


    @web
    Scenario: Add Bare Metal
        When I click the "Machines" button
        And I wait for 2 seconds
        And I click the "tester" machine
        And I click the "Basic Info" button
            Then I should find the Public IP

        When I visit mist.io
            Then I should see "mist.io"
        When I click the "Add backend" button
        And I click the "Select provider" button
        And I click the link with text that contains "Bare Metal"
        And I add my bare metal creds
        And I click the "Select SSH Key" button
        And I wait for 1 seconds
        And I click the link with text that contains "$key_name"
        And I click the "Add" button
        And I wait for 4 seconds
            Then I should see the Bare Metal Backend added within 30 seconds


    @web
    Scenario: Associate Second Key
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Add" button
        And I type "SecondKey" as key name
        And I click the "Generate" button
        And I click the "Done" button
            Then I should see the "SecondKey" Key added within 5 seconds

        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        When I click the "Machines" button
        And I wait for 3 seconds
        And I click the "tester" machine
        And I wait for 5 seconds
        And I click the "1 keys" button
        And I click the "Associate" button
        And I wait for 2 seconds
        And I click the "SecondKey" button
        And I wait for 5 seconds
            Then I should see 2 keys associated within 30 seconds


    @web
    Scenario: Disassociate Second Key
        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        When I click the "Machines" button
        And I wait for 3 seconds
        And I click the "tester" machine
        And I wait for 5 seconds
        And I click the "2 keys" button
        And I wait for 1 seconds
        And I click the "SecondKey" from the associated keys
        And I click the "Remove" button
        And I wait for 2 seconds
            Then I should see 1 keys associated within 30 seconds


    @web
    Scenario: Shutdown Machine
        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        And I click the "Machines" button
        And I wait for 3 seconds
        And I tick the "tester" machine
        And I click the "Power" button
        And I click the "Shutdown" button
        And I wait for 1 seconds
        And I click the "Yes" button
            Then "tester" state should be "stopped" within 60 seconds


    @web
    Scenario: Start Machine
        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        And I click the "Machines" button
        And I wait for 3 seconds
        And I tick the "tester" machine
        And I click the "Power" button
        And I click the "Start" button
        And I wait for 1 seconds
        And I click the "Yes" button
        And I wait for 2 seconds
            Then "tester" state should be "pending" within 70 seconds
        When I wait for 1 seconds
            Then "tester" state should be "running" within 400 seconds


    @web
    @test
    Scenario: Reboot Machine
        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        And I click the "Machines" button
        And I wait for 3 seconds
        And I tick the "tester" machine
        And I click the "Power" button
        And I click the "Reboot" button
        And I wait for 1 seconds
        And I click the "Yes" button
        And I wait for 2 seconds
            Then "tester" state should be "rebooting" within 70 seconds
        When I wait for 1 seconds
            Then "tester" state should be "running" within 400 seconds


    @web
    @test
    Scenario: Destroy Machine
        When I visit mist.io
            Then I should see "mist.io"
        When I wait for 2 seconds
        And I click the "Machines" button
        And I wait for 3 seconds
        And I tick the "tester" machine
        And I click the "Power" button
        And I click the "Destroy" button
        And I wait for 1 seconds
        And I click the "Yes" button
        And I wait for 2 seconds
            Then "tester" state should be "stopped" within 70 seconds
        When I wait for 1 seconds
            Then "tester" state should be "terminated" within 400 seconds