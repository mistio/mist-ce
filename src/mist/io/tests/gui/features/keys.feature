@keys
Feature: Actions for Keys

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load

  @keys-actions
  Scenario: Add Key
    When I click the button "Keys"
    When I click the button "Add"
    And I fill "FirstKey" as key name
    And I wait for 2 seconds
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 9 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 7 seconds
    Then "FirstKey" key should be added within 15 seconds

  @keys-actions
  Scenario: Rename Key
    Then Keys counter should be greater than 0 within 10 seconds
    When I click the button "Keys"
    And I click the button "FirstKey"
    And I click the button "Rename"
    And I fill "RenamedFirstKey" as new key name
    And I click the "Save" button inside the "Rename key" popup
    And I click the button "Keys"
    Then "RenamedFirstKey" key should be added within 5 seconds

  @keys-actions
  Scenario: Delete Key
    Then Keys counter should be greater than 0 within 10 seconds
    When I click the button "Keys"
    And I click the button "RenamedFirstKey"
    And I click the button "Delete"
    And I click the button "Yes"
    Then "RenamedFirstKey" key should be deleted
