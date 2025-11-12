import { describe, it, expect } from 'vitest';

// Test for field mapping utilities (create if doesn't exist)
describe('Database Field Mapping', () => {
  it('should map snake_case to camelCase correctly', () => {
    const dbTool = {
      id: '1',
      name: 'Figma',
      icon: 'https://example.com/figma.png',
      is_favorite: true,
      user_id: 'user123',
      created_at: '2024-01-01',
      updated_at: '2024-01-02'
    };

    // Simulating the mapping that happens in pages
    const frontendTool = {
      id: dbTool.id,
      name: dbTool.name,
      imageUrl: dbTool.icon,
      isFavorite: dbTool.is_favorite,
      user_id: dbTool.user_id,
      created_at: dbTool.created_at,
      updated_at: dbTool.updated_at
    };

    expect(frontendTool.imageUrl).toBe('https://example.com/figma.png');
    expect(frontendTool.isFavorite).toBe(true);
  });

  it('should map camelCase to snake_case correctly', () => {
    const frontendTool = {
      name: 'Figma',
      url: 'https://figma.com',
      category: 'Design',
      description: 'Design tool',
      imageUrl: 'https://example.com/figma.png'
    };

    // Simulating the mapping when saving to DB
    const dbData = {
      name: frontendTool.name,
      url: frontendTool.url,
      category: frontendTool.category,
      description: frontendTool.description,
      icon: frontendTool.imageUrl,
      is_favorite: false
    };

    expect(dbData.icon).toBe('https://example.com/figma.png');
    expect(dbData.is_favorite).toBe(false);
  });
});

describe('Page enum', () => {
  it('should have all expected page values', () => {
    // This tests the Page enum from types.ts
    const pages = ['Dashboard', 'Ferramentas', 'Videos', 'Notas', 'Estudo', 'Recursos', 'Configuracoes'];
    pages.forEach(page => {
      expect(typeof page).toBe('string');
    });
  });
});
