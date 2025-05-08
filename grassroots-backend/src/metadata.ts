/* eslint-disable */
export default async () => {
  const t = {
    ["./grassroots-shared/contact.entity.dto"]: await import(
      "./grassroots-shared/contact.entity.dto"
    ),
    ["./app/entities/hello.dto"]: await import("./app/entities/hello.dto"),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./app/entities/hello.dto"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./grassroots-shared/contact.entity.dto"),
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
          },
        ],
        [
          import("./contacts/entities/validationError.dto"),
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
          import("./app.controller"),
          {
            AppController: {
              getHello: { type: t["./app/entities/hello.dto"].HelloOutDTO },
            },
          },
        ],
        [
          import("./contacts/contacts.controller"),
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
