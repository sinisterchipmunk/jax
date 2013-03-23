@rails
Feature: Specs
  This feature represents the only way I can find to test that Jasmine is
  mounted and linked to properly, but it is very much a hack.

  So basically I can't get capy within_frame to work properly. Instead,
  I'm going to go to the test suite as expected, and then hack out the
  URL that is used as the iframe source. Then I'll visit the resultant
  URL directly and ensure that Jasmine is executed within whatever page we 
  end up on.

  Scenario: go to mounted specs path
    Given I visit "/jax"
    When I follow "Test Suite"
      And I go to the page in the iframe source
    Then the page source should contain "jasmineEnv"
