import { Browser, Page } from "playwright";

export let browser: Browser;
export let page: Page;

// BeforeAll(async function (this: CustomWorld) {
//   process.stdout.write("BEFORE ALL");
//   this.browser = await playwright.chromium.launch(options);
// });

// AfterAll(async function (this: CustomWorld) {
//   if (this.browser) {
//     await this.browser.close();
//   }
// });

// Before(async function (this: CustomWorld) {
//   this.context = await world.browser.newContext();
//   this.page = await world.context.newPage();
// });

// After(async function (this: CustomWorld) {
//   console.log('after pass...');
//   await global.page.close();
//   await global.context.close();
// });

// After(async function (this: CustomWorld, scenario) {
//   // if (scenario.result.status === Status.FAILED) {
//   //   var buffer = await page.screenshot({ path: `reports/${scenario.pickle.name}.png`, fullPage: true })
//   //   this.attach(buffer, 'image/png');
//   // }
// });
