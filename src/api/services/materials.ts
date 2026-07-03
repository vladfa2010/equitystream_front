import { getAllMaterials, createMaterialLocal } from '../localDb';
import type { MaterialResponse, CreateMaterialRequest } from '../types';

export const materialsApi = {
  getAll: async (params?: { type?: string; dealId?: string; search?: string }) => {
    let materials = getAllMaterials();
    if (params?.type) materials = materials.filter(m => m.type === params.type);
    if (params?.dealId) materials = materials.filter(m => m.dealId === params.dealId);
    if (params?.search) {
      const q = params.search.toLowerCase();
      materials = materials.filter(m => m.title.toLowerCase().includes(q));
    }
    return materials;
  },

  create: async (data: CreateMaterialRequest): Promise<MaterialResponse> => {
    await new Promise(r => setTimeout(r, 500));
    return createMaterialLocal(data);
  },

  delete: async (id: string) => {
    await new Promise(r => setTimeout(r, 200));
    const materials = getAllMaterials().filter(m => m.id !== id);
    localStorage.setItem('es_materials', JSON.stringify(materials));
    return { success: true };
  },

  attachToDeal: async (materialId: string, dealId: string) => {
    const materials = getAllMaterials();
    const idx = materials.findIndex(m => m.id === materialId);
    if (idx === -1) throw new Error('Material not found');
    materials[idx].dealId = dealId;
    localStorage.setItem('es_materials', JSON.stringify(materials));
    return materials[idx];
  },
};
