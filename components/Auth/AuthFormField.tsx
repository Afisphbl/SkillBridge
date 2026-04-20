import Input from "@/components/UI/Input";

type AuthFormFieldProps = {
  label: string;
  errorMessage?: string;
  inputProps: React.ComponentProps<typeof Input>;
};

export default function AuthFormField({
  label,
  errorMessage,
  inputProps,
}: AuthFormFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-(--text-secondary)">
        {label}
      </label>
      <Input {...inputProps} error={errorMessage} />
      {errorMessage ? (
        <p className="mt-1 text-xs text-(--color-danger)">{errorMessage}</p>
      ) : null}
    </div>
  );
}
