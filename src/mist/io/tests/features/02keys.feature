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
        And I click the "Create" button
        And I type a key name
        And I click the "Generate" button
        And I click the "Done" button
            Then I should see the "tester" Key added within 5 seconds


    @web
    Scenario: Rename Key
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "tester" Key
        And I click the "Rename" button
        And I fill in "RenamedKey" as Key name
        And I click the "Save" button
        And I click the "Keys" button
        And I wait for 2 seconds
            Then I should see the "RenamedKey" Key added within 5 seconds
