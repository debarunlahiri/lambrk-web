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

  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ status: res.status, detail: res.statusText })) as ApiErrorResponse;
      throw new ApiError(errBody);
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError) {
      throw new ApiError({ status: 0, detail: "Cannot connect to server. Please check your connection or try again later." });
    }
    throw new ApiError({ status: 0, detail: "An unexpected error occurred. Please try again." });
  }
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
  id: string;
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
  postId: string;
  parentId: string | null;
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
  postId: string,
  page = 0,
  size = 20
): Promise<PaginatedComments> {
  return fetchJson<PaginatedComments>(
    `${API_BASE}/api/comments/post/${postId}?page=${page}&size=${size}`
  );
}

export async function createComment(data: {
  content: string;
  postId: string;
  parentCommentId: string | null;
}): Promise<ApiComment> {
  return fetchJson<ApiComment>(`${API_BASE}/api/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getComment(commentId: string): Promise<ApiComment> {
  return fetchJson<ApiComment>(`${API_BASE}/api/comments/${commentId}`);
}

export async function deleteComment(commentId: string): Promise<void> {
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

// ─── Files ───

export interface ApiFile {
  fileId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  type: string;
  fileSize: number;
  mimeType: string;
  description: string;
  isPublic: boolean;
  isNSFW: boolean;
  altText: string;
  uploadedBy: number;
  uploadedAt: string;
  checksum: string;
}

export interface PaginatedFiles {
  content: ApiFile[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function uploadFile(data: {
  file: File;
  type: string;
  fileName?: string;
  description?: string;
  isPublic?: boolean;
  isNSFW?: boolean;
  altText?: string;
}): Promise<ApiFile> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("type", data.type);
  if (data.fileName) formData.append("fileName", data.fileName);
  if (data.description) formData.append("description", data.description);
  if (data.isPublic !== undefined) formData.append("isPublic", String(data.isPublic));
  if (data.isNSFW !== undefined) formData.append("isNSFW", String(data.isNSFW));
  if (data.altText) formData.append("altText", data.altText);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/files/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ status: res.status, detail: res.statusText })) as ApiErrorResponse;
      throw new ApiError(errBody);
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError) {
      throw new ApiError({ status: 0, detail: "Cannot connect to server. Please check your connection or try again later." });
    }
    throw new ApiError({ status: 0, detail: "An unexpected error occurred. Please try again." });
  }
}

export async function getFile(fileId: number): Promise<ApiFile> {
  return fetchJson<ApiFile>(`${API_BASE}/api/files/${fileId}`);
}

export async function getFileContent(fileId: number): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api/files/${fileId}/content`, { headers });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ status: res.status, detail: res.statusText })) as ApiErrorResponse;
    throw new ApiError(errBody);
  }
  return res.blob();
}

export async function listUserFiles(page = 0, size = 20): Promise<PaginatedFiles> {
  return fetchJson<PaginatedFiles>(`${API_BASE}/api/files?page=${page}&size=${size}`);
}

export async function listFilesByType(type: string, page = 0, size = 20): Promise<PaginatedFiles> {
  return fetchJson<PaginatedFiles>(`${API_BASE}/api/files/type/${type}?page=${page}&size=${size}`);
}

export async function listPublicFiles(page = 0, size = 20): Promise<PaginatedFiles> {
  return fetchJson<PaginatedFiles>(`${API_BASE}/api/files/public?page=${page}&size=${size}`);
}

export async function deleteFile(fileId: number): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/files/${fileId}`, {
    method: "DELETE",
  });
}

export interface FileUpdateRequest {
  type?: string;
  fileName?: string;
  description?: string;
  isPublic?: boolean;
  isNSFW?: boolean;
  altText?: string;
}

export async function updateFile(fileId: number, data: FileUpdateRequest): Promise<ApiFile> {
  return fetchJson<ApiFile>(`${API_BASE}/api/files/${fileId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  imageCount: number;
  videoCount: number;
  avatarCount: number;
}

