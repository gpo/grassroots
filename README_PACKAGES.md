# Packages

This doc describes the function and dependency tree of the packages in this repo.

## generate-metadata

Directly reads source from grassroots-shared, but otherwise has no dependency.
Writes metadata.ts into grassroots-shared.

## grassroots-shared

Depends on generate-metadata to have created metadata.ts.
Contains all logic shared between frontend and backend that doesn't rely on generated openAPI bindings.

## openapi-paths

Depends on grassroots-shared, as it calls the backend with --gen-files-only which depends on grassroots-shared. Produces and contains the openAPI bindings.

## grassroots-shared-net

Contains logic shared between frontend and backend that relies on generated openAPI bindings.
For the backend, this is mostly test infrastructure.

## grassroots-backend

Depends on all of the above (though only indirectly on generate-metadata).
Contains the backend.

## grassroots-frontend

Same dependencies as the backend.
Contains the frontend.

## eslint_rules

No dependencies. Builds custom eslint rules. Must be built before linting.
