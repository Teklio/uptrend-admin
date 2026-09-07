export interface Course {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  mentorName: string | null;
  features: string[];
  highlights: string[];
  price: string;
  actualPrice: string;
  extraFee: string;
  isPublished: boolean;
  primaryImageUrl: string | null;
  mentorImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { modules: number };
}

export interface CourseVideo {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  bunnyVideoId: string;
  bunnyLibraryId: string | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  videos: CourseVideo[];
  _count?: { videos: number };
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
}

export interface CourseListFilters {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  dateFrom?: string;
  dateTo?: string;
}
