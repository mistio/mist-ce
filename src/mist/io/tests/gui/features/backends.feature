@backends
Feature: Add second-tier backends

  Background:
    Given backends credentials
    When I visit mist.io

  @all-backends
  Scenario Outline:
    When I click the "Add cloud" button
    And I click the button that contains "Select provider"
    And I click the "<provider>" button
    And I wait for 1 seconds
    And I use my "<credentials>" credentials
    And I click the "Add" button
    Then the "<provider>" backend should be added within 30 seconds

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

    @backend-actions
    Scenario: Backend Actions
      Given "Rackspace" backend added

      When I click the "Rackspace" button
      And I rename the backend to "Renamed"
      And I wait for 1 seconds
      And I click the "Back" button inside the "Edit cloud" popup
      Then the "Renamed" backend should be added within 3 seconds

      When I click the "Renamed" button
      And I click the "Delete" button
      And I click the "Yes" button
      Then the "Renamed" backend should be deleted
