@rails
Feature: Models

  Scenario: Plugin models loaded first
    Given file "app/assets/jax/models/person.js" contains "__feature_model_person"
      And file "vendor/plugins/mine/app/assets/jax/models/human.js" contains "__feature_model_human"
    When I visit "/assets/jax/application.js"
    # Then show me the response
    Then "__feature_model_human" should come before "__feature_model_person"
