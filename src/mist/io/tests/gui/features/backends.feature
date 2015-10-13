@backends
Feature: Add second-tier backends

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load

  @all-backends
  Scenario Outline:
    When I click the button "Add cloud"
    Then I expect for "new-backend-provider" panel to appear within max 2 seconds
    And I click the button "<provider>"
    And I expect for "new-backend-provider" panel to disappear within max 2 seconds
    Then I expect for "add-backend" panel to appear within max 2 seconds
    When I use my "<credentials>" credentials
    And I click the button "Add"
    Then the "<provider>" backend should be added within 60 seconds
#    And I wait for 3 seconds

    Examples: Providers
    | provider              | credentials  |
    | Azure                 | AZURE        |
    | DigitalOcean          | DIGITALOCEAN |
    | GCE                   | GCE          |
    | HP Helion Cloud       | HP           |
    | Linode                | LINODE       |
    | NephoScale            | NEPHOSCALE   |
    | Rackspace             | RACKSPACE    |
    | SoftLayer             | SOFTLAYER    |
    | EC2                   | EC2          |
#    | VMware vCloud         | VMWARE       |
#    | Indonesian Cloud      | INDONESIAN   |
#    | KVM (via libvirt)     | LIBVIRT      |
#    | OpenStack             | OPENSTACK    |
#    | Docker                | DOCKER       |

  @backend-rename
  Scenario: Backend Actions
    Given "Rackspace" backend has been added
    When I click the button "Rackspace"
    Then I expect for "backend-edit-popup" popup to appear within max 2 seconds
    When I rename the backend to "Renamed"
    And I click the "OK" button inside the "Edit cloud" popup
    When I click the "_x_" button inside the "Edit cloud" popup
    Then I expect for "backend-edit-popup" popup to disappear within max 2 seconds
    And the "Renamed" backend should be added within 3 seconds

  @backend-delete
  Scenario: Backend Actions
    Given "EC2" backend has been added
    When I click the button "EC2"
    Then I expect for "backend-edit-popup" popup to appear within max 2 seconds
    And I click the button "Delete"
    And I click the button "Yes"
    Then I expect for "backend-edit-popup" popup to disappear within max 2 seconds
    Then the "EC2" backend should be deleted
