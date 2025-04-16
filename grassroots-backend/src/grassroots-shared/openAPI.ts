export interface paths {
  "/": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["AppController_getHello"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/contacts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ContactController_findAll"];
    put?: never;
    post: operations["ContactController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/contacts/search": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ContactController_search"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/contacts/add-fakes/{count}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ContactController_addFakesToDatabase"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    PendingContactInDto: {
      /** Format: email */
      email: string;
      firstName: string;
      lastName: string;
    };
    ContactEntityOutDTO: {
      id: number;
      /** Format: email */
      email: string;
      firstName: string;
      lastName: string;
    };
    ContactSearchInDTO: {
      id?: number;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
    PaginatedInDTO: {
      rowsToSkip: number;
      rowsToTake: number;
    };
    PaginatedContactSearchInDTO: {
      contact: components["schemas"]["ContactSearchInDTO"];
      paginated: components["schemas"]["PaginatedInDTO"];
    };
    PaginatedOutDTO: {
      rowsSkipped: number;
      rowsTotal: number;
    };
    PaginatedContactOutDTO: {
      contacts: components["schemas"]["ContactEntityOutDTO"][];
      paginated: components["schemas"]["PaginatedOutDTO"];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  AppController_getHello: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": string;
        };
      };
    };
  };
  ContactController_findAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactEntityOutDTO"][];
        };
      };
    };
  };
  ContactController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PendingContactInDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactEntityOutDTO"];
        };
      };
    };
  };
  ContactController_search: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PaginatedContactSearchInDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedContactOutDTO"];
        };
      };
    };
  };
  ContactController_addFakesToDatabase: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        count: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
