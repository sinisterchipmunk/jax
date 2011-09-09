Feature: Shaders
  
  Scenario: Detect new shaders without reloading app
    Given shader "water" exists
      And I visit "/assets/shaders/all.js"
    When shader "other" exists
      And I visit "/assets/shaders/all.js"
    Then I should see:
      """
      shader_data("other")["vertex"]
      """
