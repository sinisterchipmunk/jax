@rails
Feature: Shaders
  
  Scenario: Detect new shaders without reloading app
    Given shader "water" exists
      And I visit "/assets/jax.js"
      # necessary to make sure 'shader' directories' mtimes are updated
      And I wait
    When shader "other" exists
      And I visit "/assets/jax.js"
    Then I should see:
      """
      shader_data("other")["vertex"]
      """
