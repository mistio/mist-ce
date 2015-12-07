Feature: API Tests

  Scenario: General testing scenario
    When I list clouds
    Then I should see "EC2 AP NORTHEAST" cloud