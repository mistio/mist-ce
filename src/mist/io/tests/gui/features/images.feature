@images
Feature: Actions for Images

  Background:
    Given backends credentials
    When I visit mist.io
    Given "EC2" backend added

  Scenario: Star image from Advanced search
    When I click the button that contains "Images"
    Then Images list should be loaded within 30 seconds
    And there should be starred Images
    When I search for a "django" Image
    And I click the button that contains "Continue search on server"
    Then Images list should be loaded within 60 seconds

#    When I star an Image that contains "django"
#    And I clear the Images search bar
#    Then Images list should be loaded within 30 seconds
#    And an Image that contains "django" should be starred