/* eslint-disable */
export default async () => {
  const t = {
    ["./grassroots-shared/contact.entity.dto"]: await import(
      "./grassroots-shared/Contact.entity.dto"
    ),
    ["./grassroots-shared/paginated.dto"]: await import(
      "./grassroots-shared/paginated.dto"
    ),
    ["./grassroots-shared/Paginated.dto"]: await import(
      "./grassroots-shared/Paginated.dto"
    ),
    ["./app/entities/hello.dto"]: await import("./app/entities/Hello.dto"),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./app/entities/Hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./grassroots-shared/paginated.dto"),
          {
            PaginatedInDTO: {
              rowsToSkip: { required: true, type: () => Number },
              rowsToTake: { required: true, type: () => Number },
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
            ContactEntityOutDTO: {
              id: { required: true, type: () => Number, minimum: 0 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              phoneNumber: { required: true, type: () => String },
            },
            GetContactByIDResponse: {
              contact: {
                required: true,
                type: () =>
                  t["./grassroots-shared/contact.entity.dto"]
                    .ContactEntityOutDTO,
                nullable: true,
              },
            },
            ContactSearchInDTO: {
              id: { required: false, type: () => Number, minimum: 0 },
              email: { required: false, type: () => String },
              firstName: { required: false, type: () => String },
              lastName: { required: false, type: () => String },
              phoneNumber: { required: false, type: () => String },
            },
            PaginatedContactSearchInDTO: {
              contact: {
                required: true,
                type: () =>
                  t["./grassroots-shared/contact.entity.dto"]
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
                  t["./grassroots-shared/contact.entity.dto"]
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
          import("./contacts/entities/ValidationError.dto"),
          {
            ValidationErrorOutDTO: {
              statusCode: { required: true, type: () => Number },
              message: { required: true, type: () => [String] },
              error: { required: true, type: () => String },
            },
          },
        ],
        [
          import("./grassroots-shared/Paginated.dto"),
          {
            PaginatedInDTO: {
              rowsToSkip: { required: true, type: () => Number },
              rowsToTake: { required: true, type: () => Number },
            },
            PaginatedOutDTO: {
              rowsSkipped: { required: true, type: () => Number, minimum: 0 },
              rowsTotal: { required: true, type: () => Number, minimum: 0 },
            },
          },
        ],
      ],
      controllers: [
        [
          import("./App.controller"),
          {
            AppController: {
              getHello: { type: t["./app/entities/hello.dto"].HelloOutDTO },
            },
          },
        ],
        [
          import("./contacts/Contacts.controller"),
          {
            ContactsController: {
              create: {
                type: t["./grassroots-shared/contact.entity.dto"]
                  .ContactEntityOutDTO,
              },
              findAll: {
                type: [
                  t["./grassroots-shared/contact.entity.dto"]
                    .ContactEntityOutDTO,
                ],
              },
              search: {
                type: t["./grassroots-shared/contact.entity.dto"]
                  .PaginatedContactOutDTO,
              },
              findOne: {
                type: t["./grassroots-shared/contact.entity.dto"]
                  .GetContactByIDResponse,
              },
            },
          },
        ],
      ],
    },
  };
};
