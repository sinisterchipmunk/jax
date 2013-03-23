Feature: Runtime

  Scenario: Default runtime
    Given I am on the WebGL start page
    Then I should see a "canvas" element

  Scenario: Runtime with string
    Given the WebGL start page is "/webgl_start.html"
    Then the WebGL start path should be "/webgl_start.html"

  Scenario: Runtime with hash
    Given the WebGL start page is a hash with the following keys:
      | controller | action   |
      | jax/suite  | jasmine  |
    Then the WebGL start path should be "http://www.example.com/jax/jasmine"
