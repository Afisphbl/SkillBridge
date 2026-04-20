import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { StickySave } from "@/components/Settings/page/SettingsPageShared";

function useSettingsStickySavesData() {
  const { actions, activeTab, dirty, savingBySection } =
    useSettingsPageContext();

  return { actions, activeTab, dirty, savingBySection };
}

export function SettingsStickySaves() {
  const { actions, activeTab, dirty, savingBySection } =
    useSettingsStickySavesData();

  return (
    <>
      <StickySave
        visible={activeTab === "profile"}
        disabled={!dirty.profile}
        loading={savingBySection.profile}
        onSave={() => void actions.saveProfile()}
        label="Save profile"
      />
      <StickySave
        visible={activeTab === "security"}
        disabled={!dirty.security}
        loading={savingBySection.security}
        onSave={() => void actions.saveSecurity()}
        label="Save security"
      />
      <StickySave
        visible={activeTab === "notifications"}
        disabled={!dirty.notifications}
        loading={savingBySection.notifications}
        onSave={() => void actions.saveNotifications()}
        label="Save notifications"
      />
      <StickySave
        visible={activeTab === "payment"}
        disabled={!dirty.payment}
        loading={savingBySection.payment}
        onSave={() => void actions.savePayment()}
        label="Save payment"
      />
      <StickySave
        visible={activeTab === "privacy"}
        disabled={!dirty.privacy}
        loading={savingBySection.privacy}
        onSave={() => void actions.savePrivacy()}
        label="Save privacy"
      />
      <StickySave
        visible={activeTab === "account"}
        disabled={!dirty.account}
        loading={savingBySection.account}
        onSave={() => void actions.saveAccount()}
        label="Save account"
      />
    </>
  );
}
