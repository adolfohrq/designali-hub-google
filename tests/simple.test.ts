import { test, expect } from 'vitest';

test('simple math test', () => {
  expect(1 + 1).toBe(2);
});

test('Page enum test', () => {
  const pages = {
    Dashboard: 'Dashboard',
    Ferramentas: 'Ferramentas',
    Videos: 'Videos'
  };
  expect(pages.Dashboard).toBe('Dashboard');
});
