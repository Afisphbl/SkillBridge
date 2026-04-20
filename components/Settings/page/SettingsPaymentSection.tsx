import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { SectionShell } from "@/components/Settings/page/SettingsPageShared";

function useSettingsPaymentSectionData() {
  const {
    actions,
    buyerPayment,
    dirty,
    role,
    savingBySection,
    sellerPayment,
    setBuyerPayment,
    setSellerPayment,
  } = useSettingsPageContext();

  const isSeller = role === "seller" || role === "both";

  return {
    actions,
    buyerPayment,
    dirty,
    isSeller,
    savingBySection,
    sellerPayment,
    setBuyerPayment,
    setSellerPayment,
  };
}

export function SettingsPaymentSection() {
  const {
    actions,
    buyerPayment,
    dirty,
    isSeller,
    savingBySection,
    sellerPayment,
    setBuyerPayment,
    setSellerPayment,
  } = useSettingsPaymentSectionData();

  return (
    <SectionShell
      title="Payment Settings"
      subtitle={
        isSeller
          ? "Manage payouts, withdrawals, and billing details."
          : "Manage buyer payment methods and transaction snapshots."
      }
    >
      {isSeller ? (
        <>
          <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Earnings summary
            </p>
            <p className="mt-1 text-2xl font-black text-(--text-primary)">
              $2,430.00
            </p>
            <p className="text-xs text-(--text-muted)">
              Available for next payout cycle.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="settings-withdrawal-method"
                className="text-xs font-semibold text-(--text-muted)"
              >
                Withdrawal method
              </label>
              <select
                id="settings-withdrawal-method"
                title="Seller withdrawal method"
                aria-label="Seller withdrawal method"
                value={sellerPayment.withdrawalMethod}
                onChange={(event) =>
                  setSellerPayment((current) => ({
                    ...current,
                    withdrawalMethod: event.target.value as
                      | "bank"
                      | "wallet"
                      | "none",
                  }))
                }
                className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm text-(--text-primary)"
              >
                <option value="none">Not configured</option>
                <option value="bank">Bank account</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-(--text-muted)">
                Payout account
              </label>
              <Input
                value={sellerPayment.payoutAccount}
                onChange={(event) =>
                  setSellerPayment((current) => ({
                    ...current,
                    payoutAccount: event.target.value,
                  }))
                }
                placeholder="Account / wallet identifier"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-(--text-muted)">
                Tax / billing ID (optional)
              </label>
              <Input
                value={sellerPayment.taxId}
                onChange={(event) =>
                  setSellerPayment((current) => ({
                    ...current,
                    taxId: event.target.value,
                  }))
                }
                placeholder="Tax number"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Payment methods
            </p>
            {buyerPayment.methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2"
              >
                <p className="text-sm font-semibold text-(--text-primary)">
                  {method.label} •••• {method.last4}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setBuyerPayment((current) => ({
                      ...current,
                      methods: current.methods.filter(
                        (entry) => entry.id !== method.id,
                      ),
                    }))
                  }
                  className="text-xs font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setBuyerPayment((current) => ({
                  ...current,
                  methods: [
                    ...current.methods,
                    {
                      id: `pm-${Date.now()}`,
                      label: "Mastercard",
                      last4: String(Math.floor(Math.random() * 9000) + 1000),
                    },
                  ],
                }))
              }
              className="inline-flex h-10 items-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-3 text-sm font-semibold text-(--btn-text-secondary)"
            >
              Add payment method
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Transaction preview
            </p>
            {buyerPayment.transactionPreview.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {entry.label}
                  </p>
                  <p className="text-xs text-(--text-muted)">{entry.date}</p>
                </div>
                <p className="text-sm font-bold text-(--text-primary)">
                  {entry.amount}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        disabled={!dirty.payment || savingBySection.payment}
        onClick={() => void actions.savePayment()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {savingBySection.payment ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          "Save payment"
        )}
      </button>
    </SectionShell>
  );
}
