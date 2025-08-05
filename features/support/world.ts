import { setWorldConstructor, World } from "@cucumber/cucumber";

import { Browser, BrowserContext, Page } from "@playwright/test";

export interface CustomWorldContext {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

export class CustomWorld extends World implements CustomWorldContext {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

setWorldConstructor(CustomWorld);
