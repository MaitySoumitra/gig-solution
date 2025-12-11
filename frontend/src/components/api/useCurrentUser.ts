import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppDispatch } from "../redux/app/hook";
import { setAuthState, logout } from "../redux/features/User/login/loginSlice";

export const useCurrentUser = () => {
    const dispatch = useAppDispatch();

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/users/profile`,
                    { withCredentials: true }
                );

                const user = res.data.user;

                dispatch(setAuthState(user));

                return user;
            } catch (error) {
                // Perform "onError" logic here
                dispatch(logout());
                throw error; // must rethrow so React Query knows it failed
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false
    });
};
