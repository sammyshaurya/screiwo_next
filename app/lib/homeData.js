export function scoreTrendingPost(post = {}) {
  const likes = Number(post.likes || 0);
  const comments = Number(post.commentscount || 0);
  const saves = Number(post.saves || 0);
  const views = Number(post.viewsCount || 0);
  const createdAt = new Date(post.DateofCreation || post.createdAt || Date.now()).getTime();
  const ageHours = Math.max((Date.now() - createdAt) / (1000 * 60 * 60), 1);
  const recencyBoost = Math.max(24 - ageHours, 0);

  return (likes * 3) + (comments * 4) + (saves * 5) + (views * 0.1) + recencyBoost;
}

function extractTopicTokens(text = "") {
  const hashTags = [...text.matchAll(/#([a-z0-9_]+)/gi)].map((match) => match[1]);
  const words = text
    .replace(/#([a-z0-9_]+)/gi, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 4);

  return [...hashTags, ...words].slice(0, 24);
}

export function buildTrendingTopics(posts = [], limit = 8) {
  const counts = new Map();

  posts.forEach((post) => {
    const tokens = extractTopicTokens(
      [post.title, post.contentText, post.excerpt].filter(Boolean).join(" ")
    );

    tokens.forEach((token) => {
      const key = token.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, count]) => ({
      topic: topic.startsWith("#") ? topic : `#${topic}`,
      count,
    }));
}
