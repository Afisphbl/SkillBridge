import Input from "@/components/UI/Input";
import ServiceStatusSelect from "./ServiceStatusSelect";
import TagsInput from "./TagsInput";
import type { ServiceFormData, ServiceFormErrors } from "./types";

const categories = [
  "Design",
  "Development",
  "Writing",
  "Marketing",
  "Video",
  "Other",
];

export default function ServiceForm({
  formData,
  errors,
  onChange,
}: {
  formData: ServiceFormData;
  errors: ServiceFormErrors;
  onChange: (next: Partial<ServiceFormData>) => void;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-(--text-primary)">
          Basic Information
        </h2>
      </div>

      <div className="space-y-3">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-(--text-secondary)">
            Service Title
          </span>
          <Input
            value={formData.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="I will design a modern brand identity"
            error={errors.title}
          />
          {errors.title ? (
            <p className="text-xs text-(--color-danger)">{errors.title}</p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-(--text-secondary)">
            Description
          </span>
          <textarea
            value={formData.description}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={6}
            className="soft-field w-full rounded-md px-3 py-2 text-sm focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Describe what buyers will get, your process, and deliverables."
          />
          {errors.description ? (
            <p className="text-xs text-(--color-danger)">
              {errors.description}
            </p>
          ) : null}
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-(--text-secondary)">
              Category
            </span>
            <select
              value={formData.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="soft-field h-11 w-full rounded-md px-3 text-sm focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="text-xs text-(--color-danger)">{errors.category}</p>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-(--text-secondary)">
              Subcategory
            </span>
            <Input
              value={formData.subcategory}
              onChange={(event) =>
                onChange({ subcategory: event.target.value })
              }
              placeholder="Brand identity"
            />
          </label>
        </div>

        <TagsInput
          tags={formData.tags}
          onChange={(tags) => onChange({ tags })}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-(--text-primary)">Pricing</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-(--text-secondary)">
            Price (USD)
          </span>
          <Input
            type="number"
            min={1}
            step="0.01"
            value={formData.price}
            onChange={(event) => onChange({ price: event.target.value })}
            placeholder="100"
            error={errors.price}
          />
          {errors.price ? (
            <p className="text-xs text-(--color-danger)">{errors.price}</p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-(--text-secondary)">
            Delivery Time (days)
          </span>
          <Input
            type="number"
            min={1}
            step={1}
            value={formData.delivery_time}
            onChange={(event) =>
              onChange({ delivery_time: event.target.value })
            }
            placeholder="3"
            error={errors.delivery_time}
          />
          {errors.delivery_time ? (
            <p className="text-xs text-(--color-danger)">
              {errors.delivery_time}
            </p>
          ) : null}
        </label>
      </div>

      <ServiceStatusSelect
        value={formData.status}
        onChange={(status) => onChange({ status })}
      />
    </section>
  );
}
