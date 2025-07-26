import { Given, Then, When, After } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { chromium, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

import mikroORMConfig from "../../grassroots-backend/src/mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";

const options = {
  headless: false,
  slowMo: 100,
  args: ["--disable-blink-features=AutomationControlled"],
};

Given("I am logged in", { timeout: 20000 }, async function (this: CustomWorld) {
  this.browser = await chromium.launch(options);
  this.context = await this.browser.newContext({
    ignoreHTTPSErrors: true,
  });
  this.page = await this.context.newPage();

  // 1. Go to the app and click Login
  await this.page.goto("https://grassroots.org");
  await this.page.click('a:has-text("Login")');

  const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
  const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

  // 2. Wait for navigation to Google (or popup appears)
  await this.page.waitForURL(/accounts\.google\.com/);

  // 3. Fill in email
  await this.page.fill('input[type="email"]', GOOGLE_EMAIL);
  await this.page.click('button:has-text("Next")');

  // 4. Wait for password input and fill it
  await this.page.waitForSelector('input[type="password"]');
  await this.page.fill('input[type="password"]', GOOGLE_PASSWORD);
  await this.page.click('button:has-text("Next")');

  // // Try to click the allow/accept button if it appears
  // const allowButtonSelector = 'button:has-text("Allow"), button:has-text("次へ"), input[type="submit"]:has-text("Allow")';

  // await this.page.waitForSelector(allowButtonSelector).catch(() => {});

  // const allowButton = this.page.locator(allowButtonSelector);
  // if (await allowButton.waitFor({ state: 'visible', timeout: 2000 }).catch(() => false)) {
  //   await allowButton.click();
  // }

  // process.stdout.write("hello world");
  // 5. Wait for navigation back to app
  await this.page.locator('h1:has-text("Grassroots")').waitFor();
});

Given("there are no existing contacts", async function (this: CustomWorld) {
  const orm = await MikroORM.init(mikroORMConfig);
  const generator = orm.getSchemaGenerator();
  await generator.clearDatabase();
  await orm.close();
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
