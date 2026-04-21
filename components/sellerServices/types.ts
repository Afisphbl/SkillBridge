export type ServiceStatus = "active" | "paused" | "draft";

export type ServiceVisibility = "public" | "private";

export type ServiceSort =
  | "newest"
  | "oldest"
  | "best-selling"
  | "highest-rated"
  | "most-viewed";

export type ServiceItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  price: number;
  deliveryDays: number;
  rating: number;
  orders: number;
  views: number;
  conversionRate: number;
  image: string;
  status: ServiceStatus;
  visibility: ServiceVisibility;
  createdAt: string;
};

export type ServiceStats = {
  total: number;
  active: number;
  paused: number;
  totalOrders: number;
};

export type ServiceFilters = {
  query: string;
  status: "all" | ServiceStatus;
  category:
    | "all"
    | "design"
    | "development"
    | "writing"
    | "marketing"
    | "video"
    | "other";
  sort: ServiceSort;
};
