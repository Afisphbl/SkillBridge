import type { OrderFormValues } from "@/components/Order/OrderFormFields";

export const EMPTY_FORM_VALUES: OrderFormValues = {
  requirements: "",
  deliveryDate: "",
  additionalNotes: "",
  attachments: [],
};

export type ExistingOrder = {
  id: string;
  buyer_id: string;
  service_id: string;
  requirements?: {
    description?: string;
    additional_notes?: string;
  } | null;
  delivery_date?: string | null;
  status: string;
};

export function normalizeRequirements(requirements: string) {
  const trimmedRequirements = requirements.trim();

  try {
    const parsedRequirements = JSON.parse(trimmedRequirements);
    if (parsedRequirements && typeof parsedRequirements === "object") {
      return parsedRequirements;
    }
  } catch {
    // Fall back to a structured description payload.
  }

  return {
    description: trimmedRequirements,
  };
}

export function normalizeAttachments(files: File[]) {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  }));
}
