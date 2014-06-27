@machines
Feature: Machines

  Background:
    Given backends credentials
    When I visit mist.io
    Given "EC2 AP NORTHEAST" backend added

  Scenario: Create Machine
    Then Images counter should be greater than 0 within 80 seconds
    When I click the button that contains "Machines"
    And I click the "Create" button
    And I fill in a random machine name
    And I click the "Select Provider" button inside the "Create Machine" panel
    And I click the "EC2 AP NORTHEAST" button inside the "Create Machine" panel
    And I click the "Select Image" button inside the "Create Machine" panel
    And I click the "Ubuntu Server" button inside the "Create Machine" panel
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "Micro Instance" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "ap-northeast-1a" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    And I fill "TESTLIKEAPROKEY" as key name
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 5 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 2 seconds
    And I click the "Launch" button inside the "Create Machine" panel
    Then I should see the "randomly_created" machine added within 30 seconds