export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
  course: { id: string; name: string };
}

export interface ReviewListFilters {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  courseId?: string;
  userId?: string;
  isHidden?: boolean;
}
