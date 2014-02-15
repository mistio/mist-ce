@keys
Feature: Keys

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"


    @web
    Scenario: Create Key
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Add" button
        And I type "tester" as key name
        And I click the "Generate" button
        And I wait for 5 seconds
        And I click the "Add" button within "add-key-popup" panel
        And I wait for 5 seconds
            Then I should see the "tester" Key added within 10 seconds


    @web
    Scenario: Rename Key
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "tester" Key
        And I click the "Rename" button
        And I fill in "RenamedKey" as Key name
        And I click the "Save" button
        And I click the "Keys" button
        And I wait for 5 seconds
            Then I should see the "RenamedKey" Key added within 10 seconds


    @web
    Scenario: Add second key and make default
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Add" button
        And I type "SecondKey" as key name
        And I wait for 2 seconds
        And I click the "Generate" button
        And I wait for 5 seconds
        And I click the "Add" button within "add-key-popup" panel
        And I wait for 5 seconds
            Then I should see the "SecondKey" Key added within 10 seconds

        When I check the "SecondKey" key
        And I click the "Set default" button
        And I wait for 1 seconds
            Then "SecondKey" should be the default key


    @web
    Scenario: Delete all keys
        When i click the "Keys" button
        And I wait for 2 seconds
        When I check the "SecondKey" key
        And I click the "Delete" button
        And I click the "Yes" button
        And I wait for 1 seconds