/* eslint-disable */
export default async () => {
  const t = {
    ["../../grassroots-shared/src/dtos/Organization.dto.js"]: await import(
      "grassroots-shared/dtos/Organization.dto"
    ),
    ["../../grassroots-shared/src/dtos/Contact.dto.js"]: await import(
      "grassroots-shared/dtos/Contact.dto"
    ),
    ["../../grassroots-shared/src/dtos/Paginated.dto.js"]: await import(
      "grassroots-shared/dtos/Paginated.dto"
    ),
    ["../../grassroots-shared/src/dtos/Role.dto.js"]: await import(
      "grassroots-shared/dtos/Role.dto"
    ),
    ["../../grassroots-shared/src/dtos/UserRole.dto.js"]: await import(
      "grassroots-shared/dtos/UserRole.dto"
    ),
    ["../../grassroots-shared/src/dtos/User.dto.js"]: await import(
      "grassroots-shared/dtos/User.dto"
    ),
    ["../../grassroots-shared/src/dtos/PhoneCanvass/PhoneCanvass.dto.js"]:
      await import("grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto"),
    ["../../grassroots-shared/src/dtos/Hello.dto.js"]: await import(
      "grassroots-shared/dtos/Hello.dto"
    ),
    ["../../grassroots-shared/src/dtos/Permission.dto.js"]: await import(
      "grassroots-shared/dtos/Permission.dto"
    ),
    ["../../grassroots-shared/src/dtos/Void.dto.js"]: await import(
      "grassroots-shared/dtos/Void.dto"
    ),
    ["../../grassroots-shared/src/dtos/LoginState.dto.js"]: await import(
      "grassroots-shared/dtos/LoginState.dto"
    ),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("grassroots-shared/dtos/Hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("grassroots-shared/dtos/Paginated.dto"),
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
          import("grassroots-shared/dtos/Organization.dto"),
          {
            OrganizationDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              name: { required: true, type: () => String },
              abbreviatedName: { required: true, type: () => String },
              description: { required: true, type: () => String },
              parentId: { required: false, type: () => Number, minimum: 1 },
            },
            OrganizationsDTO: {
              organizations: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                    .OrganizationDTO,
                ],
              },
            },
            OrganizationReferenceDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
            },
            CreateOrganizationNoParentRequestDTO: {
              name: { required: true, type: () => String },
              abbreviatedName: { required: true, type: () => String },
              description: { required: true, type: () => String },
            },
            CreateOrganizationRequestDTO: {
              name: { required: true, type: () => String },
              abbreviatedName: { required: true, type: () => String },
              description: { required: true, type: () => String },
              parentID: { required: true, type: () => Number, minimum: 1 },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/Contact.dto"),
          {
            ContactDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              organization: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                    .OrganizationDTO,
              },
              phoneNumber: { required: true, type: () => String },
            },
            ContactsDTO: {
              contacts: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .ContactDTO,
                ],
              },
            },
            CreateContactRequestDTO: {
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
              organizationId: {
                required: true,
                type: () => Number,
                minimum: -1,
              },
            },
            CreateBulkContactRequestDTO: {
              contacts: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .CreateContactRequestDTO,
                ],
              },
            },
            CreateBulkContactResponseDTO: {
              ids: { required: true, type: () => [Number] },
            },
            GetContactByIDResponseDTO: {
              contact: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .ContactDTO,
                nullable: true,
              },
            },
            ContactSearchRequestDTO: {
              id: { required: false, type: () => Number, minimum: 1 },
              email: { required: false, type: () => String },
              firstName: { required: false, type: () => String },
              lastName: { required: false, type: () => String },
              organizationId: { required: false, type: () => Number },
              phoneNumber: { required: false, type: () => String },
            },
            PaginatedContactSearchRequestDTO: {
              contact: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .ContactSearchRequestDTO,
              },
              paginated: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Paginated.dto.js"]
                    .PaginatedRequestDTO,
              },
            },
            PaginatedContactResponseDTO: {
              contacts: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .ContactDTO,
                ],
              },
              paginated: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Paginated.dto.js"]
                    .PaginatedResponseDTO,
              },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/Permission.dto"),
          {
            PermissionsDTO: {
              permissions: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/Role.dto"),
          {
            RoleDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              name: { required: true, type: () => String },
              permissions: { required: true, type: () => [Object] },
            },
            RolesDTO: {
              roles: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/Role.dto.js"].RoleDTO,
                ],
              },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/UserRole.dto"),
          {
            UserRoleDTO: {
              id: { required: false, type: () => Number, minimum: 1 },
              userId: { required: false, type: () => String },
              role: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Role.dto.js"].RoleDTO,
              },
              organizationId: {
                required: true,
                type: () => Number,
                minimum: 1,
              },
              inherited: { required: true, type: () => Boolean },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/User.dto"),
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
              userRoles: {
                required: false,
                type: () => [
                  t["../../grassroots-shared/src/dtos/UserRole.dto.js"]
                    .UserRoleDTO,
                ],
              },
            },
            UserPermissionsForOrgRequestDTO: {
              userId: { required: true, type: () => String },
              organizationId: {
                required: true,
                type: () => Number,
                minimum: 1,
              },
            },
            UsersDTO: {
              users: {
                required: true,
                type: () => [
                  t["../../grassroots-shared/src/dtos/User.dto.js"].UserDTO,
                ],
              },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/LoginState.dto"),
          {
            LoginStateDTO: {
              user: {
                required: false,
                type: () =>
                  t["../../grassroots-shared/src/dtos/User.dto.js"].UserDTO,
              },
            },
          },
        ],
        [import("grassroots-shared/dtos/Void.dto"), { VoidDTO: {} }],
        [
          import("grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto"),
          {
            PhoneCanvassDTO: {
              id: { required: true, type: () => String },
              contacts: {
                required: true,
                type: () => [
                  t[
                    "../../grassroots-shared/src/dtos/PhoneCanvass/PhoneCanvass.dto.js"
                  ].PhoneCanvassContactDTO,
                ],
              },
            },
            CreatePhoneCanvasContactRequestDTO: {
              contact: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .CreateContactRequestDTO,
              },
              metadata: { required: true, type: () => String, format: "json" },
            },
            CreatePhoneCanvassRequestDTO: {
              contacts: {
                required: true,
                type: () => [
                  t[
                    "../../grassroots-shared/src/dtos/PhoneCanvass/PhoneCanvass.dto.js"
                  ].CreatePhoneCanvasContactRequestDTO,
                ],
              },
            },
            CreatePhoneCanvassResponseDTO: {
              id: { required: true, type: () => String },
            },
            PhoneCanvassContactDTO: {
              contact: {
                required: true,
                type: () =>
                  t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                    .ContactDTO,
              },
              metadata: { required: true, type: () => String, format: "json" },
              callStatus: { required: true, type: () => Object },
            },
          },
        ],
        [
          import("grassroots-shared/dtos/ValidationError.dto"),
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
          import("./app/App.controller.js"),
          {
            AppController: {
              getHello: {
                type: t["../../grassroots-shared/src/dtos/Hello.dto.js"]
                  .HelloOutDTO,
              },
            },
          },
        ],
        [
          import("./contacts/Contacts.controller.js"),
          {
            ContactsController: {
              create: {
                type: t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                  .ContactDTO,
              },
              bulkCreate: {
                type: t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                  .CreateBulkContactResponseDTO,
              },
              findAll: {
                type: t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                  .ContactsDTO,
              },
              search: {
                type: t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                  .PaginatedContactResponseDTO,
              },
              findOne: {
                type: t["../../grassroots-shared/src/dtos/Contact.dto.js"]
                  .GetContactByIDResponseDTO,
              },
            },
          },
        ],
        [
          import("./users/Users.controller.js"),
          {
            UsersController: {
              findAll: {
                type: t["../../grassroots-shared/src/dtos/User.dto.js"]
                  .UsersDTO,
              },
              findOrCreate: {
                type: t["../../grassroots-shared/src/dtos/User.dto.js"].UserDTO,
              },
              getUserPermissionsForOrg: {
                type: t["../../grassroots-shared/src/dtos/Permission.dto.js"]
                  .PermissionsDTO,
              },
            },
          },
        ],
        [
          import("./auth/Auth.controller.js"),
          {
            AuthController: {
              login: {
                type: t["../../grassroots-shared/src/dtos/Void.dto.js"].VoidDTO,
              },
              googleAuthRedirect: {
                type: t["../../grassroots-shared/src/dtos/Void.dto.js"].VoidDTO,
              },
              isUserLoggedIn: {
                type: t["../../grassroots-shared/src/dtos/LoginState.dto.js"]
                  .LoginStateDTO,
              },
              example: {
                type: t["../../grassroots-shared/src/dtos/LoginState.dto.js"]
                  .LoginStateDTO,
              },
              logout: {
                type: t["../../grassroots-shared/src/dtos/Void.dto.js"].VoidDTO,
              },
              setActiveOrg: {
                type: t["../../grassroots-shared/src/dtos/Void.dto.js"].VoidDTO,
              },
              getActiveOrg: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationDTO,
              },
            },
          },
        ],
        [
          import("./organizations/Organizations.controller.js"),
          {
            OrganizationsController: {
              create: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationDTO,
              },
              createRoot: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationDTO,
              },
              findAll: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationsDTO,
              },
              findById: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationDTO,
              },
              getAncestors: {
                type: t["../../grassroots-shared/src/dtos/Organization.dto.js"]
                  .OrganizationsDTO,
              },
            },
          },
        ],
        [
          import("./organizations/Roles.controller.js"),
          {
            RolesController: {
              findAll: {
                type: t["../../grassroots-shared/src/dtos/Role.dto.js"]
                  .RolesDTO,
              },
            },
          },
        ],
        [
          import("./phone-canvass/PhoneCanvass.controller.js"),
          {
            PhoneCanvassController: {
              create: {
                type: t[
                  "../../grassroots-shared/src/dtos/PhoneCanvass/PhoneCanvass.dto.js"
                ].CreatePhoneCanvassResponseDTO,
              },
            },
          },
        ],
      ],
    },
  };
};
