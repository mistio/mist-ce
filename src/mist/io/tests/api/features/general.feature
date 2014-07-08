Feature: API Tests

  Scenario: General testing scenario
    When I list backends
    Then I should see "EC2 AP NORTHEAST" backend