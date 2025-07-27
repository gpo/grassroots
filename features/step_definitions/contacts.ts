import { Given, Then, When, After } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { chromium, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

const options = {
  headless: true,
  slowMo: 100,
};

Given("I am logged in", async function (this: CustomWorld) {
  this.browser = await chromium.launch(options);
  this.context = await this.browser.newContext({
    ignoreHTTPSErrors: true,
  });
  this.page = await this.context.newPage();
  await this.page.goto("https://grassroots.org");
});

Given("there are no existing contacts", function () {
  return;
});

When("I visit the contact creation page", async function (this: CustomWorld) {
  await this.page?.goto("https://grassroots.org/CreateContact");
});

When(
  "I fill in the form with typical contact information",
  async function (this: CustomWorld) {
    await this.page?.fill('input[name="firstName"]', "John");
    await this.page?.fill('input[name="lastName"]', "Doe");
    await this.page?.fill('input[name="email"]', "john.doe@example.com");
    await this.page?.fill('input[name="phoneNumber"]', "226-999-9999");
  },
);

When("I click the submit button", async function (this: CustomWorld) {
  await this.page?.click('input[type="submit"]');
});

Then(
  "I should see a message that says {string}",
  async function (this: CustomWorld, message: string) {
    if (!this.page) {
      throw new Error("Playwright page is not initialized");
    }

    // Find the element that contains the message
    const locator: Locator = this.page.locator(`text="${message}"`);

    // Assert that it's visible
    await expect(locator).toBeVisible();
  },
);

After(async function (this: CustomWorld) {
  await this.browser?.close();
});
