# Design Document: User Management in a Multi-Tenant Application

## TL;DR
This document outlines a hierarchical multi-tenant user management system for political organizations like the Green Parties in Canada. The system supports nested organizational structures with scoped permissions, where users can have different roles at different organizational levels. Key features include context switching between organizations, role-based permissions that can optionally cascade down the hierarchy, and clear visibility rules that prevent unauthorized upward access while allowing controlled downward access.

## Goals and Non-Goals

### Goals
- Support complex nested organizational hierarchies (e.g., Federal → Provincial → Riding → Campaign)
- Enable users to hold different roles across multiple organizations within the hierarchy
- Provide secure, scoped data access based on organizational position and assigned roles
- Allow authorized users to manage subordinate organizations while preventing unauthorized upward access
- Create an intuitive UI for context switching and user management across organizational boundaries
- Support future extensibility for custom role definitions and permissions

### Non-Goals
- Supporting multiple application instances or federated authentication across separate systems
- Automatic role synchronization across organizations (inheritance must be explicitly configured)
- Cross-organizational data sharing without explicit permission controls
- Real-time collaboration features or complex workflow management
- Integration with external identity providers (in initial implementation)

## Overview
This document outlines the design for user management within a multi-tenant application, tailored to the needs of nested, hierarchical political organizations such as the Green Parties in Canada. The system must support flexible user roles, scoped permissions, and a consistent, intuitive UI for navigating and managing users across organizational boundaries.

## Multi-Tenancy Structure

### Key Characteristics:
- **Nested Hierarchies**: Organizations are arranged in a tree structure, for example:
  - Green Parties in Canada
    - Green Party of Canada
      - Federal Riding Association (EDA) in Kitchener
        - Campaign to elect Mike Morrice (MP 2027)
    - Green Party of Ontario
      - Provincial Riding Association (CA) in Kitchener
        - Campaign to elect Aislinn Clancy (MPP 2029)

- **Single Application Instance**: All tenancies exist within a single instance of the application.
- **1:1 Mapping**: Each tenancy corresponds directly to a single organization.
- **Scoped Data Access**: Access to data and functionality is determined by the user's position within the hierarchy and their assigned roles and permissions.

### Visibility Rules:
- Users at higher levels can switch context and view or edit subordinate levels (if permitted).
- Users at lower levels (e.g., campaign) cannot view or edit data in higher levels.
- Users at mid-levels (e.g., CA/EDA) have visibility and control over their subtree.
- **No Automatic Downward Access**: Roles and permissions do not automatically propagate downward in the hierarchy. Instead, a special permission must be explicitly assigned to apply a role to all nested organizations. This prevents, for example, a user at the GPO level from accessing campaign-level call lists unless explicitly authorized.

## User Management Design

### Role and Permission Model:
- **Roles are Tenant-Specific**: Each role exists within a single organization.
- **Users Can Have Multiple Roles**: A user may hold different roles in different organizations.
- **Roles Aggregate Permissions**: Roles are composed of a set of permissions.
- **Users Do Not Have Direct Permissions**: All user access is derived from roles.

#### Special Permissions:

**Manage Users Permission:**
- Allows adding and removing users from the current tenancy
- Allows adding and removing permissions from users within the current tenancy
- Required for granting or revoking the nested access permission on any role

**Nested Access Permission:**
- Can be applied to any role as an additional permission
- Visually represented as a checkbox on every role in the UI
- When enabled, allows the role to apply to all nested (subordinate) organizations
- Can only be granted or revoked by users who have both:
  - A role with the "manage users" permission
  - The "nested access" permission enabled on that role

#### Role Inheritance and Display:

**Inherited Users in Nested Organizations:**
- Users with roles that have nested access enabled are displayed in all subordinate organizations
- Inherited users should be visually distinguished (e.g., displayed with reduced opacity)
- Inherited users can be optionally hidden in the UI for clarity
- Inherited roles cannot be modified or removed at lower organizational levels
- Additional roles can be granted to inherited users at lower levels (e.g., a "Volunteer Coordinator" at the GPO level might also be assigned "Campaign Manager" specifically at the Kitchener Centre riding level)

### Default Capabilities:
- All users can view other users in the same organization.
- Users with the `manage users` permission can add/remove/edit users within their organization.

### Extensibility:
- The role-permission system should be designed to support future customization by organizations (e.g., editable role definitions).

## UI Requirements

### Context Switching:
- A second-level menu should enable users to switch between organizations they belong to.
- The UI must clearly indicate the current organizational context.

### User Management Interface:
- Must support viewing, adding, editing, and removing users.
- Must clearly display roles and permissions scoped to the current organization.
- Should surface role information and context-switch options in an intuitive way.

## Future Work
- Implement organization-specific role/permission editing.
- Support audit logging of permission changes and user access across tenancies.
- Add UI refinements for large-scale org structures (e.g., tree navigation, breadcrumbs).

## Open Questions
- Should inherited roles/permissions be visible or modifiable at child levels?
- Should there be any cross-organization roles or global roles?
- How will impersonation or support-user access be handled?

---

This document is a starting point for implementation planning and feedback. Next steps include:
- Validating with stakeholders
- Drafting role and permission definitions
- Designing the database schema for orgs, roles, users, and permissions
- Creating wireframes for user and org management screens
