import { SERVICE_ICON_NAMES } from '@/lib/icons';

const CATEGORIES = ['Web', 'Robotics', 'Data', 'Research'];

export const servicesConfig = {
  entity: 'Service',
  noun: 'Service',
  rowTitle: (s) => s.title,
  rowSub: (s) => `Order ${s.sort_order}`,
  rowImage: (s) => s.image_url,
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'icon', label: 'Icon', type: 'select', options: SERVICE_ICON_NAMES, default: 'Globe' },
    { key: 'short_description', label: 'Short description (home page card)', type: 'textarea', rows: 2 },
    { key: 'description', label: 'Full description (Services page)', type: 'textarea', rows: 4 },
    { key: 'image_url', label: 'Image', type: 'image' },
    { key: 'stack', label: 'Tech stack', type: 'tags' },
    { key: 'deliverables', label: 'Deliverables', type: 'tags' },
    { key: 'sort_order', label: 'Sort order', type: 'number', default: 0, help: 'Lower numbers appear first.' },
    { key: 'is_published', label: 'Visible on the website', type: 'boolean', default: true },
  ],
};

export const portfolioConfig = {
  entity: 'PortfolioProject',
  noun: 'Project',
  rowTitle: (p) => p.title,
  rowSub: (p) => `${p.category} · Order ${p.sort_order}`,
  rowImage: (p) => p.image_url,
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'category', label: 'Category', type: 'select', options: CATEGORIES, default: 'Web' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { key: 'image_url', label: 'Cover image', type: 'image' },
    { key: 'tech', label: 'Tech stack', type: 'tags' },
    {
      key: 'case_study', label: 'Case study (optional — empty sections are hidden)', type: 'groups', default: {},
      groups: [
        { key: 'timeline', label: 'Timeline', itemFields: [{ key: 'name', label: 'Phase' }, { key: 'duration', label: 'Duration' }, { key: 'status', label: 'Status', options: ['done', 'active', 'upcoming'] }, { key: 'desc', label: 'Description' }] },
        { key: 'challenges', label: 'Challenges', itemFields: [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description' }] },
        { key: 'solutions', label: 'Solutions', itemFields: [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description' }] },
        { key: 'impact', label: 'Impact metrics', itemFields: [{ key: 'value', label: 'Value (e.g. 99%)' }, { key: 'label', label: 'Label' }, { key: 'desc', label: 'Description' }] },
      ],
    },
    { key: 'sort_order', label: 'Sort order', type: 'number', default: 0, help: 'Lower numbers appear first.' },
    { key: 'is_published', label: 'Visible on the website', type: 'boolean', default: true },
  ],
};

export const roadmapConfig = {
  entity: 'RoadmapMilestone',
  noun: 'Milestone',
  rowTitle: (m) => m.title,
  rowSub: (m) => `${m.quarter} · ${m.status} · ${m.category}`,
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'quarter', label: 'Quarter / date (e.g. Q1 2026)', required: true },
    { key: 'status', label: 'Status', type: 'select', options: ['done', 'active', 'upcoming', 'planned'], default: 'planned', help: 'done = Completed, active = In Progress.' },
    { key: 'category', label: 'Category', type: 'select', options: CATEGORIES, default: 'Web' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { key: 'tags', label: 'Tags', type: 'tags' },
    { key: 'sort_order', label: 'Sort order', type: 'number', default: 0, help: 'Lower numbers appear first.' },
    { key: 'is_published', label: 'Visible on the website', type: 'boolean', default: true },
  ],
};
