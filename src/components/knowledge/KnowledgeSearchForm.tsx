import React from 'react';
import {
  Search,
  Filter,
  Layers,
  FileCheck,
  FolderDot,
  Globe,
  User,
  RotateCcw,
} from 'lucide-react';
import {
  KnowledgeCategory,
  KnowledgeSourceType,
  KnowledgeVisibility,
  KnowledgeSearchQuery,
} from '../../backend/knowledge/types';
import { DSButton } from '../design-system/DSButton';

interface KnowledgeSearchFormProps {
  onSearch: (query: KnowledgeSearchQuery) => void;
  projects: string[];
  owners: string[];
  workspaces: string[];
}

export const KnowledgeSearchForm: React.FC<KnowledgeSearchFormProps> = ({
  onSearch,
  projects,
  owners,
  workspaces,
}) => {
  const [keyword, setKeyword] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');
  const [selectedProject, setSelectedProject] = React.useState<string>('ALL');
  const [selectedOwner, setSelectedOwner] = React.useState<string>('ALL');
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string>('ALL');
  const [selectedVisibility, setSelectedVisibility] = React.useState<string>('ALL');

  // Available option arrays
  const categories: KnowledgeCategory[] = [
    'Engineering',
    'Packaging',
    'Learning',
    'Business',
    'Projects',
    'Research',
    'Meetings',
    'Processes',
    'Standards',
    'Customers',
    'Suppliers',
    'Personal',
  ];

  const types: { value: KnowledgeSourceType; label: string }[] = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'word', label: 'Word Document' },
    { value: 'excel', label: 'Excel Sheet' },
    { value: 'markdown', label: 'Markdown Logs' },
    { value: 'text', label: 'Plain Text' },
    { value: 'engineering_notes', label: 'Engineering Notes' },
    { value: 'packaging_notes', label: 'Packaging Notes' },
    { value: 'meeting_notes', label: 'Meeting Notes' },
    { value: 'project_documents', label: 'Project Documents' },
    { value: 'images', label: 'Image Metadata' },
    { value: 'cad_metadata', label: 'CAD Schematic Model' },
  ];

  const visibilities: KnowledgeVisibility[] = ['Public', 'Organization', 'Shared', 'Private'];

  // Trigger search on change
  const handleFilterChange = (updates: Partial<{
    keyword: string;
    category: string;
    type: string;
    project: string;
    owner: string;
    workspace: string;
    visibility: string;
  }>) => {
    const nextKeyword = updates.keyword !== undefined ? updates.keyword : keyword;
    const nextCategory = updates.category !== undefined ? updates.category : selectedCategory;
    const nextType = updates.type !== undefined ? updates.type : selectedType;
    const nextProject = updates.project !== undefined ? updates.project : selectedProject;
    const nextOwner = updates.owner !== undefined ? updates.owner : selectedOwner;
    const nextWorkspace = updates.workspace !== undefined ? updates.workspace : selectedWorkspace;
    const nextVisibility = updates.visibility !== undefined ? updates.visibility : selectedVisibility;

    const query: KnowledgeSearchQuery = {};

    if (nextKeyword.trim()) {
      query.keyword = nextKeyword.trim();
    }
    if (nextCategory !== 'ALL') {
      query.categories = [nextCategory as KnowledgeCategory];
    }
    if (nextType !== 'ALL') {
      query.types = [nextType as KnowledgeSourceType];
    }
    if (nextProject !== 'ALL') {
      query.project = nextProject;
    }
    if (nextOwner !== 'ALL') {
      query.owner = nextOwner;
    }
    if (nextWorkspace !== 'ALL') {
      query.workspace = nextWorkspace;
    }
    if (nextVisibility !== 'ALL') {
      query.visibility = nextVisibility as KnowledgeVisibility;
    }

    onSearch(query);
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedProject('ALL');
    setSelectedOwner('ALL');
    setSelectedWorkspace('ALL');
    setSelectedVisibility('ALL');
    onSearch({});
  };

  return (
    <div className="bg-slate-950/45 border border-slate-900 rounded-sm p-4 space-y-4">
      {/* 1. Keyword Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
        <input
          id="kb-search-keyword"
          type="text"
          placeholder="Query indices by keyword, title, tag, description..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            handleFilterChange({ keyword: e.target.value });
          }}
          className="w-full bg-slate-950 border border-slate-900 rounded-sm pl-10 pr-4 py-2 text-slate-200 text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* 2. Structured Metadata Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-[10px]">
        {/* Category select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-600" /> Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              handleFilterChange({ category: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL CATEGORIES</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Source Type select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-slate-600" /> Payload Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              handleFilterChange({ type: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL TYPES</option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Project select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <FolderDot className="w-3.5 h-3.5 text-slate-600" /> Linked Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              handleFilterChange({ project: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL PROJECTS</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Owner select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-600" /> Owner / Author
          </label>
          <select
            value={selectedOwner}
            onChange={(e) => {
              setSelectedOwner(e.target.value);
              handleFilterChange({ owner: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL OWNERS</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Workspace select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-600" /> Workspace
          </label>
          <select
            value={selectedWorkspace}
            onChange={(e) => {
              setSelectedWorkspace(e.target.value);
              handleFilterChange({ workspace: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL WORKSPACES</option>
            {workspaces.map((w) => (
              <option key={w} value={w}>
                {w.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility select */}
        <div className="space-y-1">
          <label className="text-slate-500 font-semibold uppercase flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-600" /> Visibility
          </label>
          <select
            value={selectedVisibility}
            onChange={(e) => {
              setSelectedVisibility(e.target.value);
              handleFilterChange({ visibility: e.target.value });
            }}
            className="w-full bg-slate-950 border border-slate-900 rounded-sm py-1.5 px-2.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">ALL VISIBILITY</option>
            {visibilities.map((v) => (
              <option key={v} value={v}>
                {v.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Helper stats & reset */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
        <span>Enter keyword or select attributes to filter knowledge space indexes.</span>
        <button
          onClick={handleReset}
          className="text-cyan-500 hover:text-cyan-400 font-bold uppercase flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset Filters
        </button>
      </div>
    </div>
  );
};
