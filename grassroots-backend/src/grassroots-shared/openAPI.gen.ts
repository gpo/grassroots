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
        get: operations["ContactsController_findAll"];
        put?: never;
        post: operations["ContactsController_create"];
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
        post: operations["ContactsController_search"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contacts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ContactsController_findOne"];
        put?: never;
        post?: never;
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
        HelloOutDTO: {
            message: string;
        };
        CreateContactInDto: {
            /** Format: email */
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
        };
        ContactEntityOutDTO: {
            id: number;
            /** Format: email */
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
        };
        ContactSearchInDTO: {
            id?: number;
            email?: string;
            firstName?: string;
            lastName?: string;
            phoneNumber?: string;
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
        GetContactByIDResponse: {
            contact: components["schemas"]["ContactEntityOutDTO"] | null;
        };
        ValidationErrorOutDTO: {
            statusCode: number;
            message: string[];
            error: string;
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
                    "application/json": components["schemas"]["HelloOutDTO"];
                };
            };
            /** @description Validation failed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidationErrorOutDTO"];
                };
            };
        };
    };
    ContactsController_findAll: {
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
            /** @description Validation failed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidationErrorOutDTO"];
                };
            };
        };
    };
    ContactsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateContactInDto"];
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
            /** @description Validation failed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
<<<<<<< HEAD
                content: {
                    "application/json": components["schemas"]["ValidationErrorOutDTO"];
                };
            };
        };
    };
    ContactsController_search: {
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
            /** @description Validation failed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
=======
>>>>>>> 421f1ea (Fix generated files)
                content: {
                    "application/json": components["schemas"]["ValidationErrorOutDTO"];
                };
            };
        };
    };
    ContactsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetContactByIDResponse"];
                };
            };
            /** @description Validation failed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidationErrorOutDTO"];
                };
            };
        };
    };
}
