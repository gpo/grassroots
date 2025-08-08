/* eslint-disable */
export default async () => {
  const t = {
    ["@grassroots/shared/src/Contact.dto"]: await import(
      "@grassroots/shared/src/Contact.dto"
    ),
    ["@grassroots/shared/src/Paginated.dto"]: await import(
      "@grassroots/shared/src/Paginated.dto"
    ),
    ["@grassroots/shared/src/Organization.dto"]: await import(
      "@grassroots/shared/src/Organization.dto"
    ),
    ["@grassroots/shared/src/User.dto"]: await import(
      "@grassroots/shared/src/User.dto"
    ),
    ["@grassroots/shared/src/Role.dto"]: await import(
      "@grassroots/shared/src/Role.dto"
    ),
    ["@grassroots/shared/src/Void.dto"]: await import(
      "@grassroots/shared/src/Void.dto"
    ),
    ["@grassroots/shared/src/LoginState.dto"]: await import(
      "@grassroots/shared/src/LoginState.dto"
    ),
    ["@grassroots/shared/src/Hello.dto"]: await import(
      "@grassroots/shared/src/Hello.dto"
    ),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("@grassroots/shared/src/Paginated.dto"),
          {
            PaginatedRequestDTO: {
              rowsToSkip: { required: true, type: () => Number, minimum: 0 },
              rowsToTake: { required: true, type: () => Number, minimum: 1 },
            },
            PaginatedResponseDTO: {
              rowsSkipped: { required: true, type: () => Number, minimum: 0 },
              rowsTotal: { required: true, type: () => Number, minimum: 0 },
            },
          },
        ],
        [
          import("@grassroots/shared/src/Contact.dto"),
          {
            ContactDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
            },
            ContactsDTO: {
              contacts: {
                required: true,
                type: () => [t["@grassroots/shared/src/Contact.dto"].ContactDTO],
              },
            },
            CreateContactRequestDTO: {
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
            },
            CreateBulkContactRequestDTO: {
              contacts: {
                required: true,
                type: () => [
                  t["@grassroots/shared/src/Contact.dto"].CreateContactRequestDTO,
                ],
              },
            },
            CreateBulkContactResponseDTO: {
              ids: { required: true, type: () => [Number] },
            },
            GetContactByIDResponseDTO: {
              contact: {
                required: true,
                type: () => t["@grassroots/shared/src/Contact.dto"].ContactDTO,
                nullable: true,
              },
            },
            ContactSearchRequestDTO: {
              id: { required: false, type: () => Number, minimum: 1 },
              email: { required: false, type: () => String },
              firstName: { required: false, type: () => String },
              lastName: { required: false, type: () => String },
              phoneNumber: { required: false, type: () => String },
            },
            PaginatedContactSearchRequestDTO: {
              contact: {
                required: true,
                type: () =>
                  t["@grassroots/shared/src/Contact.dto"].ContactSearchRequestDTO,
              },
              paginated: {
                required: true,
                type: () =>
                  t["@grassroots/shared/src/Paginated.dto"].PaginatedRequestDTO,
              },
            },
            PaginatedContactResponseDTO: {
              contacts: {
                required: true,
                type: () => [t["@grassroots/shared/src/Contact.dto"].ContactDTO],
              },
              paginated: {
                required: true,
                type: () =>
                  t["@grassroots/shared/src/Paginated.dto"].PaginatedResponseDTO,
              },
            },
          },
        ],
        [
          import("@grassroots/shared/src/Organization.dto"),
          {
            OrganizationDTO: {
              id: { required: true, type: () => Number, minimum: 0 },
              name: { required: true, type: () => String },
              parentId: { required: false, type: () => Number, minimum: 0 },
            },
            OrganizationsDTO: {
              organizations: {
                required: true,
                type: () => [
                  t["@grassroots/shared/src/Organization.dto"].OrganizationDTO,
                ],
              },
            },
            CreateOrganizationNoParentRequestDTO: {
              name: { required: true, type: () => String },
            },
            CreateOrganizationRequestDTO: {
              name: { required: true, type: () => String },
              parentID: { required: true, type: () => Number, minimum: 1 },
            },
          },
        ],
        [
          import("@grassroots/shared/src/User.dto"),
          {
            UserDTO: {
              id: { required: true, type: () => String },
              emails: {
                required: false,
                type: () => [String],
                format: "email",
              },
              firstName: { required: false, type: () => String },
              lastName: { required: false, type: () => String },
              displayName: { required: false, type: () => String },
            },
            UsersDTO: {
              users: {
                required: true,
                type: () => [t["@grassroots/shared/src/User.dto"].UserDTO],
              },
            },
          },
        ],
        [
          import("@grassroots/shared/src/Permission.dto"),
          {
            PermissionsDTO: {
              permissions: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import("@grassroots/shared/src/Role.dto"),
          {
            RoleDTO: {
              id: { required: true, type: () => Number, minimum: 0 },
              name: { required: true, type: () => String },
              permissions: { required: true, type: () => [Object] },
            },
            RolesDTO: {
              roles: {
                required: true,
                type: () => [t["@grassroots/shared/src/Role.dto"].RoleDTO],
              },
            },
          },
        ],
        [import("@grassroots/shared/src/Void.dto"), { VoidDTO: {} }],
        [
          import("@grassroots/shared/src/LoginState.dto"),
          {
            LoginStateDTO: {
              user: {
                required: false,
                type: () => t["@grassroots/shared/src/User.dto"].UserDTO,
              },
            },
          },
        ],
        [
          import("@grassroots/shared/src/Hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./contacts/entities/ValidationError.dto"),
          {
            ValidationErrorOutDTO: {
              statusCode: { required: true, type: () => Number },
              message: { required: true, type: () => [String] },
              error: { required: true, type: () => String },
            },
          },
        ],
      ],
      controllers: [
        [
          import("./contacts/Contacts.controller"),
          {
            ContactsController: {
              create: { type: t["@grassroots/shared/src/Contact.dto"].ContactDTO },
              bulkCreate: {
                type: t["@grassroots/shared/src/Contact.dto"]
                  .CreateBulkContactResponseDTO,
              },
              findAll: {
                type: t["@grassroots/shared/src/Contact.dto"].ContactsDTO,
              },
              search: {
                type: t["@grassroots/shared/src/Contact.dto"]
                  .PaginatedContactResponseDTO,
              },
              findOne: {
                type: t["@grassroots/shared/src/Contact.dto"]
                  .GetContactByIDResponseDTO,
              },
            },
          },
        ],
        [
          import("./users/Users.controller"),
          {
            UsersController: {
              findAll: { type: t["@grassroots/shared/src/User.dto"].UsersDTO },
            },
          },
        ],
        [
          import("./auth/Auth.controller"),
          {
            AuthController: {
              login: { type: t["@grassroots/shared/src/Void.dto"].VoidDTO },
              googleAuthRedirect: {
                type: t["@grassroots/shared/src/Void.dto"].VoidDTO,
              },
              isUserLoggedIn: {
                type: t["@grassroots/shared/src/LoginState.dto"].LoginStateDTO,
              },
              example: {
                type: t["@grassroots/shared/src/LoginState.dto"].LoginStateDTO,
              },
              logout: { type: t["@grassroots/shared/src/Void.dto"].VoidDTO },
            },
          },
        ],
        [
          import("./organizations/Organizations.controller"),
          {
            OrganizationsController: {
              create: {
                type: t["@grassroots/shared/src/Organization.dto"].OrganizationDTO,
              },
              createRoot: {
                type: t["@grassroots/shared/src/Organization.dto"].OrganizationDTO,
              },
              findAll: {
                type: t["@grassroots/shared/src/Organization.dto"]
                  .OrganizationsDTO,
              },
              findById: {
                type: t["@grassroots/shared/src/Organization.dto"].OrganizationDTO,
              },
              getAncestors: {
                type: t["@grassroots/shared/src/Organization.dto"]
                  .OrganizationsDTO,
              },
            },
          },
        ],
        [
          import("./app/App.controller"),
          {
            AppController: {
              getHello: {
                type: t["@grassroots/shared/src/Hello.dto"].HelloOutDTO,
              },
            },
          },
        ],
        [
          import("./organizations/Roles.controller"),
          {
            RolesController: {
              findAll: { type: t["@grassroots/shared/src/Role.dto"].RolesDTO },
            },
          },
        ],
      ],
    },
  };
};
