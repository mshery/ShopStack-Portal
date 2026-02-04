import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from "@/modules/auth/api/authApi";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  AuthUser,
} from "@/modules/auth/api/authApi";
import { useAuthStore } from "@/modules/auth";
import type { AsyncStatus } from "@/shared/types/api";

export function useProfileScreen() {
  const queryClient = useQueryClient();
  const { currentUser, setCurrentUser } = useAuthStore();

  // Local state for UI feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch latest profile
  const {
    data: userProfile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authApi.getProfile(),
    initialData: currentUser as unknown as AuthUser | undefined,
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update global auth store
      // We need to cast because AuthUser might be slightly different key-wise but compatible
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCurrentUser(updatedUser as any);
      // Update query cache
      queryClient.setQueryData(["auth", "profile"], updatedUser);
      setSuccessMessage("Profile updated successfully");
      setErrorMessage(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      setErrorMessage(msg);
      setSuccessMessage(null);
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => authApi.changePassword(data),
    onSuccess: () => {
      setSuccessMessage("Password changed successfully");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to change password";
      setErrorMessage(msg);
      setSuccessMessage(null);
    },
  });

  // Derive Status
  const status: AsyncStatus = useMemo(() => {
    if (isLoading) return "loading";
    if (isError) return "error";
    return "success";
  }, [isLoading, isError]);

  // Actions
  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      setErrorMessage(null);
      try {
        await updateProfileMutation.mutateAsync(data);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [updateProfileMutation],
  );

  const changePassword = useCallback(
    async (data: ChangePasswordInput) => {
      setErrorMessage(null);
      try {
        await changePasswordMutation.mutateAsync(data);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [changePasswordMutation],
  );

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  // View Model
  const vm = useMemo(
    () => ({
      user: userProfile,
      isLoading: status === "loading",
      isUpdating: updateProfileMutation.isPending,
      isChangingPassword: changePasswordMutation.isPending,
      errorMessage,
      successMessage,
      // Helper to get initials
      initials: userProfile?.name
        ? userProfile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U",
    }),
    [
      userProfile,
      status,
      updateProfileMutation.isPending,
      changePasswordMutation.isPending,
      errorMessage,
      successMessage,
    ],
  );

  const actions = {
    updateProfile,
    changePassword,
    clearMessages,
    refresh: refetch,
  };

  return { status, vm, actions };
}
