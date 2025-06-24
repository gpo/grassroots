import {
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryResult,
  UseMutateAsyncFunction,
  QueryClient,
} from "@tanstack/react-query";
import { LoginStateDTO } from "../grassroots-shared/LoginState.dto";
import { grassrootsAPI } from "../GrassRootsAPI";
import { UserEntity } from "../grassroots-shared/User.entity";

const LOGIN_STATE_QUERY_KEY = "loginState";

// This will go away once we just protect all routes requiring login.
export const LOGIN_URL = "http://grassroots.org/api/auth/login";

export interface LoginState {
  isLoggedIn: boolean;
  user: UserEntity | undefined;
  isLoggedInQueryResult: UseQueryResult<LoginStateDTO>;
  logout: UseMutateAsyncFunction<void>;
}

// This is used outside of the QueryClientProvider, so we support passing
// a QueryClient manually in addition to use the QueryClient from
// QueryClientProvider.
export function useLoginState(queryClient?: QueryClient): LoginState {
  queryClient ??= useQueryClient();

  const isLoggedInQueryResult = useQuery<LoginStateDTO>(
    {
      queryKey: [LOGIN_STATE_QUERY_KEY],
      retry: 1,
      queryFn: async () => {
        const result = await grassrootsAPI.GET("/auth/is_authenticated");
        return result.data ?? ({ isLoggedIn: false } satisfies LoginStateDTO);
      },
    },
    queryClient,
  );

  const { mutateAsync: logout } = useMutation(
    {
      mutationFn: async () => {
        await grassrootsAPI.POST("/auth/logout", {});
      },
      retry: 1,
      onSuccess: () => {
        // Fully clear the query cache to avoid leaking data across the signout boundary.
        queryClient.getQueryCache().clear();
      },
    },
    queryClient,
  );

  return {
    isLoggedIn: isLoggedInQueryResult.data?.isLoggedIn ?? false,
    user: isLoggedInQueryResult.data?.user,
    logout,
    isLoggedInQueryResult,
  };
}
