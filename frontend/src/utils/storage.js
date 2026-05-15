const DEFAULT_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;

export const getStorageLimitBytes = (user) => {
  const limit = Number(user?.storageLimitBytes);
  if (Number.isFinite(limit) && limit > 0) {
    return limit;
  }
  return DEFAULT_STORAGE_LIMIT_BYTES;
};

export const calculateStorageUsage = (files = [], user) => {
  const totalBytes = files.reduce((acc, file) => acc + Number(file?.size || 0), 0);
  const limitBytes = getStorageLimitBytes(user);
  const percentUsed = limitBytes > 0 ? Math.min((totalBytes / limitBytes) * 100, 100) : 0;
  const remainingBytes = Math.max(limitBytes - totalBytes, 0);

  return {
    totalBytes,
    limitBytes,
    remainingBytes,
    percentUsed,
  };
};