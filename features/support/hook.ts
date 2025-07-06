import { After, AfterAll, Before, BeforeAll, Status, world } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import playwright from 'playwright';
import { CustomWorld } from './world';

export let browser: Browser;
export let page: Page;

import process from "process";

const options = {
  headless: false,
  slowMo: 100
};

BeforeAll(async function () {

  process.stdout.write("BEFORE ALL");
  world.browser = await playwright['chromium'].launch(options);

  
});

AfterAll(async function () {
  if (world.browser) {
    await world.browser.close();
  }
});

Before(async function () {
  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();
});

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
