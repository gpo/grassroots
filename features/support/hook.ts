import { After, Status } from "@cucumber/cucumber";
import { Browser, Page } from "playwright";
import { CustomWorld } from "./world";
import * as fs from "fs";
import * as path from "path";

export let browser: Browser;
export let page: Page;

// Define screenshots directory path
const screenshotsDir = path.join(process.cwd(), "test-results", "screenshots");

After(async function (this: CustomWorld, scenario) {
  console.log(
    `After hook called for scenario: ${scenario.pickle.name}, status: ${scenario.result?.status ?? "unknown"}`,
  );

  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED && this.page) {
    try {
      // Ensure screenshots directory exists
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
        console.log(`Created screenshots directory: ${screenshotsDir}`);
      }

      // Generate a safe filename from the scenario name
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${scenarioName}_${timestamp}.png`;
      const filePath = path.join(screenshotsDir, fileName);

      // Take the screenshot
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: filePath,
      });

      // Attach to Cucumber report
      this.attach(screenshot, "image/png");

      console.log(`Screenshot saved: ${filePath}`);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    }
  }

  // Clean up browser resources
  if (this.page) {
    await this.page.close();
  }
  if (this.browser) {
    await this.browser.close();
  }
});
