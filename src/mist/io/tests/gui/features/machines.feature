@machines
Feature: Machines

  Scenario: Create machine from Panel and from Image
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" cloud has been added

    When I visit the Machines page after the Images counter has loaded
    When I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "Name"
    And I click the button "None"
    And I wait for 2 seconds
    And I check the sorting by "name"
    Then I expect for "select-machines-btn" to be clickable within max 2 seconds
    When I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "State"
    And I click the button "None"
    And I wait for 2 seconds
    And I check the sorting by "state"
    Then I expect for "select-machines-btn" to be clickable within max 10 seconds
    When I click the button by "select-machines-btn" id_name
    Then I expect for "select-machines-popup-popup" popup to appear within max 5 seconds
    When I click the button "Cloud"
    And I click the button "None"
    And I wait for 2 seconds
    And I check the sorting by "cloud"
    Then I click the button "Home"

    When I visit the Images page after the counter has loaded
    Then there should be starred Images
    When I search for the "ubuntu" Image
    Then the images list should be loaded within 60 seconds
    Then I scroll down until all starred images appear
    When I focus on the "Ubuntu Server 14.04 LTS (PV)" button
    And I click the button "Ubuntu Server 14.04 LTS (PV)"
    Then I expect for "single-image-page" page to appear within max 4 seconds
    And I click the button "Create Machine"
    When I fill in a "random second" machine name
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "Micro Instance" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "ap-northeast-1a" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    Then I expect for "key-add-popup" popup to appear within max 4 seconds
    When I fill "second_machine_key" as key name
    And I click the "Generate" button inside the "Add key" popup
    Then I expect for "key-generate-loader" loader to finish within max 10 seconds
    When I click the "Add" button inside the "Add key" popup
    Then I expect for "key-add-popup" popup to disappear within max 4 seconds
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 4 seconds
    When I click the button "Images"
    Then I expect for "image-list-page" page to appear within max 4 seconds
    When I click the button "Home"
    Then I expect for "home-page" page to appear within max 4 seconds
    When I visit the Machines page after the counter has loaded
    And I search for the "second" Machine
    Then I should see the "second" machine added within 30 seconds
    When I clear the machines search bar

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
    And I type "touch ~/kati" in input with id "create-machine-script"
    When I click the "Launch" button inside the "Create Machine" panel
    Then I expect for "create-machine" panel to disappear within max 4 seconds
    Then I search for the "first" Machine
    Then I should see the "first" machine added within 30 seconds

    When I clear the machines search bar
    Then I search for the "second" Machine
    And I wait for 1 seconds
    Then "second" machine state should be "running" within 200 seconds
    When I choose the "second" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Reboot" button inside the "Actions" popup
    Then I expect for "dialog-popup" modal to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" modal to disappear within max 4 seconds

    When I clear the machines search bar
    Then I search for the "first" Machine
    And I wait for 1 seconds
    Then "first" machine state should be "running" within 200 seconds

    And I click the button "first"
    Then I expect for "single-machine-page" page to appear within max 5 seconds
    When I click the button "Tags"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    And I remove all the previous tags
    When I name a "testKey" key and a "testValue" value for a tag
    And I click the button "Save tags"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 20 seconds
    And I wait for 1 seconds
    When I wait for max 20 seconds until tag with key "testKey" and value "testValue" is available
    Then I wait for 1 seconds
    And I click the button "Tags"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    When I click the button "Add Item"
    And I name a "secTestKey" key and a "secTestValue" value for a tag
    And I click the button "Save Tags"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 20 seconds
    And I wait for 1 seconds
    When I wait for max 20 seconds until tag with key "secTestKey" and value "secTestValue" is available
#    When I check if the "secTestKey" key and "secTestValue" value appear for the machine
    And I click the button "Tags"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    And I close the tag with key "secTestKey"
    When I click the button "Save Tags"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 20 seconds
    And I wait for 1 seconds
    When I wait for max 20 seconds until tag with key "testKey" and value "testValue" is available
    When I focus on the "Machines" button
    Then I click the button "Machines"
    When I clear the machines search bar
    Then I search for the "first" Machine
    And I wait for 1 seconds
    Then the "first" machine in the list should have a tag with key "testKey" and value "testValue"

    When I choose the "first" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Destroy" button inside the "Actions" popup
    Then I expect for "dialog-popup" modal to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" modal to disappear within max 4 seconds
    And I wait for 1 seconds
    When I choose the "first" machine

    When I clear the machines search bar
    Then I search for the "second" Machine
    And I wait for 1 seconds
    When I choose the "second" machine
    And I click the button "Actions"
    Then I expect for "machine-power-popup-popup" popup to appear within max 4 seconds
    When I click the "Destroy" button inside the "Actions" popup
    Then I expect for "dialog-popup" modal to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" modal to disappear within max 4 seconds
    And I wait for 1 seconds
    When I choose the "second" machine

    When I clear the machines search bar
    Then I search for the "first" Machine
    And I wait for 1 seconds
    And "first" machine state should be "terminated" within 200 seconds

    When I clear the machines search bar
    Then I search for the "second" Machine
    And "second" machine state should be "terminated" within 200 seconds

    When I click the button "Home"
    Then I expect for "home-page" page to appear within max 4 seconds
    When I visit the Keys page after the counter has loaded
    When I click the button "first_machine_key"
    Then I expect for "single-key-page" page to appear within max 4 seconds
    When I click the button "Delete"
    Then I expect for "dialog-popup" modal to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" modal to disappear within max 4 seconds
    Then I wait for 2 seconds
    And "first_machine_key" key should be deleted
    When I click the button "second_machine_key"
    Then I expect for "single-key-page" page to appear within max 4 seconds
    When I click the button "Delete"
    Then I expect for "dialog-popup" modal to appear within max 4 seconds
    When I click the button "Yes"
    Then I expect for "dialog-popup" modal to disappear within max 4 seconds
    And "second_machine_key" key should be deleted

    When I wait for 4 seconds
