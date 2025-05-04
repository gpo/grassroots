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
                headers: Record<string, unknown>;
                content: {
                    "application/json": components["schemas"]["HelloOutDTO"];
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
                headers: Record<string, unknown>;
                content: {
                    "application/json": components["schemas"]["ContactEntityOutDTO"];
                };
            };
            /** @description Validation failed */
            401: {
                headers: Record<string, unknown>;
                content: {
                    "application/json": {
                        statusCode?: number;
                        message?: string[];
                        error?: string;
                    };
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
            200: {
                headers: Record<string, unknown>;
                content: {
                    "application/json": components["schemas"]["ContactEntityOutDTO"];
                };
            };
            /** @description Validation failed */
            401: {
                headers: Record<string, unknown>;
                content: {
                    "application/json": {
                        statusCode?: number;
                        message?: string[];
                        error?: string;
                    };
                };
            };
        };
    };
    ContactsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: Record<string, unknown>;
                content: {
                    "application/json": components["schemas"]["ContactEntityOutDTO"];
                };
            };
            /** @description Validation failed */
            401: {
                headers: Record<string, unknown>;
                content: {
                    "application/json": {
                        statusCode?: number;
                        message?: string[];
                        error?: string;
                    };
                };
            };
        };
    };
}
