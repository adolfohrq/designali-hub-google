import { describe, it, expect } from 'vitest';
import { Page } from '../types';
import type { Tool, Video, Note, Resource, Course, Notification } from '../types';

describe('Type Definitions', () => {
  it('should have correct Page enum values', () => {
    expect(Page.Dashboard).toBe('Dashboard');
    expect(Page.Ferramentas).toBe('Ferramentas');
    expect(Page.Videos).toBe('Videos');
    expect(Page.Notas).toBe('Notas');
    expect(Page.Estudo).toBe('Estudo');
    expect(Page.Recursos).toBe('Recursos');
    expect(Page.Configuracoes).toBe('Configuracoes');
  });

  it('should allow valid Tool objects', () => {
    const tool: Tool = {
      id: '1',
      name: 'Figma',
      url: 'https://figma.com',
      category: 'Design',
      description: 'Design tool',
      isFavorite: false,
      imageUrl: 'https://example.com/icon.png',
      user_id: 'user123',
      created_at: '2024-01-01',
      updated_at: '2024-01-02'
    };

    expect(tool.id).toBe('1');
    expect(tool.name).toBe('Figma');
    expect(tool.isFavorite).toBe(false);
  });

  it('should allow valid Video objects', () => {
    const video: Video = {
      id: '1',
      title: 'React Tutorial',
      url: 'https://youtube.com/watch?v=123',
      platform: 'YouTube',
      channel: 'Tech Channel',
      isFavorite: true,
      thumbnail_url: 'https://example.com/thumb.jpg',
      user_id: 'user123'
    };

    expect(video.platform).toBe('YouTube');
    expect(video.isFavorite).toBe(true);
  });

  it('should allow valid Note objects', () => {
    const note: Note = {
      id: '1',
      title: 'Meeting Notes',
      content: '# Important meeting\n\nNotes here...',
      tags: ['work', 'meeting'],
      lastUpdated: '2024-01-01',
      isFavorite: false,
      user_id: 'user123'
    };

    expect(note.tags).toHaveLength(2);
    expect(note.tags).toContain('work');
  });

  it('should allow valid Course objects', () => {
    const course: Course = {
      id: '1',
      title: 'React Advanced',
      platform: 'Udemy',
      progress: 75,
      status: 'In Progress',
      is_favorite: true,
      user_id: 'user123'
    };

    expect(course.progress).toBe(75);
    expect(course.status).toBe('In Progress');
  });

  it('should allow valid Resource objects', () => {
    const resource: Resource = {
      id: '1',
      title: 'Clean Code',
      url: 'https://example.com/book',
      type: 'Book',
      description: 'A book about clean code',
      author: 'Robert Martin',
      isFavorite: false,
      user_id: 'user123'
    };

    expect(resource.type).toBe('Book');
    expect(resource.author).toBe('Robert Martin');
  });

  it('should allow valid Notification objects', () => {
    const notification: Notification = {
      id: '1',
      user_id: 'user123',
      title: 'New message',
      message: 'You have a new message',
      type: 'info',
      is_read: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    expect(notification.type).toBe('info');
    expect(notification.is_read).toBe(false);
  });
});
