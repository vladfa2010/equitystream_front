import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { MaterialItem } from '@/hooks/useMaterials';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'png',
  'jpg',
  'jpeg',
  'mp4',
  'mov',
];

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isAcceptedFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXTENSIONS.includes(ext);
}

async function fetchAuthedBlob(path: string): Promise<Blob> {
  const token = localStorage.getItem('es_auth_token');
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || err.error || message;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }
  return res.blob();
}

// Fetches an uploaded file from the backend as a blob (Authorization required).
// Never call this with external URLs — only with a backend material id.
export function fetchFileBlob(id: string): Promise<Blob> {
  return fetchAuthedBlob(`/materials/${id}/download`);
}

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// Priority: legacy fileData (base64 from demo mode) → external link → backend file.
export async function downloadMaterial(material: MaterialItem): Promise<void> {
  if (material.fileData) {
    const a = document.createElement('a');
    a.href = material.fileData;
    a.download = material.title;
    a.click();
    return;
  }
  if (isExternalUrl(material.url)) {
    openExternal(material.url);
    return;
  }
  const blob = await fetchFileBlob(material.id);
  downloadBlob(blob, material.title);
}

export function reportFileError(err: unknown): void {
  toast.error(err instanceof Error ? err.message : 'File operation failed');
}

// Resolves a displayable object URL for a material's content:
// legacy fileData → fetched blob object URL → external url.
// Returns null while an internal file is still loading.
export function useMaterialObjectUrl(material: MaterialItem | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    setObjectUrl(null);

    if (!material || material.type === 'link' || material.fileData) return;
    if (isExternalUrl(material.url)) return;

    fetchFileBlob(material.id)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch((err) => {
        if (!cancelled) reportFileError(err);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [material]);

  if (!material || material.type === 'link') return null;
  if (material.fileData) return material.fileData;
  if (isExternalUrl(material.url)) return material.url;
  return objectUrl;
}
