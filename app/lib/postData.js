import Posts from "@/app/models/Posts.model";
import { getProfileMapByUserIds } from "@/app/lib/profileData";

export const POST_SUMMARY_PROJECTION = {
  userid: 1,
  username: 1,
  profileImageUrl: 1,
  title: 1,
  excerpt: 1,
  contentText: 1,
  coverImageUrl: 1,
  previewType: 1,
  hasImages: 1,
  hasLists: 1,
  hasHeadings: 1,
  likes: 1,
  commentscount: 1,
  saves: 1,
  viewsCount: 1,
  isEdited: 1,
  editedAt: 1,
  DateofCreation: 1,
  createdAt: 1,
  isDeleted: 1,
};

export function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractFirstImageSrc(html = "") {
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || null;
}

export function buildPreviewText(html = "") {
  if (!html) {
    return "";
  }

  let preview = html;

  preview = preview.replace(/<br\s*\/?>/gi, "\n");
  preview = preview.replace(/<\/p>/gi, "\n\n");
  preview = preview.replace(/<\/div>/gi, "\n");
  preview = preview.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis, (_, text) => `\n${stripHtml(text).toUpperCase()}\n`);
  preview = preview.replace(/<li[^>]*>(.*?)<\/li>/gis, (_, text) => `\n• ${stripHtml(text)}`);
  preview = preview.replace(/<\/ul>|<\/ol>/gi, "\n");

  return stripHtml(preview.replace(/\n{3,}/g, "\n\n"));
}

export function buildPostDerivedFields(content = "") {
  const contentText = buildPreviewText(content);
  const coverImageUrl = extractFirstImageSrc(content);
  const hasImages = /<img[\s>]/i.test(content);
  const hasLists = /<(ul|ol|li)[\s>]/i.test(content);
  const hasHeadings = /<h[1-6][\s>]/i.test(content);
  const excerpt = contentText.slice(0, 220);

  return {
    contentText,
    excerpt,
    coverImageUrl,
    hasImages,
    hasLists,
    hasHeadings,
    previewType: hasImages && !excerpt ? "image" : hasImages ? "mixed" : "text",
  };
}

export function toPostSummary(post, author = null) {
  if (!post) {
    return null;
  }

  return {
    _id: post._id,
    userid: post.userid,
    username: post.username || author?.username || null,
    profileImageUrl: post.profileImageUrl || author?.profileImageUrl || null,
    title: post.title,
    excerpt: post.excerpt || post.contentText || buildPreviewText(post.content || "").slice(0, 220),
    contentText: post.contentText || buildPreviewText(post.content || ""),
    coverImageUrl: post.coverImageUrl || extractFirstImageSrc(post.content || ""),
    previewType: post.previewType || "text",
    hasImages: !!(post.hasImages || extractFirstImageSrc(post.content || "")),
    hasLists: !!post.hasLists,
    hasHeadings: !!post.hasHeadings,
    likes: post.likes || 0,
    commentscount: post.commentscount || 0,
    saves: post.saves || 0,
    viewsCount: post.viewsCount || 0,
    isEdited: !!post.isEdited,
    editedAt: post.editedAt || null,
    DateofCreation: post.DateofCreation || post.createdAt,
    createdAt: post.createdAt || post.DateofCreation,
    author: author || null,
  };
}

export async function hydratePostSummaries(posts) {
  const profileMap = await getProfileMapByUserIds((posts || []).map((post) => post.userid));
  return posts.map((post) => toPostSummary(post, profileMap.get(post.userid) || null));
}

export async function getPostsByAuthorId(authorId, { page = 1, limit = 12 } = {}) {
  const skip = (page - 1) * limit;
  const posts = await Posts.find(
    { userid: authorId, isDeleted: { $ne: true } },
    POST_SUMMARY_PROJECTION
  )
    .sort({ DateofCreation: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return hydratePostSummaries(posts);
}
