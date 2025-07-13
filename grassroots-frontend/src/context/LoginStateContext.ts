import { createContext } from "react";
import { grassrootsAPI } from "../GrassRootsAPI";
import { UserDTO } from "../grassroots-shared/User.dto";
import { Permission } from "../grassroots-shared/Permission";

export const LOGIN_URL = "http://grassroots.org/api/auth/login";

export interface LoginState {
  user: UserDTO;
  logout: () => Promise<void>;
}

export const LoginStateContext = createContext<Promise<LoginState | undefined>>(
  Promise.resolve(undefined),
);

// We don't use tanstack query here because this value never mutates.
// Each page load we're either logged in or we're not.
export async function getLoginState(): Promise<LoginState | undefined> {
  const is_authenticated = await grassrootsAPI.GET("/auth/is_authenticated");
  const user = is_authenticated.data?.user;
  if (!user) {
    return undefined;
  }

  const logout = async (): Promise<void> => {
    await grassrootsAPI.POST("/auth/logout", {});
    window.location.reload();
  };

  // The complexity here is solely to map from permissinos being strings
  // to permissions having the proper enum type.
  return {
    user: {
      ...user,
      userRoles: user.userRoles?.map((userRole) => {
        return {
          ...userRole,
          role: {
            ...userRole.role,
            permissions: userRole.role.permissions?.map(
              (permission) => Permission[permission],
            ),
          },
        };
      }),
    },
    logout,
  };
}
