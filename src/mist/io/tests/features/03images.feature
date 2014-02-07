@images
Feature: Images

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"


    @web
    Scenario: Star Image
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "EC2 AP NORTHEAST" button
        And I use my "EC2" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "EC2 AP NORTHEAST" Backend added within 30 seconds

        When I click the "Images" button
        And I star a "SUSE" image
        And I visit mist.io
        And I click the "Images" button
            Then the first/second image should be "SUSE"


    @web
    Scenario: Advance Search - Star Image
        When I click the "Images" button
        And I type "django" in images search box
        And I click the "Continue search on server..." button
            Then I should see "django" images within 30 seconds
        When I star a "django" image
        And I visit mist.io
        And I click the "Images" button
            Then the first/second image should be "django"

        
