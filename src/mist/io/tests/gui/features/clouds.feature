@clouds
Feature: Add second-tier clouds

  Background:
    Given clouds credentials
    When I visit mist.io

  @all-clouds
  Scenario Outline:
    When I click the "Add cloud" button
    And I click the button that contains "Select provider"
    And I click the "<provider>" button
    And I wait for 1 seconds
    And I use my "<credentials>" credentials
    And I click the "Add" button
    Then the "<provider>" cloud should be added within 30 seconds

    Examples: Providers
    | provider              | credentials  |
    | Azure                 | AZURE        |
    | DigitalOcean          | DIGITALOCEAN |
    | Google Compute Engine | GCE          |
    | HP Helion Cloud       | HP           |
    | Linode               | LINODE       |
    | NephoScale           | NEPHOSCALE   |
#    | OpenStack            | OPENSTACK    |
    | Rackspace            | RACKSPACE    |
    | SoftLayer            | SOFTLAYER    |
    | VMware vCloud        | VMWARE       |
    | Indonesian Cloud     | INDONESIAN   |
#    | EC2                  | EC2          |
#    | Docker               | DOCKER       |
    | KVM (via libvirt)    | LIBVIRT      |

    @cloud-actions
    Scenario: Cloud Actions
      Given "Rackspace" cloud added

      When I click the "Rackspace" button
      And I rename the cloud to "Renamed"
      And I wait for 1 seconds
      And I click the "Back" button inside the "Edit cloud" popup
      Then the "Renamed" cloud should be added within 3 seconds

      When I click the "Renamed" button
      And I click the "Delete" button
      And I click the "Yes" button
      Then the "Renamed" cloud should be deleted
