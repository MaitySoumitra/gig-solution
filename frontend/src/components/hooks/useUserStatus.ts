import { useEffect, useState } from "react";
import type { UserStatus } from "../types/allType";


export function useUserStatus(userId?: string) {
  const [status, setStatus] = useState<UserStatus>(null);

  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(`user-status:${userId}`);
    if (saved) {
      setStatus(saved as UserStatus);
    }
  }, [userId]);

  const updateStatus = (newStatus: UserStatus) => {
    setStatus(newStatus);

    if (userId) {
      if (newStatus) {
        localStorage.setItem(`user-status:${userId}`, newStatus);
      } else {
        localStorage.removeItem(`user-status:${userId}`);
      }
    }
  };

  return { status, updateStatus };
}
