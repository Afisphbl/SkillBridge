import { FiShield } from "react-icons/fi";
import OrderFormFields from "@/components/Order/OrderFormFields";
import { useOrderFormModalContext } from "./OrderFormModalProvider";
import OrderFormPricingSummary from "./OrderFormPricingSummary";
import OrderFormServiceSummary from "./OrderFormServiceSummary";
import OrderFormStatusBanners from "./OrderFormStatusBanners";
import OrderFormSubmitActions from "./OrderFormSubmitActions";

function useOrderFormModalForm() {
  const {
    control,
    errors,
    handleOrderSubmit,
    handleSubmit,
    isFormDisabled,
    register,
    setValue,
    summary,
  } = useOrderFormModalContext();

  return {
    control,
    errors,
    handleOrderSubmit,
    handleSubmit,
    isFormDisabled,
    register,
    setValue,
    summary,
  };
}

export default function OrderFormModalForm() {
  const {
    control,
    errors,
    handleOrderSubmit,
    handleSubmit,
    isFormDisabled,
    register,
    setValue,
    summary,
  } = useOrderFormModalForm();

  return (
    <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8 sm:pb-7">
      <div className="space-y-6">
        <OrderFormServiceSummary />

        <form onSubmit={handleSubmit(handleOrderSubmit)} className="space-y-5">
          <OrderFormStatusBanners />

          <section className="space-y-2">
            <h3 className="text-4xl font-black tracking-tight text-(--text-primary) sm:text-[1.9rem]">
              Order Details
            </h3>
            <p className="text-base text-(--text-secondary)">
              Tell the seller what you need
            </p>
          </section>

          <div className="space-y-6">
            <OrderFormFields
              register={register}
              control={control}
              setValue={setValue}
              errors={errors}
              disabled={isFormDisabled}
            />
          </div>

          <OrderFormPricingSummary />

          <div className="flex items-start gap-3 rounded-2xl bg-(--badge-success-bg) px-4 py-3 text-sm text-(--text-secondary) ring-1 ring-(--border-color)">
            <FiShield className="mt-0.5 size-4 shrink-0 text-(--color-primary)" />
            <p>
              Your payment is secure. You&apos;ll only be charged after
              confirming your order.
            </p>
          </div>

          {summary ? (
            <div className="rounded-2xl bg-(--bg-card) px-4 py-3 text-sm text-(--text-secondary) ring-1 ring-(--border-color)">
              {summary}
            </div>
          ) : null}

          <OrderFormSubmitActions />
        </form>
      </div>
    </div>
  );
}
