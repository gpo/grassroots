import {
  useQuery,
  useQueryClient,
  useMutation,
  UseQueryResult,
  UseMutateAsyncFunction,
} from "@tanstack/react-query";
import { LoginStateDTO } from "../grassroots-shared/LoginState.dto";
import { grassrootsAPI } from "../GrassRootsAPI";

const LOGIN_STATE_QUERY_KEY = "loginState";

// This will go away once we just protect all routes requiring login.
export const LOGIN_URL = "http://grassroots.org/api/auth/login";

export function useLoginState(): {
  isLoggedIn: UseQueryResult<LoginStateDTO>;
  logout: UseMutateAsyncFunction<void>;
} {
  const isLoggedIn = useQuery<LoginStateDTO>({
    queryKey: [LOGIN_STATE_QUERY_KEY],
    retry: 1,
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/auth/is_authenticated");
      return result.data ?? ({ user: undefined } satisfies LoginStateDTO);
    },
  });

  const queryClient = useQueryClient();

  const { mutateAsync: logout } = useMutation({
    mutationFn: async () => {
      await grassrootsAPI.POST("/auth/logout", {});
    },
    retry: 1,
    onSuccess: () => {
      // Fully clear the query cache to avoid leaking data across the signout boundary.
      queryClient.getQueryCache().clear();
    },
  });

  return { isLoggedIn, logout };
}
