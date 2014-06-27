Feature: Add second-tier backends

  Background:
    Given backends credentials
    When I visit mist.io

  Scenario Outline:
    When I click the "Add backend" button
    And I click the button that contains "Select provider"
    And I click the "<provider>" button
    And I use my "<credentials>" credentials
    And I click the "Add" button
    Then the "<provider>" backend should be added within 30 seconds

    Examples: Providers
    | provider             | credentials  |
    | Rackspace DFW        | RACKSPACE    |
    | SoftLayer            | SOFTLAYER    |
    | HP Cloud US East     | HP           |