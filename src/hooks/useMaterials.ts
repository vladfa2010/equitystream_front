import { useState, useEffect, useCallback } from 'react';
import type { DealMaterial } from '@/data/mockData';
import { deals } from '@/data/mockData';

export type MaterialItem = DealMaterial & {
  description?: string;
  clicks?: number;
  fileData?: string; // base64 or blob url for uploaded files
};

export type FilterTab = 'all' | 'files' | 'links';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'largest';

const STORAGE_KEY = 'equitystream-materials';

function extractAllMaterials(): MaterialItem[] {
  const items: MaterialItem[] = [];
  deals.forEach((deal) => {
    deal.materials.forEach((m) => {
      items.push({
        ...m,
        clicks: m.type === 'link' ? Math.floor(Math.random() * 50) : undefined,
      });
    });
  });
  return items;
}

function loadMaterials(): MaterialItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MaterialItem[];
      // Merge with deal materials to ensure we have all
      const dealMats = extractAllMaterials();
      // Filter out deal materials that are already in stored
      const storedIds = new Set(parsed.map((m) => m.id));
      const newDealMats = dealMats.filter((m) => !storedIds.has(m.id));
      return [...parsed, ...newDealMats];
    }
  } catch {
    // ignore
  }
  return extractAllMaterials();
}

function saveMaterials(items: MaterialItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function useMaterials() {
  const [materials, setMaterials] = useState<MaterialItem[]>(loadMaterials);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dealFilter, setDealFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    saveMaterials(materials);
  }, [materials]);

  const filteredMaterials = materials.filter((m) => {
    // Filter tab
    if (filterTab === 'files' && m.type === 'link') return false;
    if (filterTab === 'links' && m.type !== 'link') return false;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchUrl = m.url.toLowerCase().includes(q);
      if (!matchTitle && !matchUrl) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;

    // Deal filter
    if (dealFilter !== 'all' && m.dealId !== dealFilter) return false;

    return true;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'oldest':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'largest': {
        const aSize = parseFloat(a.size || '0');
        const bSize = parseFloat(b.size || '0');
        return bSize - aSize;
      }
      default:
        return 0;
    }
  });

  const addMaterial = useCallback((item: MaterialItem) => {
    setMaterials((prev) => [item, ...prev]);
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const deleteSelected = useCallback(() => {
    setMaterials((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === sortedMaterials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedMaterials.map((m) => m.id)));
    }
  }, [sortedMaterials, selectedIds.size]);

  const associateWithDeal = useCallback((materialIds: string[], dealId: string) => {
    setMaterials((prev) =>
      prev.map((m) => (materialIds.includes(m.id) ? { ...m, dealId } : m))
    );
  }, []);

  const stats = {
    totalFiles: materials.filter((m) => m.type !== 'link').length,
    totalLinks: materials.filter((m) => m.type === 'link').length,
    storageUsed: materials
      .filter((m) => m.size)
      .reduce((sum, m) => {
        const size = parseFloat(m.size || '0');
        return sum + size;
      }, 0),
    recentlyAdded: materials.filter((m) => {
      const days =
        (new Date('2025-06-01T10:00:00Z').getTime() - new Date(m.uploadedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      return days <= 7;
    }).length,
  };

  return {
    materials: sortedMaterials,
    allMaterials: materials,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    dealFilter,
    setDealFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    selectedIds,
    toggleSelection,
    selectAll,
    addMaterial,
    deleteMaterial,
    deleteSelected,
    associateWithDeal,
    stats,
  };
}
