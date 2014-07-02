@keys
Feature: Actions for Keys

  Background:
    When I visit mist.io

  @keys-actions
  Scenario: Add Key
    When I click the button that contains "Keys"
    When I click the "Add" button
    And I fill "FirstKey" as key name
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 5 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 5 seconds
    Then "FirstKey" key should be added within 5 seconds

  @keys-actions
  Scenario: Rename Key
    When I click the button that contains "Keys"
    When I click the button that contains "FirstKey"
    And I click the "Rename" button
    And I fill "RenamedFirstKey" as new key name
    And I click the "Save" button inside the "Rename key" popup
    And I click the "Keys" button
    Then "RenamedFirstKey" key should be added within 5 seconds

  @keys-actions
  Scenario: Delete Key
    When I click the button that contains "Keys"
    When I click the button that contains "RenamedFirstKey"
    And I click the "Delete" button
    And I click the "Yes" button
    Then "RenamedFirstKey" key should be deleted

  @key-association
  Scenario: Key association to machine
    Given backends credentials
    Given "EC2 AP NORTHEAST" backend added