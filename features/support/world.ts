import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';

import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface CustomWorldContext {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  [key: string]: any;
}

export class CustomWorld extends World implements CustomWorldContext {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
