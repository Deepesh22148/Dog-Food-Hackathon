import { invalidateSession } from "@/lib/auth/invalidateSession";

const logoutUser = async () => {
  await invalidateSession();

  return {
    success: true,
  };
};

export default logoutUser;