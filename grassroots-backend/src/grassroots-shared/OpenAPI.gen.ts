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
  "/auth/example_route_using_user": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["AuthController_example"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/google/callback": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["AuthController_googleAuthRedirect"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/is_authenticated": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["AuthController_isUserLoggedIn"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["AuthController_login"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/logout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["AuthController_logout"];
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
  "/contacts/bulk-create": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ContactsController_bulkCreate"];
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
  "/organizations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["OrganizationsController_findAll"];
    put?: never;
    post: operations["OrganizationsController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/organizations/ancestors-of/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["OrganizationsController_getAncestors"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/organizations/create-root": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["OrganizationsController_createRoot"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/organizations/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["OrganizationsController_findById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/roles": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["RolesController_findAll"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["UsersController_findAll"];
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
    ContactDTO: {
      /** Format: email */
      email: string;
      firstName: string;
      id: number;
      lastName: string;
      phoneNumber: string;
    };
    ContactEntity: Record<string, never>;
    ContactSearchRequestDTO: {
      email?: string;
      firstName?: string;
      id?: number;
      lastName?: string;
      phoneNumber?: string;
    };
    CreateBulkContactRequestDTO: {
      contacts: components["schemas"]["CreateContactRequestDTO"][];
    };
    CreateBulkContactResponseDTO: {
      ids: number[];
    };
    CreateContactRequestDTO: {
      /** Format: email */
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
    CreateOrganizationRequestDTO: {
      name: string;
      parentID: number;
    };
    CreateOrganizationRootRequestDTO: {
      name: string;
    };
    GetContactByIDResponseDTO: {
      contact: components["schemas"]["ContactDTO"] | null;
    };
    HelloOutDTO: {
      message: string;
    };
    LoginStateDTO: {
      user?: components["schemas"]["UserDTO"];
    };
    OrganizationDTO: {
      id: number;
      name: string;
      parentId?: number;
    };
    OrganizationListDTO: {
      organizations: components["schemas"]["OrganizationDTO"][];
    };
    PaginatedContactResponseDTO: {
      contacts: components["schemas"]["ContactDTO"][];
      paginated: components["schemas"]["PaginatedResponseDTO"];
    };
    PaginatedContactSearchRequestDTO: {
      contact: components["schemas"]["ContactSearchRequestDTO"];
      paginated: components["schemas"]["PaginatedRequestDTO"];
    };
    PaginatedRequestDTO: {
      rowsToSkip: number;
      rowsToTake: number;
    };
    PaginatedResponseDTO: {
      rowsSkipped: number;
      rowsTotal: number;
    };
    RoleDTO: {
      id: number;
      name: string;
      permissions: ("VIEW_CONTACTS" | "MANAGE_CONTACTS" | "MANAGE_USERS")[];
    };
    UserDTO: {
      displayName?: string;
      emails?: string[];
      firstName?: string;
      id: string;
      lastName?: string;
    };
    ValidationErrorOutDTO: {
      error: string;
      message: string[];
      statusCode: number;
    };
    VoidDTO: Record<string, never>;
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
  AuthController_example: {
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
          "application/json": components["schemas"]["LoginStateDTO"];
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
  AuthController_googleAuthRedirect: {
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
        content?: never;
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
  AuthController_isUserLoggedIn: {
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
          "application/json": components["schemas"]["LoginStateDTO"];
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
  AuthController_login: {
    parameters: {
      query: {
        redirect_path: string;
      };
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
        content?: never;
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
  AuthController_logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["VoidDTO"];
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
          "application/json": components["schemas"]["ContactDTO"][];
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
        "application/json": components["schemas"]["CreateContactRequestDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactEntity"];
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
  ContactsController_bulkCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateBulkContactRequestDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CreateBulkContactResponseDTO"];
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
  ContactsController_search: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PaginatedContactSearchRequestDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedContactResponseDTO"];
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
          "application/json": components["schemas"]["GetContactByIDResponseDTO"];
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
  OrganizationsController_findAll: {
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
          "application/json": components["schemas"]["OrganizationListDTO"];
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
  OrganizationsController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOrganizationRequestDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["OrganizationDTO"];
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
  OrganizationsController_getAncestors: {
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
          "application/json": components["schemas"]["OrganizationListDTO"];
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
  OrganizationsController_createRoot: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOrganizationRootRequestDTO"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["OrganizationDTO"];
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
  OrganizationsController_findById: {
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
          "application/json": components["schemas"]["OrganizationDTO"];
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
  RolesController_findAll: {
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
          "application/json": components["schemas"]["RoleDTO"][];
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
  UsersController_findAll: {
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
          "application/json": components["schemas"]["UserDTO"][];
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
