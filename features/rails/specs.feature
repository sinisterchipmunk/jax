@rails
Feature: Rails Specs

  Scenario: JavaScript spec in Rails
    Given file "spec/javascripts/script.js" contains "1"
    When I visit "/spec/script.js"
    Then I should see "1"

  Scenario: CoffeeScript spec in Rails
    Given file "spec/javascripts/script.js.coffee" contains "2"
    When I visit "/spec/script.js"
    Then I should see "2"

  Scenario: List JS Specs
    # This is used when building the list of specs to include in the suite.
    Given file "spec/javascripts/script_spec.js" contains "1"
    When I visit "/jasmine"
    Then I should see a "script" element with attribute "src" equal to "/spec/script_spec.js"

  Scenario: List CS Specs
    # This is used when building the list of specs to include in the suite.
    Given file "spec/javascripts/script_spec.js.coffee" contains "2"
    When I visit "/jasmine"
    Then I should see a "script" element with attribute "src" equal to "/spec/script_spec.js"
