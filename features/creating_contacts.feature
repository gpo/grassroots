Feature: Creating Contacts

  Background: User is Logged In
    Given I am logged in

    Scenario: Creating a new contact successfully
      Given there are no existing contacts
      When I visit the contact creation page
      And I fill in the form with typical contact information
      And I click the submit button
      Then I should see a message that says "Contact created successfully!"

    @unimplemented
    Scenario: Searching for a newly created contact
      Given there are no existing contacts
      And I create a new contact successfully
      And I visit the contact search page
      And I search for the contact I just created
      Then I should see the contact in the list
      
      
