@backends
Feature: Add second-tier backends

  Background:
    Given backends credentials
    When I visit mist.io

  @all-backends
  Scenario Outline:
    When I click the "Add backend" button
    And I click the button that contains "Select provider"
    And I click the "<provider>" button
    And I use my "<credentials>" credentials
    And I click the "Add" button
    Then the "<provider>" backend should be added within 30 seconds

    Examples: Providers
    | provider             | credentials  |
    | Linode               | LINODE       |
    | Rackspace DFW        | RACKSPACE    |
    | SoftLayer            | SOFTLAYER    |
    | NephoScale           | NEPHOSCALE   |
    | Docker               | DOCKER       |
    | HP Cloud US East     | HP           |

    @backend-actions
    Scenario: Backend Actions
      Given "Rackspace DFW" backend added

    When I click the "Rackspace DFW" button
    And I rename the backend to "Renamed"
    And I click the "Back" button inside the "Edit backend" popup
    Then the "Renamed" backend should be added within 3 seconds

    When I click the "Renamed" button
    And I click the "Delete" button
    And I click the "Yes" button
    Then the "Renamed" backend should be deleted