export const POLLS_STORAGE_KEY = "polls_all";

const normalizeOption = (option, index) => {
  if (typeof option === "string") {
    return {
      id: `opt-${index}-${option}`,
      text: option,
      votes: 0,
    };
  }

  return {
    id: option?.id || `opt-${index}-${option?.text || "option"}`,
    text: option?.text || "Untitled option",
    votes: Number(option?.votes) || 0,
  };
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
};

export const normalizePoll = (poll = {}) => {
  const options = Array.isArray(poll.options)
    ? poll.options.map((option, index) => normalizeOption(option, index))
    : [];

  return {
    id: poll.id || `poll-${Date.now()}`,
    question: poll.question || "Untitled poll",
    description: poll.description || "",
    category: poll.category || "General",
    allowMultiple: Boolean(poll.allowMultiple),
    visibility: poll.visibility || "public",
    createdAt: poll.createdAt || new Date().toISOString(),
    expiresAt: poll.expiresAt || null,
    createdBy: poll.createdBy || "Unknown",
    createdById: poll.createdById || null,
    tags: normalizeTags(poll.tags),
    options,
    votesByUser:
      poll.votesByUser && typeof poll.votesByUser === "object"
        ? poll.votesByUser
        : {},
  };
};

export const isPollOwner = (poll, user) => {
  if (!poll || !user) {
    return false;
  }

  if (poll.createdById && user.id) {
    return poll.createdById === user.id;
  }

  return poll.createdBy === user.username;
};

export const loadPolls = () => {
  const stored = localStorage.getItem(POLLS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizePoll) : [];
  } catch {
    return [];
  }
};

export const savePolls = (polls) => {
  localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls.map(normalizePoll)));
};
