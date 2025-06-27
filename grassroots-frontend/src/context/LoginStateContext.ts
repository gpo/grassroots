import { createContext } from "react";
import { grassrootsAPI } from "../GrassRootsAPI";
import { UserEntity } from "../grassroots-shared/User.entity";

export const LOGIN_URL = "http://grassroots.org/api/auth/login";

export interface LoginState {
  user: UserEntity;
  logout: () => Promise<void>;
}

export const LoginStateContext = createContext<Promise<LoginState | undefined>>(
  Promise.resolve(undefined),
);

// We don't use tanstack query here because this value never mutates.
// Each page load we're either logged in or we're not.
export async function getLoginState(): Promise<LoginState | undefined> {
  const is_authenticated = await grassrootsAPI.GET("/auth/is_authenticated");

  if (!is_authenticated.data?.user) {
    return undefined;
  }

  const logout = async (): Promise<void> => {
    await grassrootsAPI.POST("/auth/logout", {});
    window.location.reload();
  };

  return {
    user: is_authenticated.data.user,
    logout,
  };
}
