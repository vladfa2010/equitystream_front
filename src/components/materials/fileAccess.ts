import { toast } from 'sonner';
import { API_URL } from '@/api/http';
import type { MaterialItem } from '@/hooks/useMaterials';

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

// ТЗ-4 Задача 3.3: the session cookie authenticates file requests, so the
// browser fetches previews/downloads directly by URL — no fetch→blob→objectURL.
export function materialFileUrl(id: string): string {
  return `${API_URL}/materials/${id}/file`;
}

export function materialDownloadUrl(id: string): string {
  return `${API_URL}/materials/${id}/download`;
}

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Priority: legacy fileData (base64 from demo mode) → external link → backend file.
// Returns null for links without a displayable target.
export function getMaterialObjectUrl(material: MaterialItem | null): string | null {
  if (!material || material.type === 'link') return null;
  if (material.fileData) return material.fileData;
  if (isExternalUrl(material.url)) return material.url;
  return materialFileUrl(material.id);
}

export function reportFileError(err: unknown): void {
  toast.error(err instanceof Error ? err.message : 'File operation failed');
}

// ТЗ-4 Задача 3.3: downloading is a plain navigation to the authorized
// download endpoint — the browser attaches the session cookie itself.
export function downloadMaterial(material: MaterialItem): void {
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
  const a = document.createElement('a');
  a.href = materialDownloadUrl(material.id);
  a.download = material.title;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ТЗ-4 Задача 3.3: kept as a hook for call-site compatibility, but now it is
// a synchronous URL resolver — the browser loads the file by URL with the
// session cookie, no JS-side fetch is needed.
export function useMaterialObjectUrl(material: MaterialItem | null): string | null {
  return getMaterialObjectUrl(material);
}
