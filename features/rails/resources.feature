@rails
Feature: Resources

  Scenario: File system default resource
    Given file "app/assets/jax/resources/people/default.resource" contains "name: Colin"
    When I visit "/assets/resources/people/default.js"
    Then I should see:
      """
      Person.addResources({"default":{"name":"Colin"}});
      """

  Scenario: File system resource
    Given file "app/assets/jax/resources/people/jennifer.resource" contains "name: Jennifer"
    When I visit "/assets/resources/people/jennifer.js"
    Then I should see:
      """
      Person.addResources({"jennifer":{"name":"Jennifer"}});
      """

  Scenario: Dynamic file resource expansion
    Given file "app/assets/jax/resources/people/jennifer.resource" contains "name: Jennifer"
    When I visit "/"
    Then I should see a "script" element with attribute "src" starting with "/assets/resources/people/jennifer.js"
