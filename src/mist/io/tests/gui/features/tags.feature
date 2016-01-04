@tags
Feature: Tags

  Background:
    When I visit mist.io
    Then I wait for the mist.io splash page to load
    Given "EC2" cloud has been added


  @create-tag
  Scenario:Create a tag
    When I visit the Machines page after the counter has loaded
    And I click the button "mytestmonitor2"
    Then I expect for "single-machine-page" page to appear within max 5 seconds
    When I click the button "TAGS"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    When I check the machine for previous tags
    And I click the button "SAVE TAGS"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 30 seconds
    When I click the button "TAGS"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    When I name a "mykey" key and a "myvalue" value for a tag
    And I click the button "SAVE TAGS"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 30 seconds
    When I check if the "mykey" key and "myvalue" value appear for the machine
    And I click the button "TAGS"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    When I click the button "ADD ITEM"
    And I name a "seckey" key and a "secvalue" value for a tag
    #And I click the button "ADD ITEM"
    And I click the button "SAVE TAGS"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 30 seconds
    When I check if the "seckey" key and "secvalue" value appear for the machine
    And I click the button "TAGS"
    Then I expect for "machine-tags-popup-popup" popup to appear within max 10 seconds
    And I close one of my tags
    And I close one of my tags
    When I click the button "SAVE TAGS"
    Then I expect for "machine-tags-popup-popup" popup to disappear within max 10 seconds
    And I wait for 3 seconds

