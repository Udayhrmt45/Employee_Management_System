import { useUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/authService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';

export function useAuthUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { sessionId, getToken, signOut } = useAuth();
  const {
    data: profile,
    isLoading: isProfileLoading,
    error,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return getApiData(response, null);
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    isLoaded: isLoaded && (!isSignedIn || !isProfileLoading),
    isAuthenticated: isSignedIn,
    user,
    sessionId,
    userId: profile?.id || user?.id || null,
    clerkUserId: profile?.clerkUserId || user?.id || null,
    companyId: profile?.companyId || null,
    companyName: profile?.companyName || null,
    employeeId: profile?.employeeId || null,
    userRole: profile?.role || null,
    workspaceInitialized: Boolean(profile?.workspaceInitialized),
    profile,
    profileError: getErrorMessage(error, 'Unable to load current user profile.'),
    getToken,
    signOut,
  };
}
