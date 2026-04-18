import api from './api';

const extractS3ErrorCode = (rawText = '') => {
  const codeMatch = rawText.match(/<Code>([^<]+)<\/Code>/i);
  return codeMatch?.[1] || null;
};

const sanitizeS3ErrorDetails = (rawText = '') => {
  const code = extractS3ErrorCode(rawText);
  if (!code) {
    return 'Storage service rejected the upload request.';
  }

  if (code === 'InvalidAccessKeyId') {
    return 'Storage credentials are invalid in backend configuration.';
  }

  if (code === 'SignatureDoesNotMatch') {
    return 'Signed upload request does not match the request sent by browser.';
  }

  if (code === 'AccessDenied') {
    return 'Access denied by storage policy or IAM permissions.';
  }

  return `Storage service error: ${code}.`;
};

const extractErrorMessageFromBlob = async (blob) => {
  if (!blob || typeof blob.text !== 'function') {
    return null;
  }

  const text = await blob.text();
  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed?.error) {
      return parsed.error;
    }
    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    // Non-JSON response payload.
  }

  return text.slice(0, 300);
};

const sanitizeDownloadFileName = (rawName) => {
  const input = String(rawName || '').trim();
  if (!input) {
    return 'download';
  }

  const noPath = input.replace(/[\\/]/g, '_');
  const noControls = noPath.replace(/[\x00-\x1f\x7f]/g, '');
  const collapsed = noControls.replace(/\s+/g, ' ').trim();

  if (!collapsed || collapsed === '.' || collapsed === '..') {
    return 'download';
  }

  return collapsed.slice(0, 180);
};

const parseFilenameFromContentDisposition = (disposition) => {
  if (!disposition) {
    return null;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (utf8Match?.[1]) {
    try {
      return sanitizeDownloadFileName(decodeURIComponent(utf8Match[1]));
    } catch {
      // Ignore malformed encoding and try plain filename.
    }
  }

  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (match?.[1]) {
    return sanitizeDownloadFileName(match[1].replace(/['"]/g, '').trim());
  }

  return null;
};

const transferService = {
  createSession: async (payload = {}) => {
    try {
      const response = await api.post('/transfer/create', {
        ...payload,
        client_base_url: window.location.origin,
      });
      return response.data;
    } catch (error) {
      if (!error.response) {
        return { success: false, error: 'Cannot reach backend API. Ensure backend is running and VITE_API_BASE_URL is correct.' };
      }
      return error.response.data || { success: false, error: 'Failed to create session' };
    }
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/transfer/${sessionId}`);
    return response.data;
  },

  getUploadUrl: async ({ session_id, filename, file_size, content_type }) => {
    const response = await api.post('/transfer/upload-url', {
      session_id,
      filename,
      file_size,
      content_type,
    });
    return response.data;
  },

  completeUpload: async ({ session_id, file_key }) => {
    const response = await api.post('/transfer/complete-upload', {
      session_id,
      file_key,
      client_base_url: window.location.origin,
    });
    return response.data;
  },

  verifyPin: async ({ session_id, pin }) => {
    const response = await api.post('/transfer/verify-pin', {
      session_id,
      pin,
    });
    return response.data;
  },

  getDownloadUrl: async ({ session_id, verification_token }) => {
    const response = await api.get('/transfer/download', {
      params: { session_id, verification_token },
    });
    return response.data;
  },

  getMySessions: async () => {
    const response = await api.get('/transfer/my-sessions', {
      params: { client_base_url: window.location.origin },
    });
    return response.data;
  },

  downloadFileStream: async ({ session_id, verification_token, fallback_file_name }) => {
    try {
      const response = await api.get('/transfer/download/stream', {
        params: { session_id, verification_token },
        responseType: 'blob',
      });

      const responseContentType = response.headers?.['content-type'] || response.data?.type || '';
      if (String(responseContentType).includes('application/json')) {
        const message = await extractErrorMessageFromBlob(response.data);
        throw new Error(message || 'Download could not be completed');
      }

      const disposition = response.headers['content-disposition'];
      const headerFileName = parseFilenameFromContentDisposition(disposition);
      const fileName = headerFileName || sanitizeDownloadFileName(fallback_file_name);

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: responseContentType || 'application/octet-stream' });

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      return true;
    } catch (error) {
      // Fallback to pre-signed download URL when stream endpoint has transient issues.
      if (error?.response?.data && typeof error.response.data.text === 'function') {
        const message = await extractErrorMessageFromBlob(error.response.data);
        if (message) {
          throw new Error(message);
        }
      }

      if (error?.response?.status === 401 || error?.response?.status === 404 || error?.response?.status === 410) {
        throw error;
      }

      const direct = await transferService.getDownloadUrl({ session_id, verification_token });
      if (!direct?.success || !direct?.data?.download_url) {
        throw error;
      }

      window.location.assign(direct.data.download_url);
      return true;
    }
  },

  uploadToPresignedUrl: async ({ uploadUrl, file, contentType, signedHeaders = {} }) => {
    try {
      const headers = {
        ...signedHeaders,
      };

      const forbiddenHeaderNames = new Set([
        'host',
        'content-length',
        'origin',
        'referer',
      ]);

      Object.keys(headers).forEach((key) => {
        if (forbiddenHeaderNames.has(key.toLowerCase())) {
          delete headers[key];
        }
      });

      const hasContentTypeHeader = Object.keys(headers).some(
        (key) => key.toLowerCase() === 'content-type'
      );
      if (!hasContentTypeHeader) {
        headers['Content-Type'] = contentType || 'application/octet-stream';
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!response.ok) {
        const responseText = await response.text();
        const safeDetails = sanitizeS3ErrorDetails(responseText);
        throw new Error(
          `Direct upload to storage failed (HTTP ${response.status}). ` +
          `${safeDetails} ` +
          `Check backend AWS credentials, CORS (origin ${window.location.origin}, methods PUT/GET/HEAD, headers Content-Type and x-amz-*), bucket region, and presigned URL age.`
        );
      }

      return true;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          `Network/CORS error while uploading to storage. ` +
          `Verify AWS S3 bucket CORS allows origin ${window.location.origin}, methods PUT/GET/HEAD, and headers Content-Type,x-amz-*.`
        );
      }
      throw error;
    }
  },
};

export default transferService;
