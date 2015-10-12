@images
Feature: Actions for Images

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" backend has been added

  Scenario: Star image from Advanced search
    When I visit the Images page after the counter has loaded
    Then there should be starred Images
    When I search for a "django" Image
    And I wait for 2 seconds
    And I click the button "Load more"
    Then Images list should be loaded within 60 seconds
#    When I star an Image that contains "django"
#    And I clear the Images search bar
#    Then Images list should be loaded within 30 seconds
#    And an Image that contains "django" should be starred