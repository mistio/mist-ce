@images
Feature: Actions for Images

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" cloud has been added

  Scenario: Star image from Advanced search
    When I visit the Images page after the counter has loaded
    Then there should be starred Images
    When I search for the "bitnami" Image
    And I click the button "Load more"
    Then Images list should be loaded within 60 seconds
    When I star an Image that contains "bitnami"
    And I clear the Images search bar
    Then Images list should be loaded within 30 seconds
#    When I search for the "bitnami" Image
#    And I wait for 100 seconds
#    Then an image that contains "the_name_that_i_used_before" should be starred
#    And I unstar the image that contains "the_name_that_i_used_before"
#    And there should be 1 unstarred images