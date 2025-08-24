import { Given, Then, When, After } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { chromium, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { clearContacts } from "../../grassroots-backend/src/testing/DatabaseUtils";

const options = {
  headless: true, // Show browser for debugging
  slowMo: 500, // Slow down actions to appear more human-like
  args: [
    "--disable-blink-features=AutomationControlled",
    "--disable-features=IsolateOrigins,site-per-process",
    "--start-maximized",
  ],
};

Given("I am logged in", { timeout: 30000 }, async function (this: CustomWorld) {
  console.log("Starting 'Given I am logged in' step...");

  try {
    console.log("Launching browser...");
    this.browser = await chromium.launch(options);
    console.log("Browser launched successfully");

    console.log("Creating new context...");
    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
    });
    console.log("Context created successfully");

    console.log("Creating new page...");
    this.page = await this.context.newPage();
    console.log("Page created successfully");

    // Real Google OAuth flow for local testing
    console.log("Navigating to https://grassroots.org...");
    await this.page.goto("https://grassroots.org", {
      waitUntil: "networkidle",
      timeout: 10000,
    });
    console.log("Navigation complete");

    console.log("Looking for Login link...");
    await this.page.click('a:has-text("Login")', { timeout: 5000 });
    console.log("Clicked Login link");

    const GOOGLE_ACCOUNT_EMAIL: string =
      process.env.GOOGLE_ACCOUNT_EMAIL ?? "admin+fillmein@google.com";
    const GOOGLE_ACCOUNT_PASSWORD: string =
      process.env.GOOGLE_ACCOUNT_PASSWORD ?? "password";
    console.log("Using email:", GOOGLE_ACCOUNT_EMAIL);

    // 2. Wait for navigation to Google (or popup appears)
    console.log("Waiting for Google login page...");
    await this.page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });
    console.log("Google login page loaded");

    // 3. Fill in email
    await this.page.fill('input[type="email"]', GOOGLE_ACCOUNT_EMAIL);
    await this.page.click('button:has-text("Next")');

    // 4. Wait for password input and fill it
    await this.page.waitForSelector('input[type="password"]');
    await this.page.fill('input[type="password"]', GOOGLE_ACCOUNT_PASSWORD);
    await this.page.click('button:has-text("Next")');

    // 5. Wait for navigation back to app
    console.log("Waiting for redirect back to app...");
    await this.page
      .locator('h1:has-text("Grassroots")')
      .waitFor({ timeout: 10000 });
    console.log("Successfully logged in!");
  } catch (error) {
    console.error("Error in 'Given I am logged in' step:", error);
    console.error("Current URL:", this.page?.url());
    throw error;
  }
});

Given("there are no existing contacts", async function (this: CustomWorld) {
  await clearContacts();
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
