
import { Tool, Video, Note, Course, Tutorial, Resource } from '../types';

export const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Figma',
    url: 'https://figma.com',
    category: 'Design',
    description: 'A collaborative interface design tool.',
    imageUrl: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/figma_logo_icon_170157.png',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'VS Code',
    url: 'https://code.visualstudio.com/',
    category: 'Desenvolvimento',
    description: 'A powerful and extensible code editor.',
    imageUrl: 'https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_vscode_icon_130084.png',
    isFavorite: false,
  },
   {
    id: '3',
    name: 'Notion',
    url: 'https://notion.so',
    category: 'Produtividade',
    description: 'The all-in-one workspace for your notes, tasks, wikis, and databases.',
    imageUrl: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/notion_logo_icon_168011.png',
    isFavorite: true,
  },
];

export const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'Learn React in 30 Minutes',
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    platform: 'YouTube',
    channel: 'Web Dev Simplified',
    isFavorite: true,
  },
  {
    id: 'v2',
    title: 'UI Design Tutorial for Beginners',
    url: 'https://www.youtube.com/watch?v=58_a-H_b4_M',
    platform: 'YouTube',
    channel: 'DesignCode',
    isFavorite: false,
  },
];

export const mockNotes: Note[] = [
  {
    id: 'n1',
    title: 'Meeting Recap - Project X',
    content: '## Agenda\n- Discussed Q3 roadmap.\n- Finalized budget.\n\n## Action Items\n- [ ] Alice to send follow-up email.\n- [ ] Bob to update the project board.',
    tags: ['meeting', 'project-x'],
    lastUpdated: '2024-05-20T14:30:00Z',
    isFavorite: true,
  },
];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Complete Web Developer in 2024',
    platform: 'Udemy',
    progress: 75,
    status: 'In Progress',
  },
  {
    id: 'c2',
    title: 'Advanced TypeScript',
    platform: 'Pluralsight',
    progress: 100,
    status: 'Completed',
  },
];

export const mockTutorials: Tutorial[] = [
    {
        id: 't1',
        title: 'How to use React Context API',
        url: 'https://react.dev/learn/passing-data-deeply-with-context',
        source: 'Official React Docs'
    }
];

export const mockResources: Resource[] = [
  {
    id: 'r1',
    title: 'Refactoring UI',
    url: 'https://www.refactoringui.com/',
    type: 'Book',
    description: 'A book about designing beautiful user interfaces, by the creators of Tailwind CSS.',
    isFavorite: true,
  },
  {
    id: 'r2',
    title: 'Syntax.fm',
    url: 'https://syntax.fm/',
    type: 'Podcast',
    description: 'A tasty treats podcast for web developers.',
    isFavorite: false,
  },
];
