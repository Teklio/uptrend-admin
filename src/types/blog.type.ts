export interface Blog {
  id: string;
  title: string;
  description: string;
  readingTime: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
}
