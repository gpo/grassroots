/* eslint-disable */
export default async () => {
  const t = {
    ["./grassroots-shared/Contact.dto"]: await import(
      "./grassroots-shared/Contact.dto"
    ),
    ["./grassroots-shared/Paginated.dto"]: await import(
      "./grassroots-shared/Paginated.dto"
    ),
    ["./grassroots-shared/User.dto"]: await import(
      "./grassroots-shared/User.dto"
    ),
    ["./grassroots-shared/Hello.dto"]: await import(
      "./grassroots-shared/Hello.dto"
    ),
    ["./contacts/entities/Contact.entity"]: await import(
      "./contacts/entities/Contact.entity"
    ),
    ["./grassroots-shared/LoginState.dto"]: await import(
      "./grassroots-shared/LoginState.dto"
    ),
    ["./grassroots-shared/Void.dto"]: await import(
      "./grassroots-shared/Void.dto"
    ),
    ["./grassroots-shared/Organization.dto"]: await import(
      "./grassroots-shared/Organization.dto"
    ),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./grassroots-shared/Paginated.dto"),
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
          import("./grassroots-shared/Contact.dto"),
          {
            ContactDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
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
                  t["./grassroots-shared/Contact.dto"].CreateContactRequestDTO,
                ],
              },
            },
            CreateBulkContactResponseDTO: {
              ids: { required: true, type: () => [Number] },
            },
            GetContactByIDResponseDTO: {
              contact: {
                required: true,
                type: () => t["./grassroots-shared/Contact.dto"].ContactDTO,
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
                  t["./grassroots-shared/Contact.dto"].ContactSearchRequestDTO,
              },
              paginated: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Paginated.dto"].PaginatedRequestDTO,
              },
            },
            PaginatedContactResponseDTO: {
              contacts: {
                required: true,
                type: () => [t["./grassroots-shared/Contact.dto"].ContactDTO],
              },
              paginated: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Paginated.dto"].PaginatedResponseDTO,
              },
            },
          },
        ],
        [
          import("./grassroots-shared/User.dto"),
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
          },
        ],
        [
          import("./grassroots-shared/Hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./grassroots-shared/LoginState.dto"),
          {
            LoginStateDTO: {
              user: {
                required: false,
                type: () => t["./grassroots-shared/User.dto"].UserDTO,
              },
            },
          },
        ],
        [import("./grassroots-shared/Void.dto"), { VoidDTO: {} }],
        [
          import("./grassroots-shared/Organization.dto"),
          {
            OrganizationResponseDTO: {
              id: { required: true, type: () => Number },
              name: { required: true, type: () => String },
              parentId: { required: false, type: () => Number },
            },
            CreateOrganizationRootDTO: {
              name: { required: true, type: () => String },
            },
            CreateOrganizationDTO: {
              name: { required: true, type: () => String },
              parentID: { required: true, type: () => Number, minimum: 1 },
            },
          },
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
          import("./app/App.controller"),
          {
            AppController: {
              getHello: {
                type: t["./grassroots-shared/Hello.dto"].HelloOutDTO,
              },
            },
          },
        ],
        [
          import("./contacts/Contacts.controller"),
          {
            ContactsController: {
              create: {
                type: t["./contacts/entities/Contact.entity"].ContactEntity,
              },
              bulkCreate: {
                type: t["./grassroots-shared/Contact.dto"]
                  .CreateBulkContactResponseDTO,
              },
              findAll: {
                type: [t["./grassroots-shared/Contact.dto"].ContactDTO],
              },
              search: {
                type: t["./grassroots-shared/Contact.dto"]
                  .PaginatedContactResponseDTO,
              },
              findOne: {
                type: t["./grassroots-shared/Contact.dto"]
                  .GetContactByIDResponseDTO,
              },
            },
          },
        ],
        [
          import("./users/Users.controller"),
          {
            UsersController: {
              findAll: { type: [t["./grassroots-shared/User.dto"].UserDTO] },
            },
          },
        ],
        [
          import("./auth/Auth.controller"),
          {
            AuthController: {
              login: {},
              googleAuthRedirect: {},
              isUserLoggedIn: {
                type: t["./grassroots-shared/LoginState.dto"].LoginStateDTO,
              },
              example: {
                type: t["./grassroots-shared/LoginState.dto"].LoginStateDTO,
              },
              logout: { type: t["./grassroots-shared/Void.dto"].VoidDTO },
            },
          },
        ],
        [
          import("./organizations/Organizations.controller"),
          {
            OrganizationsController: {
              create: {
                type: t["./grassroots-shared/Organization.dto"]
                  .OrganizationResponseDTO,
              },
              createRoot: {
                type: t["./grassroots-shared/Organization.dto"]
                  .OrganizationResponseDTO,
              },
              findAll: {
                type: [
                  t["./grassroots-shared/Organization.dto"]
                    .OrganizationResponseDTO,
                ],
              },
              findById: {
                type: t["./grassroots-shared/Organization.dto"]
                  .OrganizationResponseDTO,
              },
              getAncestors: {
                type: [
                  t["./grassroots-shared/Organization.dto"]
                    .OrganizationResponseDTO,
                ],
              },
            },
          },
        ],
      ],
    },
  };
};
