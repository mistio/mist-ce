@machines
Feature: Machines

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" backend has been added

  @machines-ec2
  Scenario: Machine Actions EC2
    When I visit the Machines page after the counter has loaded
    And I click the button "Create Machine"
    Then I expect for "create-machine" panel to appear within max 2 seconds
    When I fill in a random machine name
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
    Then I expect for "key-add-popup" popup to appear within max 2 seconds
    When I fill "randomly_created" as key name
    And I click the "Generate" button inside the "Add key" popup
    Then I expect for "key-generate-loader" loader to finish within max 5 seconds
    When I click the "Add" button inside the "Add key" popup
    Then I expect for "key-add-popup" popup to disappear within max 2 seconds
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 2 seconds
    And I search for the "randomly_created" Machine
    Then I should see the "randomly_created" machine added within 20 seconds
    And "randomly_created" machine state should be "running" within 400 seconds
    When I wait for 5 seconds

    When I choose the "randomly_created" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 2 seconds
    When I click the button "Reboot"
    Then I expect for "dialog-popup" popup to appear within max 2 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 2 seconds
    And "randomly_created" machine state should be "running" within 200 seconds

    When I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 2 seconds
    When I click the button "Destroy"
    Then I expect for "dialog-popup" popup to appear within max 2 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 2 seconds
    Then "randomly_created" machine state should be "terminated" within 200 seconds

  @machine-probing
  Scenario: Machine probing
    When I visit the Machines page after the counter has loaded
    And I click the button "sshtesting"
    Then I expect for "single-machine-page" page to appear within max 2 seconds
    Given ssh key with name "TESTING_MACHINE" is added
    Then I click the button "Probe"
    And I wait for probing to finish for 100 seconds max
    And probing was successful

  @machine-ssh
  Scenario: Connect with ssh
    When I visit the Machines page after the counter has loaded
    And I click the button "sshtesting"
    Then I expect for "single-machine-page" page to appear within max 2 seconds
    Given ssh key with name "TESTING_MACHINE" is added
    Then I click the button "Shell"
    And I test the ssh connection
    And I wait for 1 seconds