export async function getFileStats(): Promise<FileStats> {
  return fetchJson<FileStats>(`${API_BASE}/api/files/stats`);
}

export async function searchFiles(query: string, limit = 20): Promise<ApiFile[]> {
  return fetchJson<ApiFile[]>(
    `${API_BASE}/api/files/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
}

export async function getRecentFiles(limit = 10): Promise<ApiFile[]> {
  return fetchJson<ApiFile[]>(`${API_BASE}/api/files/recent?limit=${limit}`);
}

// ─── Feed ───

export interface FeedPostFile {
  fileId: number;
  fileUrl: string;
  thumbnailUrl: string | null;
  type: string;
  mimeType: string;
  originalFileName: string;
}

export interface FeedPost {
  id: string;
  title: string | null;
  content: string;
  url: string | null;
  postType: string;
  thumbnailUrl: string | null;
  flairText: string | null;
  flairCssClass: string | null;
  isSpoiler: boolean;
  isStickied: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isOver18: boolean;
  score: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  repostCount?: number;
  awardCount: number;
  author: {
    id: string;
    username: string;
    displayName: string;
    bio?: string | null;
    avatarUrl: string | null;
    isActive?: boolean;
    isVerified: boolean;
    karma: number;
    createdAt: string;
    updatedAt?: string;
  };
  community: {
    id: string;
    name: string;
    title: string;
    description?: string;
    sidebarText?: string | null;
    headerImageUrl?: string | null;
    iconImageUrl: string | null;
    isPublic?: boolean;
    isRestricted?: boolean;
    isOver18?: boolean;
    memberCount?: number;
    subscriberCount?: number;
    activeUserCount?: number;
  } | null;
  files?: FeedPostFile[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  editedAt?: string | null;
  userVote: string | null;
  userSaved?: boolean;
}

export interface FeedUserSuggestion {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  reason: string;
}

export interface FeedAlgorithmInfo {
  sortMethod: string;
  timeDecayFactor: number;
  freshnessHours: number;
  factorsConsidered: string[];
  processingTimeMs: number;
}

export interface FeedResponse {
  posts: FeedPost[];
  suggestedUsers: FeedUserSuggestion[];
  algorithmInfo: FeedAlgorithmInfo;
  totalAvailable: number;
  hasMore: boolean;
}

export async function getFeed(params?: {
  limit?: number;
  sortBy?: string;
  includeNsfw?: boolean;
  fromFollowingOnly?: boolean;
  timeDecayFactor?: number;
}): Promise<FeedResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.includeNsfw !== undefined) qs.set("includeNsfw", String(params.includeNsfw));
  if (params?.fromFollowingOnly !== undefined) qs.set("fromFollowingOnly", String(params.fromFollowingOnly));
  if (params?.timeDecayFactor) qs.set("timeDecayFactor", String(params.timeDecayFactor));
  return fetchJson<FeedResponse>(`${API_BASE}/api/feed?${qs.toString()}`);
}

export async function getFeedHot(limit = 20): Promise<FeedResponse> {
  return fetchJson<FeedResponse>(`${API_BASE}/api/feed/hot?limit=${limit}`);
}

export async function getFeedNew(limit = 20): Promise<FeedResponse> {
  return fetchJson<FeedResponse>(`${API_BASE}/api/feed/new?limit=${limit}`);
}

export async function getFeedTop(limit = 20, timePeriod = "all"): Promise<FeedResponse> {
  return fetchJson<FeedResponse>(`${API_BASE}/api/feed/top?limit=${limit}&timePeriod=${timePeriod}`);
}

export async function getFeedDiscover(limit = 20): Promise<FeedResponse> {
  return fetchJson<FeedResponse>(`${API_BASE}/api/feed/discover?limit=${limit}`);
}

// ─── Posts ───

export interface PaginatedPosts {
  content: FeedPost[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreatePostRequest {
  title?: string | null;
  content: string;
  url?: string | null;
  postType?: string;
  flairText?: string | null;
  flairCssClass?: string | null;
  isSpoiler?: boolean;
  isOver18?: boolean;
  communityId?: number | null;
}

export async function createPost(data: CreatePostRequest): Promise<FeedPost> {
  return fetchJson<FeedPost>(`${API_BASE}/api/posts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPost(postId: string): Promise<FeedPost> {
  return fetchJson<FeedPost>(`${API_BASE}/api/posts/${postId}`);
}

export async function updatePost(postId: string, data: CreatePostRequest): Promise<FeedPost> {
  return fetchJson<FeedPost>(`${API_BASE}/api/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/posts/${postId}`, {
    method: "DELETE",
  });
}

export async function listPostsHot(page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/hot?page=${page}&size=${size}`);
}

export async function listPostsNew(page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/new?page=${page}&size=${size}`);
}

export async function listPostsTop(page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/top?page=${page}&size=${size}`);
}

export async function listCommunityPosts(communityId: string, page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/community/${communityId}?page=${page}&size=${size}`);
}

