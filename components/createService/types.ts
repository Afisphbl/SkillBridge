export type ServiceFormData = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  price: string;
  delivery_time: string;
  status: "draft" | "active" | "paused";
};

export type ServiceFormErrors = Partial<
  Record<
    | "title"
    | "description"
    | "category"
    | "price"
    | "delivery_time"
    | "thumbnail"
    | "general",
    string
  >
>;

export type SubmitMode = "draft" | "publish";
