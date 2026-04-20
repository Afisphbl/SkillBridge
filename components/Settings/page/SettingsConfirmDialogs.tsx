import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { ConfirmModal } from "@/components/Settings/page/SettingsPageShared";

function useSettingsConfirmDialogsData() {
  const { closeConfirm, confirmState, runConfirmAction, savingBySection } =
    useSettingsPageContext();

  return {
    closeConfirm,
    confirmState,
    runConfirmAction,
    savingBySection,
  };
}

export function SettingsConfirmDialogs() {
  const { closeConfirm, confirmState, runConfirmAction, savingBySection } =
    useSettingsConfirmDialogsData();

  return (
    <>
      <ConfirmModal
        open={confirmState.open && confirmState.action === "logout-all"}
        title="Logout from all devices"
        description="This signs you out from every active session and requires login again."
        confirmText="Confirm logout"
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.security}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "export"}
        title="Request data export"
        description="SkillBridge will prepare your account data and notify you when export is ready."
        confirmText="Request export"
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "deactivate"}
        title="Deactivate account"
        description="You can return later by logging in again."
        confirmText="Deactivate"
        danger
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "delete"}
        title="Delete account permanently"
        description="This is irreversible and permanently removes your account from SkillBridge."
        confirmText="Delete forever"
        danger
        requiresDeleteWord
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />
    </>
  );
}