export async function listUserPosts(userId: string, page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/user/${userId}?page=${page}&size=${size}`);
}

export async function searchPosts(query: string, page = 0, size = 20): Promise<PaginatedPosts> {
  return fetchJson<PaginatedPosts>(`${API_BASE}/api/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
}

export async function listStickiedPosts(communityId?: number): Promise<FeedPost[]> {
  const qs = communityId ? `?communityId=${communityId}` : "";
  return fetchJson<FeedPost[]>(`${API_BASE}/api/posts/stickied${qs}`);
}

// ─── Recommendations ───

export interface RecommendationUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  karma: number;
  createdAt: string;
}

export interface RecommendationResponse {
  type: string;
  posts: FeedPost[];
  communities: Community[];
  users: RecommendationUser[];
  comments: ApiComment[];
  explanation: string;
  confidence: number;
  factors: string[];
}

export async function getRecommendations(params?: {
  userId?: string;
  type?: string;
  limit?: number;
  excludeCommunities?: string[];
  excludeUsers?: number[];
  includeNSFW?: boolean;
  includeOver18?: boolean;
  contextCommunityId?: number | null;
  contextPostId?: number | null;
}): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(`${API_BASE}/api/recommendations`, {
    method: "POST",
    body: JSON.stringify({
      userId: params?.userId,
      type: params?.type || "POSTS",
      limit: params?.limit || 20,
      excludeCommunities: params?.excludeCommunities || [],
      excludeUsers: params?.excludeUsers || [],
      includeNSFW: params?.includeNSFW ?? false,
      includeOver18: params?.includeOver18 ?? false,
      contextCommunityId: params?.contextCommunityId ?? null,
      contextPostId: params?.contextPostId ?? null,
    }),
  });
}

export async function getRecommendedPosts(userId: string, limit = 20): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(
    `${API_BASE}/api/recommendations/posts/${userId}?limit=${limit}`
  );
}

export async function getRecommendedCommunities(userId: string, limit = 20): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(
    `${API_BASE}/api/recommendations/communities/${userId}?limit=${limit}`
  );
}

export async function getRecommendedUsers(userId: string, limit = 20): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(
    `${API_BASE}/api/recommendations/users/${userId}?limit=${limit}`
  );
}

export async function getContextualRecommendations(
  userId: string,
  params?: {
    type?: string;
    limit?: number;
    contextCommunityId?: number;
    contextPostId?: string;
  }
): Promise<RecommendationResponse> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.contextCommunityId) qs.set("contextCommunityId", String(params.contextCommunityId));
  if (params?.contextPostId) qs.set("contextPostId", String(params.contextPostId));
  return fetchJson<RecommendationResponse>(
    `${API_BASE}/api/recommendations/context/${userId}?${qs.toString()}`
  );
}

export async function getTrendingRecommendations(
  type = "posts",
  limit = 20
): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(
    `${API_BASE}/api/recommendations/trending?type=${type}&limit=${limit}`
  );
}

// ─── Search ───

