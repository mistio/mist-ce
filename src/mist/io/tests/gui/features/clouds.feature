@clouds
Feature: Add second-tier clouds

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load

  @all-clouds
  Scenario Outline:
    When I click the button "Add cloud"
    Then I expect for "new-cloud-provider" panel to appear within max 2 seconds
    And I click the button "<provider>"
    And I expect for "new-cloud-provider" panel to disappear within max 2 seconds
    Then I expect for "cloud-add-fields" to be visible within max 2 seconds
    When I use my "<credentials>" credentials
    And I click the button "Add"
    Then the "<provider>" cloud should be added within 60 seconds
#    And I wait for 3 seconds

    Examples: Providers
    | provider              | credentials  |
    | Azure                 | AZURE        |
    | GCE                   | GCE          |
    | DigitalOcean          | DIGITALOCEAN |
    | Rackspace             | RACKSPACE    |
    | SoftLayer             | SOFTLAYER    |
    | EC2                   | EC2          |
    | NephoScale            | NEPHOSCALE   |
#    | Linode                | LINODE       |
    | Packet.net            | PACKET       |
#    | VMware vCloud         | VMWARE       |
#    | Indonesian Cloud      | INDONESIAN   |
#    | KVM (via libvirt)     | LIBVIRT      |
#    | OpenStack             | OPENSTACK    |
#    | Docker                | DOCKER       |

  @cloud-rename
  Scenario: Cloud Actions
    Given "Rackspace" cloud has been added
    When I click the button "Rackspace"
    Then I expect for "cloud-edit-popup" popup to appear within max 2 seconds
    When I rename the cloud to "Renamed"
    And I click the "OK" button inside the "Edit cloud" popup
    When I click the "_x_" button inside the "Edit cloud" popup
    Then I expect for "cloud-edit-popup" popup to disappear within max 2 seconds
    And the "Renamed" cloud should be added within 3 seconds

  @cloud-delete
  Scenario: Cloud Actions
    Given "EC2" cloud has been added
    When I click the button "EC2"
    Then I expect for "cloud-edit-popup" popup to appear within max 2 seconds
    And I click the button "Delete"
    And I click the button "Yes"
    Then I expect for "cloud-edit-popup" popup to disappear within max 2 seconds
    Then the "EC2" cloud should be deleted
