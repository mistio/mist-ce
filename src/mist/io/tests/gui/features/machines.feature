@machines
Feature: Machines

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" cloud has been added

  @machine-creation
  Scenario: Machine Actions EC2
    When I visit the Machines page after the counter has loaded
    And I click the button "Create Machine"
    Then I expect for "create-machine" panel to appear within max 4 seconds
    When I fill in a "randomly_created" machine name
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
    Then I expect for "key-add-popup" popup to appear within max 4 seconds
    When I fill "randomly_created_machine_key" as key name
    And I click the "Generate" button inside the "Add key" popup
    Then I expect for "key-generate-loader" loader to finish within max 10 seconds
    When I click the "Add" button inside the "Add key" popup
    Then I expect for "key-add-popup" popup to disappear within max 4 seconds
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 4 seconds
    And I search for the "randomly_created" Machine
    Then I should see the "randomly_created" machine added within 30 seconds
    And "randomly_created" machine state should be "running" within 400 seconds

    When I choose the "randomly_created" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Reboot" button inside the "Actions" popup
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
    And "randomly_created" machine state should be "running" within 200 seconds

    When I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the button "Destroy"
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
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


  @machines-sorting
  Scenario: Make sorting
    When I visit the Machines page after the counter has loaded
    And I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "NAME"
    And I click the button "NONE"
    And I check the sorting by "name"
    Then I expect for "select-machines-btn" to be clickable within max 2 seconds
    When I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "STATE"
    And I click the button "NONE"
    And I check the sorting by "state"
    Then I expect for "select-machines-btn" to be clickable within max 10 seconds
    When I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "CLOUD"
    And I click the button "NONE"
    And I check the sorting by "cloud"
    And I wait for 3 seconds



  @machines-complete-test
  Scenario: Create machine from Panel and from Image
    When I visit the Images page after the counter has loaded
    Then there should be starred Images
    When I search for the "ubuntu" Image
    Then Images list should be loaded within 60 seconds
    When I click the button "Ubuntu Server 14.04 LTS (PV)"
    Then I expect for "single-image-page" page to appear within max 2 seconds
    And I click the button "Create Machine"
    When I fill in a "random second" machine name
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "Micro Instance" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "ap-northeast-1a" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    Then I expect for "key-add-popup" popup to appear within max 2 seconds
    When I fill "second_machine_key" as key name
    And I click the "Generate" button inside the "Add key" popup
    Then I expect for "key-generate-loader" loader to finish within max 10 seconds
    When I click the "Add" button inside the "Add key" popup
    Then I expect for "key-add-popup" popup to disappear within max 2 seconds
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 2 seconds
    When I click the button "IMAGES"
    Then I expect for "image-list-page" page to appear within max 2 seconds
    When I click the button "HOME"
    Then I expect for "home-page" page to appear within max 2 seconds
    When I click the button "MACHINES"
    Then I expect for "machine-list-page" page to appear within max 2 seconds
    And I search for the "second" Machine
    Then I should see the "second" machine added within 30 seconds
    When I clear the machines search bar

    When I click the button "HOME"
    And I click the button "MACHINES"
    Then I expect for "machine-list-page" page to appear within max 2 seconds

    And I click the button "Create Machine"
    Then I expect for "create-machine" panel to appear within max 4 seconds
    When I fill in a "random first" machine name
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
    Then I expect for "key-add-popup" popup to appear within max 4 seconds
    When I fill "first_machine_key" as key name
    And I click the "Generate" button inside the "Add key" popup
    Then I expect for "key-generate-loader" loader to finish within max 10 seconds
    When I click the "Add" button inside the "Add key" popup
    Then I expect for "key-add-popup" popup to disappear within max 4 seconds
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 4 seconds
    Then I search for the "first" Machine
    Then I should see the "first" machine added within 30 seconds

    When I clear the machines search bar
    Then I search for the "second" Machine
    Then "second" machine state should be "running" within 200 seconds
    When I choose the "second" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Reboot" button inside the "Actions" popup
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds

    When I clear the machines search bar
    Then I search for the "first" Machine
    And "first" machine state should be "running" within 200 seconds
    When I choose the "first" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Destroy" button inside the "Actions" popup
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
    When I choose the "first" machine

    When I clear the machines search bar
    Then I search for the "second" Machine
    When I choose the "second" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Destroy" button inside the "Actions" popup
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
    When I choose the "second" machine

    When I clear the machines search bar
    Then I search for the "first" Machine
    And "first" machine state should be "terminated" within 200 seconds

    When I clear the machines search bar
    Then I search for the "second" Machine
    And "second" machine state should be "terminated" within 200 seconds
    When I choose the "second" machine

    When I click the button "HOME"
    And I click the button "KEYS"
    Then I expect for "key-list-page" page to appear within max 2 seconds
    When I click the button "first_machine_key"
    Then I expect for "single-key-page" page to appear within max 4 seconds
    When I click the button "Delete"
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
    And "first_machine_key" key should be deleted
    When I click the button "second_machine_key"
    Then I expect for "single-key-page" page to appear within max 4 seconds
    When I click the button "Delete"
    Then I expect for "dialog-popup" popup to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" popup to disappear within max 4 seconds
    And "second_machine_key" key should be deleted
    When I wait for 2 seconds
