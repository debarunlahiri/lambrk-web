const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9500";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lambrk_access_token");
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    isVerified: boolean;
    karma: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  title: string;
  fieldErrors: Record<string, string> | null;

  constructor(response: ApiErrorResponse) {
    const detail = response.detail || response.message || `HTTP ${response.status}`;
    super(detail);
    this.name = "ApiError";
    this.status = response.status;
    this.title = response.title || "Error";
    this.fieldErrors = response.fieldErrors || null;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ status: res.status, detail: res.statusText })) as ApiErrorResponse;
    throw new ApiError(errBody);
  }

  return res.json();
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${API_BASE}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${API_BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: token,
  });
}

// ─── Categories ───

export interface Category {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  color: string | null;
  slug: string;
  sortOrder: number;
  communityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategories {
  content: Category[];
  totalElements: number;
  totalPages: number;
}

export async function listCategories(page = 0, size = 20): Promise<PaginatedCategories> {
  return fetchJson<PaginatedCategories>(
    `${API_BASE}/api/categories?page=${page}&size=${size}`
  );
}

export async function getCategoryById(id: string): Promise<Category> {
  return fetchJson<Category>(`${API_BASE}/api/categories/${id}`);
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchJson<Category>(`${API_BASE}/api/categories/slug/${slug}`);
}

// ─── Comments ───

export interface ApiComment {
  id: number;
  content: string;
  flairText: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  isRemoved: boolean;
  isCollapsed: boolean;
  isStickied: boolean;
  score: number;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  awardCount: number;
  depthLevel: number;
  author: {
    id: number;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    isVerified: boolean;
    karma: number;
    createdAt: string;
    updatedAt: string;
  };
  postId: number;
  parentId: number | null;
  replies: ApiComment[];
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  userVote: string | null;
}

export interface PaginatedComments {
  content: ApiComment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function listCommentsForPost(
  postId: number,
  page = 0,
  size = 20
): Promise<PaginatedComments> {
  return fetchJson<PaginatedComments>(
    `${API_BASE}/api/comments/post/${postId}?page=${page}&size=${size}`
  );
}

export async function createComment(data: {
  content: string;
  postId: number;
  parentCommentId: number | null;
}): Promise<ApiComment> {
  return fetchJson<ApiComment>(`${API_BASE}/api/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getComment(commentId: number): Promise<ApiComment> {
  return fetchJson<ApiComment>(`${API_BASE}/api/comments/${commentId}`);
}

export async function deleteComment(commentId: number): Promise<void> {
  await fetch(`${API_BASE}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken() || ""}` },
  });
}

// ─── Communities ───

export interface Community {
  id: string;
  name: string;
  title: string;
  description: string;
  sidebarText: string;
  headerImageUrl: string | null;
  iconImageUrl: string | null;
  isPublic: boolean;
  isRestricted: boolean;
  isOver18: boolean;
  memberCount: number;
  subscriberCount: number;
  activeUserCount: number;
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    isVerified: boolean;
    karma: number;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  isUserSubscribed: boolean;
  isUserModerator: boolean;
  categories: Category[];
}

export interface PaginatedCommunities {
  content: Community[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function listCommunities(page = 0, size = 20): Promise<PaginatedCommunities> {
  return fetchJson<PaginatedCommunities>(
    `${API_BASE}/api/communities?page=${page}&size=${size}`
  );
}

export async function listTrendingCommunities(page = 0, size = 20): Promise<PaginatedCommunities> {
  return fetchJson<PaginatedCommunities>(
    `${API_BASE}/api/communities/trending?page=${page}&size=${size}`
  );
}

export async function searchCommunities(query: string, page = 0, size = 20): Promise<PaginatedCommunities> {
  return fetchJson<PaginatedCommunities>(
    `${API_BASE}/api/communities/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
  );
}

export async function getCommunityById(id: string): Promise<Community> {
  return fetchJson<Community>(`${API_BASE}/api/communities/${id}`);
}

export async function getCommunityByName(name: string): Promise<Community> {
  return fetchJson<Community>(`${API_BASE}/api/communities/r/${name}`);
}

export async function createCommunity(data: {
  name: string;
  title: string;
  description: string;
  sidebarText: string;
  isPublic: boolean;
  isRestricted: boolean;
  isOver18: boolean;
  categoryIds: string[];
}): Promise<Community> {
  return fetchJson<Community>(`${API_BASE}/api/communities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function subscribeToCommunity(communityId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/communities/${communityId}/subscribe`, {
    method: "POST",
  });
}

export async function unsubscribeFromCommunity(communityId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/communities/${communityId}/unsubscribe`, {
    method: "POST",
  });
}

export async function getUserSubscriptions(): Promise<Community[]> {
  return fetchJson<Community[]>(`${API_BASE}/api/communities/user/subscriptions`);
}
