@shell
Feature: Shell

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "ShellTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"


    @web
    Scenario: Create Machine For Monitoring
        When I click the "Add backend" button
        And I wait for 1 seconds
        And I click the "Select provider" button
        And I wait for 1 seconds
        And i click the "EC2 AP NORTHEAST" button
        And I wait for 1 seconds
        And I use my "EC2" credentials
        And I wait for 1 seconds
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "EC2 AP NORTHEAST" Backend added within 30 seconds

        When I visit mist.io
        And I click the "Machines" button
        And I click the "Create" button
        And I type "shell_tester" as machine name
        And I wait for 1 seconds
        And I click the "Select Provider" button
        And I wait for 1 seconds
        And I click the "EC2 AP NORTHEAST" button within "create-machine-panel" panel
        And I wait for 1 seconds
        And I click the "Select Image" button
        And I wait for 1 seconds
        And I click the link with text that contains "Amazon Linux"
        And I wait for 1 seconds
        And I click the "Select Size" button
        And I wait for 1 seconds
        And I click the link with text that contains "Micro Instance"
        And I wait for 1 seconds
        And I click the "Select Location" button
        And I wait for 1 seconds
        And I click the "ap-northeast-1a" button within "create-machine-panel" panel
        And I wait for 1 seconds
        And I click the "Select Key" button
        And I wait for 1 seconds
        And I click the "Add Key" button
        And I type "shell_tester" as key name
        And I wait for 2 seconds
        And I click the "Generate" button
        And I wait for 5 seconds
        And I click the "Add" button
        And I wait for 2 seconds
        And I click the "Launch!" button
        And I wait for 2 seconds
            Then "shell_tester" state should be "pending" within 60 seconds
        When I wait for 10 seconds
            Then "shell_tester" state should be "running" within 400 seconds
        When I wait for 30 seconds
            Then "shell_tester" should be probed within 400 seconds
        When I wait for 1 seconds

        When I click the "shell_tester" machine
        And I wait for 2 seconds
        And I click the "Shell" button
        And I type the "who" shell command
        And I wait for 1 seconds
            Then I should see the "who" result in shell output
        When I wait for 2 seconds
        And I type the "w" shell command
        And I wait for 1 seconds
            Then I should see the "w" result in shell output
            Then I should see the "who" result in shell output