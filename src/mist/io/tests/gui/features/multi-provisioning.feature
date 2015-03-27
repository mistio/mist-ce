@multi-provisioning
Feature: Machines

  Background:
    Given clouds credentials
    When I visit mist.io

  @machines-linode
  Scenario: Machine Actions Linode
    Given "Linode" cloud added
    Then Images counter should be greater than 0 within 80 seconds
    When I click the button that contains "Machines"
    And I click the "Create" button
    And I fill in a random machine name
    And I click the "Select Provider" button inside the "Create Machine" panel
    And I click the "Linode" button inside the "Create Machine" panel
    And I click the "Select Image" button inside the "Create Machine" panel
    And I click the "Ubuntu 14.04" button inside the "Create Machine" panel
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "Linode 1024" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "Dallas" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    And I fill "randomly_created" as key name
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
    And I click the "Power" button
    And I click the "Reboot" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "running" within 200 seconds

    When I click the "Power" button
    And I click the "Destroy" button
    And I wait for 1 seconds
    And I click the "Yes" button


  @machines-rackspace
  Scenario: Machine Actions Rackspace
    Given "Rackspace ORD" cloud added
    Then Images counter should be greater than 0 within 80 seconds
    When I click the button that contains "Machines"
    And I click the "Create" button
    And I fill in a random machine name
    And I click the "Select Provider" button inside the "Create Machine" panel
    And I click the "Rackspace ORD" button inside the "Create Machine" panel
    And I click the "Select Image" button inside the "Create Machine" panel
    And I click the "Ubuntu 14.04" button inside the "Create Machine" panel
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "512MB" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "Default" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    And I fill "randomly_created" as key name
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 5 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 2 seconds
    And I click the "Launch" button inside the "Create Machine" panel
    Then I should see the "randomly_created" machine added within 10 seconds
    And "randomly_created" machine state should be "running" within 500 seconds
    When I wait for 5 seconds
#    And "randomly_created" machine should be probed within 500 seconds

    When I choose the "randomly_created" machine
    And I click the "Power" button
    And I click the "Reboot" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "running" within 200 seconds

    When I click the "Power" button
    And I click the "Destroy" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "terminated" within 200 seconds


  @machines-softlayer
  Scenario: Machine Actions SoftLayer
    Given "SoftLayer" cloud added
    Then Images counter should be greater than 0 within 80 seconds
    When I click the button that contains "Machines"
    And I click the "Create" button
    And I fill in a random machine name
    And I click the "Select Provider" button inside the "Create Machine" panel
    And I click the "SoftLayer" button inside the "Create Machine" panel
    And I click the "Select Image" button inside the "Create Machine" panel
    And I click the "Ubuntu Linux 14.04 LTS" button inside the "Create Machine" panel
    And I click the "Select Size" button inside the "Create Machine" panel
    And I click the "ram:1024" button inside the "Create Machine" panel
    And I click the "Select Location" button inside the "Create Machine" panel
    And I click the "Amsterdam" button inside the "Create Machine" panel
    And I click the "Select Key" button inside the "Create Machine" panel
    And I click the "Add Key" button inside the "Create Machine" panel
    And I fill "randomly_created" as key name
    And I click the "Generate" button inside the "Add key" popup
    And I wait for 5 seconds
    And I click the "Add" button inside the "Add key" popup
    And I wait for 2 seconds
    And I click the "Launch" button inside the "Create Machine" panel
    Then I should see the "randomly_created" machine added within 10 seconds
    And "randomly_created" machine state should be "running" within 500 seconds
    When I wait for 5 seconds
#    And "randomly_created" machine should be probed within 500 seconds

    When I choose the "randomly_created" machine
    And I click the "Power" button
    And I click the "Reboot" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "running" within 200 seconds

    When I click the "Power" button
    And I click the "Destroy" button
    And I wait for 1 seconds
    And I click the "Yes" button
    Then "randomly_created" machine state should be "terminated" within 200 seconds
