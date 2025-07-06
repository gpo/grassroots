import { Given, Then, When, world } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import playwright from 'playwright';

const options = {
  headless: false,
  slowMo: 100
};
Given('I am logged in', async function () {

  
  world.browser = await playwright['chromium'].launch(options);

  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();

  await world.page.goto("https://google.ca");
});


When('I visit the contact creation page', function () {

});

When('I fill in the form with typical contact information', function () {

});

When('I click the submit button', function () {

});


Then('I should see a message that says {string}', function (string) {

});
