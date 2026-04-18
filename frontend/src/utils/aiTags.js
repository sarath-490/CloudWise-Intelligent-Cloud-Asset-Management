export const parseAiTags = (rawTags) => {
  if (!rawTags) return [];

  if (Array.isArray(rawTags)) {
    return rawTags
      .map((t) => String(t).trim())
      .filter(Boolean);
  }

  if (typeof rawTags === 'string') {
    const trimmed = rawTags.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((t) => String(t).trim())
          .filter(Boolean);
      }
    } catch {
      // Ignore and fallback to CSV-like parsing.
    }

    return trimmed
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((t) => t.replace(/^"|"$/g, '').trim())
      .filter(Boolean);
  }

  return [];
};
