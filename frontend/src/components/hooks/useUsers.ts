import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import type{ User } from '../types/allType';

interface UsersResponse {
  total: number;
  users: User[];
}

export const useUsers = () => {
  return useQuery<UsersResponse>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/users/all');
      return res.data;
    },
  });
};
