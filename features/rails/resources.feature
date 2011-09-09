@rails
Feature: Resources

  Scenario: File system default resource
    Given file "app/assets/jax/resources/people/default.resource" contains "name: Colin"
    When I visit "/assets/resources/people/default"
    Then I should see:
      """
      Person.addResources({"default":{"name":"Colin"}});
      """

  Scenario: File system resource
    Given file "app/assets/jax/resources/people/jennifer.resource" contains "name: Jennifer"
    When I visit "/assets/resources/people/jennifer"
    Then I should see:
      """
      Person.addResources({"jennifer":{"name":"Jennifer"}});
      """

  Scenario: All resources
    Given file "app/assets/jax/resources/people/default.resource" contains "name: Colin"
      And file "app/assets/jax/resources/people/jennifer.resource" contains "name: Jennifer"
    When I visit "/assets/jax/application.js"
    Then I should see:
      """
      "name":"Colin"
      """
    And I should see:
      """
      "name":"Jennifer"
      """
