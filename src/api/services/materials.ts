import type { MaterialResponse, CreateMaterialRequest } from '../types';
import { apiFetch, API_URL } from '../http';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function unwrap<T>(res: any): T {
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

export interface UploadMaterialMeta {
  dealId?: string;
  title?: string;
  description?: string;
}

export const materialsApi = {
  getAll: async (params?: { type?: string; dealId?: string; search?: string }): Promise<MaterialResponse[]> => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.dealId) query.set('dealId', params.dealId);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    const res = await fetchWithAuth(`/materials${qs ? `?${qs}` : ''}`);
    const unwrapped = unwrap<any>(res);
    return Array.isArray(unwrapped) ? unwrapped : unwrapped?.data || [];
  },

  create: async (data: CreateMaterialRequest): Promise<MaterialResponse> => {
    const res = await fetchWithAuth('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<MaterialResponse>(res);
  },

  delete: async (id: string) => {
    await fetchWithAuth(`/materials/${id}`, {
      method: 'DELETE',
    });
    return { success: true };
  },

  attachToDeal: async (materialId: string, dealId: string): Promise<MaterialResponse> => {
    const res = await fetchWithAuth(`/materials/${materialId}/attach`, {
      method: 'POST',
      body: JSON.stringify({ dealId }),
    });
    return unwrap<MaterialResponse>(res);
  },

  // Uploads a file via multipart/form-data with real progress reporting.
  // Content-Type is intentionally NOT set manually — the browser adds the
  // multipart boundary itself.
  upload: (
    file: File,
    meta: UploadMaterialMeta = {},
    onProgress?: (pct: number) => void,
  ): Promise<MaterialResponse> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      if (meta.dealId) formData.append('dealId', meta.dealId);
      if (meta.title) formData.append('title', meta.title);
      if (meta.description) formData.append('description', meta.description);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/materials/upload`);
      // ТЗ-4: the session cookie authenticates the upload
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        let body: any = null;
        try {
          body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          // non-JSON error body
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(unwrap<MaterialResponse>(body));
          return;
        }
        if (xhr.status === 413) {
          const msg = body?.message || '';
          // ТЗ-3: distinguish "one file too big" from quota / per-deal limit
          if (/quota|maximum of \d+ files/i.test(msg)) {
            reject(new Error(msg));
          } else {
            reject(new Error('File exceeds the 50 MB limit'));
          }
          return;
        }
        // ТЗ-3: upload rate limit (20/hour per user)
        if (xhr.status === 429) {
          reject(new Error(body?.message || 'Too many uploads. Please try again later.'));
          return;
        }
        // ТЗ-3: storage partition nearly full
        if (xhr.status === 507) {
          reject(new Error(body?.message || 'Storage is full. Please contact the administrator.'));
          return;
        }
        reject(new Error(body?.message || body?.error || `Upload failed (HTTP ${xhr.status})`));
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.onabort = () => reject(new Error('Upload cancelled'));

      xhr.send(formData);
    });
  },
};