export interface SearchMetadata {
  query: string;
  type: string;
  sort: string;
  timeFilter: string;
  totalResults: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  searchTimeMs: number;
  suggestions: string[];
}

export interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  karma: number;
  bio: string | null;
  createdAt: string;
}

export interface SearchResponse {
  posts: FeedPost[];
  comments: ApiComment[];
  users: SearchUser[];
  communities: Community[];
  metadata: SearchMetadata;
}

export async function advancedSearch(params: {
  query: string;
  type?: string;
  sort?: string;
  timeFilter?: string;
  communities?: string[];
  flairs?: string[];
  includeNSFW?: boolean;
  includeOver18?: boolean;
  minScore?: number | null;
  minComments?: number | null;
  minVotes?: number | null;
  page?: number;
  size?: number;
}): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(`${API_BASE}/api/search`, {
    method: "POST",
    body: JSON.stringify({
      query: params.query,
      type: params.type || "ALL",
      sort: params.sort || "RELEVANCE",
      timeFilter: params.timeFilter || "ALL",
      communities: params.communities || [],
      flairs: params.flairs || [],
      includeNSFW: params.includeNSFW ?? false,
      includeOver18: params.includeOver18 ?? false,
      minScore: params.minScore ?? null,
      minComments: params.minComments ?? null,
      minVotes: params.minVotes ?? null,
      page: params.page ?? 0,
      size: params.size ?? 20,
    }),
  });
}

export async function globalSearchPosts(query: string, page = 0, size = 20, sort = "RELEVANCE"): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/posts?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
  );
}

export async function searchComments(query: string, page = 0, size = 20, sort = "RELEVANCE"): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/comments?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
  );
}

export async function searchUsers(query: string, page = 0, size = 20, sort = "RELEVANCE"): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/users?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
  );
}

export async function searchAll(query: string, page = 0, size = 20, sort = "RELEVANCE"): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/all?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
  );
}

export async function searchCommunitiesApi(query: string, page = 0, size = 20, sort = "RELEVANCE"): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/communities?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`
  );
}

export async function getSearchSuggestions(query: string, type = "posts"): Promise<string[]> {
  return fetchJson<string[]>(
    `${API_BASE}/api/search/suggestions?query=${encodeURIComponent(query)}&type=${type}`
  );
}

export async function getTrendingSearches(page = 0, size = 20): Promise<SearchResponse> {
  return fetchJson<SearchResponse>(
    `${API_BASE}/api/search/trending?page=${page}&size=${size}`
  );
}

// ─── Users ───

export interface UserProfile {
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
}

export interface PaginatedUsers {
  content: UserProfile[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function getUser(userId: string): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE}/api/users/${userId}`);
}

export async function getUserByUsername(username: string): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE}/api/users/username/${username}`);
}

export async function getCurrentUser(): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE}/api/users/me`);
}

export async function listTopUsers(page = 0, size = 20): Promise<PaginatedUsers> {
  return fetchJson<PaginatedUsers>(`${API_BASE}/api/users/top?page=${page}&size=${size}`);
}

export async function searchActiveUsers(query: string, page = 0, size = 20): Promise<PaginatedUsers> {
  return fetchJson<PaginatedUsers>(
    `${API_BASE}/api/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
  );
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/users/${userId}`, {
    method: "DELETE",
  });
}

// ─── Votes ───

export interface VoteRequest {
  voteType: "LIKE" | "DISLIKE";
  postId?: number | null;
  commentId?: number | null;
}

export async function votePost(postId: string, voteType: "LIKE" | "DISLIKE"): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/votes/post`, {
    method: "POST",
    body: JSON.stringify({ voteType, postId, commentId: null }),
  });
}

export async function voteComment(commentId: string, voteType: "LIKE" | "DISLIKE"): Promise<void> {
  await fetchJson<void>(`${API_BASE}/api/votes/comment`, {
    method: "POST",
    body: JSON.stringify({ voteType, postId: null, commentId }),
  });
}
