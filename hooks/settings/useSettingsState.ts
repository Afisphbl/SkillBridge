"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/services/supabase/client";
import { updateUser } from "@/services/supabase/userApi";
import { uploadAvatar } from "@/services/supabase/storageApi";

export type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "payment"
  | "privacy"
  | "account"
  | "availability"
  | "danger";

export type NotificationSettings = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  orderUpdates: boolean;
  messageAlerts: boolean;
  marketingEmails: boolean;
};

export type PrivacySettings = {
  profileVisibility: "public" | "private" | "limited";
  onlineStatus: boolean;
  searchEngineVisibility: boolean;
  blockedUsers: Array<{ id: string; name: string }>;
};

export type BuyerPaymentSettings = {
  methods: Array<{ id: string; label: string; last4: string }>;
  transactionPreview: Array<{
    id: string;
    label: string;
    amount: string;
    date: string;
  }>;
};

export type SellerPaymentSettings = {
  withdrawalMethod: "bank" | "wallet" | "none";
  payoutAccount: string;
  taxId: string;
};

export type AccountSettings = {
  email: string;
  language: string;
  themeMode: "light" | "dark" | "system";
};

export type ProfileSettings = {
  fullName: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  skills: string;
  languages: string;
  professionalTitle: string;
  website: string;
  portfolioLink: string;
  avatarPreview: string;
  avatarFile: File | null;
};

export type SecuritySettings = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
};

export type AvailabilitySettings = {
  workingDays: string[];
  startTime: string;
  endTime: string;
  vacationMode: boolean;
  vacationStart: string;
  vacationEnd: string;
  autoReply: string;
};

type PersistedSettings = {
  profileExtras: {
    username: string;
    displayName: string;
    location: string;
    skills: string;
    languages: string;
    professionalTitle: string;
    website: string;
    portfolioLink: string;
  };
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  buyerPayment: BuyerPaymentSettings;
  sellerPayment: SellerPaymentSettings;
  security: {
    twoFactorEnabled: boolean;
  };
  account: {
    language: string;
  };
  availability: AvailabilitySettings;
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  inAppNotifications: true,
  orderUpdates: true,
  messageAlerts: true,
  marketingEmails: false,
};

const defaultPrivacy: PrivacySettings = {
  profileVisibility: "public",
  onlineStatus: true,
  searchEngineVisibility: true,
  blockedUsers: [
    { id: "u-101", name: "Blocked User 1" },
    { id: "u-102", name: "Blocked User 2" },
  ],
};

const defaultBuyerPayment: BuyerPaymentSettings = {
  methods: [{ id: "pm-1", label: "Visa", last4: "4242" }],
  transactionPreview: [
    {
      id: "t-1",
      label: "Logo Design Order",
      amount: "$120.00",
      date: "Apr 17",
    },
    { id: "t-2", label: "Landing Page Copy", amount: "$85.00", date: "Apr 12" },
  ],
};

const defaultSellerPayment: SellerPaymentSettings = {
  withdrawalMethod: "none",
  payoutAccount: "",
  taxId: "",
};

const defaultProfile: ProfileSettings = {
  fullName: "",
  username: "",
  displayName: "",
  bio: "",
  location: "",
  skills: "",
  languages: "",
  professionalTitle: "",
  website: "",
  portfolioLink: "",
  avatarPreview: "",
  avatarFile: null,
};

const defaultSecurity: SecuritySettings = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
};

const defaultAvailability: AvailabilitySettings = {
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "09:00",
  endTime: "17:00",
  vacationMode: false,
  vacationStart: "",
  vacationEnd: "",
  autoReply: "",
};

const defaultAccount: AccountSettings = {
  email: "",
  language: "English",
  themeMode: "system",
};

function safeParse<T>(rawValue: string | null): T | null {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function cloneProfileForCompare(profile: ProfileSettings) {
  return {
    fullName: profile.fullName,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    location: profile.location,
    skills: profile.skills,
    languages: profile.languages,
    professionalTitle: profile.professionalTitle,
    website: profile.website,
    portfolioLink: profile.portfolioLink,
    avatarPreview: profile.avatarPreview,
  };
}

function readPersistedSettings(userId: string): PersistedSettings | null {
  if (typeof window === "undefined") return null;
  return safeParse<PersistedSettings>(
    window.localStorage.getItem(`skillbridge-settings:${userId}`),
  );
}

function writePersistedSettings(userId: string, payload: PersistedSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `skillbridge-settings:${userId}`,
    JSON.stringify(payload),
  );
}

