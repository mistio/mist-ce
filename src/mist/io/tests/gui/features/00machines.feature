@machines
Feature: Machines

  Background:
    Given backends credentials
    When I visit mist.io

  @machines-ec2
  Scenario: Machine Actions EC2
    Given "EC2" backend added
    Then Images counter should be greater than 0 within 80 seconds
    When I click the button that contains "Machines"
    And I click the "Create" button
    And I fill in a random machine name
    And I click the "Select Provider" button inside the "Create Machine" panel
    And I click the "EC2" button inside the "Create Machine" panel
    And I click the "Select Image" button inside the "Create Machine" panel
    And I click the "Ubuntu Server" button inside the "Create Machine" panel
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "Micro Instance" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "ap-northeast-1a" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    And I fill "randomly_created" as key name
    And I wait for 1 seconds
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 5 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 2 seconds
    And I click the "Launch" button inside the "Create Machine" panel
    Then I should see the "randomly_created" machine added within 10 seconds
    And "randomly_created" machine state should be "running" within 400 seconds
    When I wait for 5 seconds
#    And "randomly_created" machine should be probed within 400 seconds

    When I choose the "randomly_created" machine
    And I click the "Actions" button
    And I wait for 1 seconds
    And I click the "Reboot" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "running" within 200 seconds

    When I click the "Actions" button
    And I wait for 1 seconds
    And I click the "Destroy" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "terminated" within 200 seconds
