/* eslint-disable */
export default async () => {
  const t = {
    ["./Organization.dto"]: await import("./Organization.dto.js"),
    ["./Contact.dto"]: await import("./Contact.dto.js"),
    ["./Paginated.dto"]: await import("./Paginated.dto.js"),
    ["./Role.dto"]: await import("./Role.dto.js"),
    ["./UserRole.dto"]: await import("./UserRole.dto.js"),
    ["./User.dto"]: await import("./User.dto.js"),
  };
  return {
    "@nestjs/swagger": {
      models: [
        [
          import("./Paginated.dto.js"),
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
          import("./Organization.dto.js"),
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
                type: () => [t["./Organization.dto"].OrganizationDTO],
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
          import("./Contact.dto.js"),
          {
            ContactDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              email: { required: true, type: () => String, format: "email" },
              firstName: { required: true, type: () => String },
              lastName: { required: true, type: () => String },
              organization: {
                required: true,
                type: () => t["./Organization.dto"].OrganizationDTO,
              },
              phoneNumber: { required: true, type: () => String },
            },
            ContactsDTO: {
              contacts: {
                required: true,
                type: () => [t["./Contact.dto"].ContactDTO],
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
                type: () => [t["./Contact.dto"].CreateContactRequestDTO],
              },
            },
            CreateBulkContactResponseDTO: {
              ids: { required: true, type: () => [Number] },
            },
            GetContactByIDResponseDTO: {
              contact: {
                required: true,
                type: () => t["./Contact.dto"].ContactDTO,
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
                type: () => t["./Contact.dto"].ContactSearchRequestDTO,
              },
              paginated: {
                required: true,
                type: () => t["./Paginated.dto"].PaginatedRequestDTO,
              },
            },
            PaginatedContactResponseDTO: {
              contacts: {
                required: true,
                type: () => [t["./Contact.dto"].ContactDTO],
              },
              paginated: {
                required: true,
                type: () => t["./Paginated.dto"].PaginatedResponseDTO,
              },
            },
          },
        ],
        [
          import("./Hello.dto.js"),
          { HelloOutDTO: { message: { required: true, type: () => String } } },
        ],
        [
          import("./Permission.dto.js"),
          {
            PermissionsDTO: {
              permissions: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import("./Role.dto.js"),
          {
            RoleDTO: {
              id: { required: true, type: () => Number, minimum: 1 },
              name: { required: true, type: () => String },
              permissions: { required: true, type: () => [Object] },
            },
            RolesDTO: {
              roles: { required: true, type: () => [t["./Role.dto"].RoleDTO] },
            },
          },
        ],
        [
          import("./UserRole.dto.js"),
          {
            UserRoleDTO: {
              id: { required: false, type: () => Number, minimum: 1 },
              userId: { required: false, type: () => String },
              role: { required: true, type: () => t["./Role.dto"].RoleDTO },
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
          import("./User.dto.js"),
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
                type: () => [t["./UserRole.dto"].UserRoleDTO],
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
              users: { required: true, type: () => [t["./User.dto"].UserDTO] },
            },
          },
        ],
        [
          import("./LoginState.dto.js"),
          {
            LoginStateDTO: {
              user: { required: false, type: () => t["./User.dto"].UserDTO },
            },
          },
        ],
        [import("./Void.dto.js"), { VoidDTO: {} }],
      ],
      controllers: [],
    },
  };
};