export function useSettingsState() {
  const { session, handleSignOut } = useAuth();
  const { profile, refreshProfile, loading } = useUser();
  const { mode, setMode } = useTheme();

  const userId = session?.user?.id ?? "";
  const role = profile?.role ?? "buyer";

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [profileSettings, setProfileSettings] =
    useState<ProfileSettings>(defaultProfile);
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings>(defaultSecurity);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(defaultNotifications);
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySettings>(defaultPrivacy);
  const [buyerPayment, setBuyerPayment] =
    useState<BuyerPaymentSettings>(defaultBuyerPayment);
  const [sellerPayment, setSellerPayment] =
    useState<SellerPaymentSettings>(defaultSellerPayment);
  const [accountSettings, setAccountSettings] =
    useState<AccountSettings>(defaultAccount);

  const [availabilitySettings, setAvailabilitySettings] =
    useState<AvailabilitySettings>(defaultAvailability);

  const [savingBySection, setSavingBySection] = useState<
    Record<SettingsTab, boolean>
  >({
    profile: false,
    security: false,
    notifications: false,
    payment: false,
    privacy: false,
    account: false,
    availability: false,
    danger: false,
  });

  const [initialProfile, setInitialProfile] = useState(defaultProfile);
  const [initialNotifications, setInitialNotifications] =
    useState(defaultNotifications);
  const [initialPrivacy, setInitialPrivacy] = useState(defaultPrivacy);
  const [initialBuyerPayment, setInitialBuyerPayment] =
    useState(defaultBuyerPayment);
  const [initialSellerPayment, setInitialSellerPayment] =
    useState(defaultSellerPayment);
  const [initialSecurity, setInitialSecurity] = useState(defaultSecurity);
  const [initialAccount, setInitialAccount] = useState(defaultAccount);
  const [initialAvailability, setInitialAvailability] =
    useState(defaultAvailability);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const persisted = readPersistedSettings(userId);

    const profileExtras = persisted?.profileExtras ?? {
      username: "",
      displayName: "",
      location: "",
      skills: "",
      languages: "",
      professionalTitle: "",
      website: "",
      portfolioLink: "",
    };

    const nextProfile: ProfileSettings = {
      fullName: profile?.full_name ?? "",
      username: profileExtras.username,
      displayName: profileExtras.displayName,
      bio: profile?.bio ?? "",
      location: profileExtras.location,
      skills: profileExtras.skills,
      languages: profileExtras.languages,
      professionalTitle: profileExtras.professionalTitle,
      website: profileExtras.website,
      portfolioLink: profileExtras.portfolioLink,
      avatarPreview: profile?.avatar ?? "",
      avatarFile: null,
    };

    const nextNotifications = persisted?.notifications ?? defaultNotifications;
    const nextPrivacy = persisted?.privacy ?? defaultPrivacy;
    const nextBuyerPayment = persisted?.buyerPayment ?? defaultBuyerPayment;
    const nextSellerPayment = persisted?.sellerPayment ?? defaultSellerPayment;
    const nextAvailability = persisted?.availability ?? defaultAvailability;
    const nextSecurity: SecuritySettings = {
      ...defaultSecurity,
      twoFactorEnabled: persisted?.security?.twoFactorEnabled ?? false,
    };
    const nextAccount: AccountSettings = {
      email: session?.user?.email ?? profile?.email ?? "",
      language: persisted?.account?.language ?? "English",
      themeMode: mode,
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileSettings(nextProfile);
    setSecuritySettings(nextSecurity);
    setNotificationSettings(nextNotifications);
    setPrivacySettings(nextPrivacy);
    setBuyerPayment(nextBuyerPayment);
    setSellerPayment(nextSellerPayment);
    setAccountSettings(nextAccount);
    setAvailabilitySettings(nextAvailability);

    setInitialProfile(nextProfile);
    setInitialSecurity(nextSecurity);
    setInitialNotifications(nextNotifications);
    setInitialPrivacy(nextPrivacy);
    setInitialBuyerPayment(nextBuyerPayment);
    setInitialSellerPayment(nextSellerPayment);
    setInitialAccount(nextAccount);
    setInitialAvailability(nextAvailability);
  }, [
    mode,
    profile?.avatar,
    profile?.bio,
    profile?.email,
    profile?.full_name,
    session?.user?.email,
    userId,
  ]);

  const isProfileDirty = useMemo(() => {
    return (
      JSON.stringify(cloneProfileForCompare(profileSettings)) !==
        JSON.stringify(cloneProfileForCompare(initialProfile)) ||
      Boolean(profileSettings.avatarFile)
    );
  }, [initialProfile, profileSettings]);

  const isSecurityDirty = useMemo(() => {
    return (
      securitySettings.twoFactorEnabled !== initialSecurity.twoFactorEnabled ||
      Boolean(securitySettings.currentPassword) ||
      Boolean(securitySettings.newPassword) ||
      Boolean(securitySettings.confirmPassword)
    );
  }, [initialSecurity.twoFactorEnabled, securitySettings]);

  const isNotificationsDirty = useMemo(
    () =>
      JSON.stringify(notificationSettings) !==
      JSON.stringify(initialNotifications),
    [initialNotifications, notificationSettings],
  );

  const isPrivacyDirty = useMemo(
    () => JSON.stringify(privacySettings) !== JSON.stringify(initialPrivacy),
    [initialPrivacy, privacySettings],
  );

  const isPaymentDirty = useMemo(() => {
    if (role === "seller") {
      return (
        JSON.stringify(sellerPayment) !== JSON.stringify(initialSellerPayment)
      );
    }

    return JSON.stringify(buyerPayment) !== JSON.stringify(initialBuyerPayment);
  }, [
    buyerPayment,
    initialBuyerPayment,
    initialSellerPayment,
    role,
    sellerPayment,
  ]);

  const isAccountDirty = useMemo(
    () => JSON.stringify(accountSettings) !== JSON.stringify(initialAccount),
    [accountSettings, initialAccount],
  );
 
  const isAvailabilityDirty = useMemo(
    () =>
      JSON.stringify(availabilitySettings) !==
      JSON.stringify(initialAvailability),
    [availabilitySettings, initialAvailability],
  );

  const hasUnsavedChanges =
    isProfileDirty ||
    isSecurityDirty ||
    isNotificationsDirty ||
    isPrivacyDirty ||
    isPaymentDirty ||
    isAccountDirty ||
    isAvailabilityDirty;

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [hasUnsavedChanges]);

  const persistLocalSettings = useCallback(() => {
    if (!userId) return;

    const payload: PersistedSettings = {
      profileExtras: {
        username: profileSettings.username,
        displayName: profileSettings.displayName,
        location: profileSettings.location,
        skills: profileSettings.skills,
        languages: profileSettings.languages,
        professionalTitle: profileSettings.professionalTitle,
        website: profileSettings.website,
        portfolioLink: profileSettings.portfolioLink,
      },
      notifications: notificationSettings,
      privacy: privacySettings,
      buyerPayment,
      sellerPayment,
      security: {
        twoFactorEnabled: securitySettings.twoFactorEnabled,
      },
      account: {
        language: accountSettings.language,
      },
      availability: availabilitySettings,
    };

    writePersistedSettings(userId, payload);
  }, [
    accountSettings.language,
    availabilitySettings,
    buyerPayment,
    notificationSettings,
    privacySettings,
    profileSettings.displayName,
    profileSettings.languages,
    profileSettings.location,
    profileSettings.professionalTitle,
    profileSettings.skills,
    profileSettings.website,
    profileSettings.portfolioLink,
    profileSettings.username,
    securitySettings.twoFactorEnabled,
    sellerPayment,
    userId,
  ]);

  const setSectionSaving = useCallback(
    (section: SettingsTab, saving: boolean) => {
      setSavingBySection((current) => ({ ...current, [section]: saving }));
    },
    [],
  );

  const saveProfile = useCallback(async () => {
    if (!userId) {
      toast.error("Could not identify your account.");
      return;
    }

    if (!profileSettings.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setSectionSaving("profile", true);
    let nextAvatar = profileSettings.avatarPreview || profile?.avatar || "";

    try {
      if (profileSettings.avatarFile) {
        nextAvatar = await uploadAvatar(profileSettings.avatarFile, userId);
      }

      const { error } = await updateUser(userId, {
        full_name: profileSettings.fullName.trim(),
        role: profile?.role || "buyer",
        avatar: nextAvatar,
        bio: profileSettings.bio.trim(),
        professional_title: profileSettings.professionalTitle,
        website: profileSettings.website,
        portfolio_link: profileSettings.portfolioLink,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile settings.");
        return;
      }

      const nextState: ProfileSettings = {
        ...profileSettings,
        avatarPreview: nextAvatar,
        avatarFile: null,
      };

      setProfileSettings(nextState);
      setInitialProfile(nextState);
      persistLocalSettings();
      await refreshProfile();
      window.dispatchEvent(new CustomEvent("skillbridge:user-updated"));
      toast.success("Profile settings updated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile settings.";
      toast.error(message);
    } finally {
      setSectionSaving("profile", false);
    }
  }, [
    persistLocalSettings,
    profile,
    profileSettings,
    refreshProfile,
    setSectionSaving,
    userId,
  ]);

  const saveNotifications = useCallback(async () => {
    setSectionSaving("notifications", true);
    setInitialNotifications(notificationSettings);
    persistLocalSettings();
    toast.success("Notification settings updated.");
    setSectionSaving("notifications", false);
  }, [notificationSettings, persistLocalSettings, setSectionSaving]);

  const savePrivacy = useCallback(async () => {
    setSectionSaving("privacy", true);
    setInitialPrivacy(privacySettings);
    persistLocalSettings();
    toast.success("Privacy settings updated.");
    setSectionSaving("privacy", false);
  }, [persistLocalSettings, privacySettings, setSectionSaving]);

  const savePayment = useCallback(async () => {
    setSectionSaving("payment", true);

    if (role === "seller") {
      setInitialSellerPayment(sellerPayment);
    } else {
      setInitialBuyerPayment(buyerPayment);
    }

    persistLocalSettings();
    toast.success("Payment settings updated.");
    setSectionSaving("payment", false);
  }, [
    buyerPayment,
    persistLocalSettings,
    role,
    sellerPayment,
    setSectionSaving,
  ]);
 
  const saveAvailability = useCallback(async () => {
    setSectionSaving("availability", true);
    setInitialAvailability(availabilitySettings);
    persistLocalSettings();
    toast.success("Availability preferences saved.");
    setSectionSaving("availability", false);
  }, [availabilitySettings, persistLocalSettings, setSectionSaving]);

  const saveAccount = useCallback(async () => {
    setSectionSaving("account", true);

    try {
      const email = session?.user?.email;
      if (!email) {
        toast.error("Could not verify your current account.");
        return;
      }

      if (accountSettings.email !== email) {
        if (!securitySettings.currentPassword.trim()) {
          toast.error("Current password is required to change email.");
          return;
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: securitySettings.currentPassword,
        });

        if (verifyError) {
          toast.error("Current password is incorrect.");
          return;
        }
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: accountSettings.email,
        });

        if (emailUpdateError) {
          toast.error(
            emailUpdateError.message || "Failed to request email change.",
          );
          return;
        }

        toast.success(
          "Email update requested. Check your inbox for confirmation.",
        );
      }

      setMode(accountSettings.themeMode);
      persistLocalSettings();
      setInitialAccount(accountSettings);
      setSecuritySettings((current) => ({ ...current, currentPassword: "" }));
      toast.success("Account settings saved.");
    } finally {
      setSectionSaving("account", false);
    }
  }, [
    accountSettings,
    persistLocalSettings,
    securitySettings.currentPassword,
    session?.user?.email,
    setMode,
    setSectionSaving,
  ]);

  const saveSecurity = useCallback(async () => {
    setSectionSaving("security", true);

    try {
      const email = session?.user?.email;
      if (!email) {
        toast.error("Could not identify your account.");
        return;
      }

      const wantsPasswordChange =
        Boolean(securitySettings.currentPassword) ||
        Boolean(securitySettings.newPassword) ||
        Boolean(securitySettings.confirmPassword);

      if (wantsPasswordChange) {
        if (
          !securitySettings.currentPassword ||
          !securitySettings.newPassword
        ) {
          toast.error("Current password and new password are required.");
          return;
        }

        if (securitySettings.newPassword.length < 8) {
          toast.error("New password must be at least 8 characters.");
          return;
        }

        if (securitySettings.newPassword !== securitySettings.confirmPassword) {
          toast.error("New password and confirmation must match.");
          return;
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: securitySettings.currentPassword,
        });

        if (verifyError) {
          toast.error("Current password is incorrect.");
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: securitySettings.newPassword,
        });

        if (updateError) {
          toast.error(updateError.message || "Failed to change password.");
          return;
        }
      }

      const nextSecurity = {
        ...securitySettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      setSecuritySettings(nextSecurity);
      setInitialSecurity(nextSecurity);
      persistLocalSettings();
      toast.success("Security settings saved.");
    } finally {
      setSectionSaving("security", false);
    }
  }, [
    persistLocalSettings,
    securitySettings,
    session?.user?.email,
    setSectionSaving,
  ]);

  const logoutAllDevices = useCallback(async () => {
    setSectionSaving("security", true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        toast.error(error.message || "Failed to log out from all devices.");
        return;
      }

      toast.success("Logged out from all devices.");
      await handleSignOut();
    } finally {
      setSectionSaving("security", false);
    }
  }, [handleSignOut, setSectionSaving]);

  const removeBlockedUser = useCallback((userToRemoveId: string) => {
    setPrivacySettings((current) => ({
      ...current,
      blockedUsers: current.blockedUsers.filter(
        (entry) => entry.id !== userToRemoveId,
      ),
    }));
  }, []);

  const saveDangerAction = useCallback(
    async (action: "deactivate" | "delete" | "export") => {
      setSectionSaving("danger", true);
      try {
        if (action === "export") {
          toast.success("Data export request submitted.");
          return;
        }

        if (action === "deactivate") {
          toast.success("Your account has been deactivated for now.");
          await handleSignOut();
          return;
        }

        if (!userId) {
          toast.error("Could not identify your account.");
          return;
        }

        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", userId);
        if (error) {
          toast.error(error.message || "Failed to delete account.");
          return;
        }

        toast.success("Account deleted permanently.");
        await handleSignOut();
      } finally {
        setSectionSaving("danger", false);
      }
    },
    [handleSignOut, setSectionSaving, userId],
  );

  const securityLevel = useMemo(() => {
    const score = [
      securitySettings.twoFactorEnabled,
      Boolean(profileSettings.avatarPreview),
      Boolean(profileSettings.bio.trim()),
    ].filter(Boolean).length;

    if (score <= 1) return "Low";
    if (score === 2) return "Medium";
    return "High";
  }, [
    profileSettings.avatarPreview,
    profileSettings.bio,
    securitySettings.twoFactorEnabled,
  ]);

  const activeSessions = useMemo(() => {
    const createdAt =
      session?.user?.last_sign_in_at ?? session?.user?.created_at;
    const dateLabel = createdAt
      ? new Date(createdAt).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unknown";

    return [
      {
        id: "current",
        device: "Current Browser Session",
        location: "This device",
        lastActive: dateLabel,
        current: true,
      },
    ];
  }, [session?.user?.created_at, session?.user?.last_sign_in_at]);

  return {
    loading,
    hydrated: true,
    role,
    activeTab,
    setActiveTab,
    savingBySection,

    profileSettings,
    setProfileSettings,
    securitySettings,
    setSecuritySettings,
    notificationSettings,
    setNotificationSettings,
    privacySettings,
    setPrivacySettings,
    buyerPayment,
    setBuyerPayment,
    sellerPayment,
    setSellerPayment,
    accountSettings,
    setAccountSettings,
    availabilitySettings,
    setAvailabilitySettings,

    dirty: {
      profile: isProfileDirty,
      security: isSecurityDirty,
      notifications: isNotificationsDirty,
      privacy: isPrivacyDirty,
      payment: isPaymentDirty,
      account: isAccountDirty,
      availability: isAvailabilityDirty,
      any: hasUnsavedChanges,
    },

    securityLevel,
    activeSessions,

    actions: {
      saveProfile,
      saveSecurity,
      saveNotifications,
      savePrivacy,
      savePayment,
      saveAccount,
      saveAvailability,
      logoutAllDevices,
      removeBlockedUser,
      saveDangerAction,
      persistLocalSettings,
    },
  };
}
