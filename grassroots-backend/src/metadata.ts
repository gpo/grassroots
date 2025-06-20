/* eslint-disable */
export default async () => {
  const t = {
    ["./grassroots-shared/Contact.entity.dto"]: await import(
      "./grassroots-shared/Contact.entity.dto"
    ),
    ["./grassroots-shared/Paginated.dto"]: await import(
      "./grassroots-shared/Paginated.dto"
    ),
    ["./grassroots-shared/User.entity"]: await import(
      "./grassroots-shared/User.entity"
    ),
    ["./app/entities/Hello.dto"]: await import("./app/entities/Hello.dto"),
    ["./grassroots-shared/LoginState.dto"]: await import(
      "./grassroots-shared/LoginState.dto"
    ),
    ["./grassroots-shared/Void.dto"]: await import(
      "./grassroots-shared/Void.dto"
    ),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./app/entities/Hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./grassroots-shared/Paginated.dto"),
          {
            PaginatedInDTO: {
              rowsToSkip: { required: true, type: () => Number, minimum: 0 },
              rowsToTake: { required: true, type: () => Number, minimum: 1 },
            },
            PaginatedOutDTO: {
              rowsSkipped: { required: true, type: () => Number, minimum: 0 },
              rowsTotal: { required: true, type: () => Number, minimum: 0 },
            },
          },
        ],
        [
          import("./grassroots-shared/Contact.entity.dto"),
          {
            CreateContactInDto: {
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
            },
            CreateBulkContactRequestDto: {
              contacts: {
                required: true,
                type: () => [
                  t["./grassroots-shared/Contact.entity.dto"]
                    .CreateContactInDto,
                ],
              },
            },
            CreateBulkContactResponseDTO: {
              ids: { required: true, type: () => [Number] },
            },
            ContactEntityOutDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
            },
            GetContactByIDResponse: {
              contact: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Contact.entity.dto"]
                    .ContactEntityOutDTO,
                nullable: true,
              },
            },
            ContactSearchInDTO: {
              id: { required: false, type: () => Number, minimum: 1 },
              email: { required: false, type: () => String },
              firstName: { required: false, type: () => String },
              lastName: { required: false, type: () => String },
              phoneNumber: { required: false, type: () => String },
            },
            PaginatedContactSearchInDTO: {
              contact: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Contact.entity.dto"]
                    .ContactSearchInDTO,
              },
              paginated: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Paginated.dto"].PaginatedInDTO,
              },
            },
            PaginatedContactOutDTO: {
              contacts: {
                required: true,
                type: () => [
                  t["./grassroots-shared/Contact.entity.dto"]
                    .ContactEntityOutDTO,
                ],
              },
              paginated: {
                required: true,
                type: () =>
                  t["./grassroots-shared/Paginated.dto"].PaginatedOutDTO,
              },
            },
          },
        ],
        [
          import("./grassroots-shared/User.entity"),
          {
            UserEntity: {
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
          import("./grassroots-shared/LoginState.dto"),
          {
            LoginStateDTO: {
              isLoggedIn: { required: true, type: () => Boolean },
              user: {
                required: false,
                type: () => t["./grassroots-shared/User.entity"].UserEntity,
              },
            },
          },
        ],
        [import("./grassroots-shared/Void.dto"), { VoidDTO: {} }],
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
          import("./App.controller"),
          {
            AppController: {
              getHello: { type: t["./app/entities/Hello.dto"].HelloOutDTO },
            },
          },
        ],
        [
          import("./contacts/Contacts.controller"),
          {
            ContactsController: {
              create: {
                type: t["./grassroots-shared/Contact.entity.dto"]
                  .ContactEntityOutDTO,
              },
              bulkCreate: {
                type: t["./grassroots-shared/Contact.entity.dto"]
                  .CreateBulkContactResponseDTO,
              },
              findAll: {
                type: [
                  t["./grassroots-shared/Contact.entity.dto"]
                    .ContactEntityOutDTO,
                ],
              },
              search: {
                type: t["./grassroots-shared/Contact.entity.dto"]
                  .PaginatedContactOutDTO,
              },
              findOne: {
                type: t["./grassroots-shared/Contact.entity.dto"]
                  .GetContactByIDResponse,
              },
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
      ],
    },
  };
};
