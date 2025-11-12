import React, { useState } from 'react';
import { SearchIcon, PlusIcon, ChevronDownIcon, GridIcon, ListIcon, ToolsIcon } from './Icons';

interface ContentPageLayoutProps {
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonClick: () => void;
    secondaryButton?: {
        text: string;
        onClick: () => void;
        icon: React.FC<{className?: string}>
    };
    emptyStateText: string;
    children: (viewMode: 'grid' | 'list') => React.ReactNode;
    itemCount: number;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filterGroups: {
        label: string;
        value: string;
        options: { value: string, label: string }[];
        onChange: (value: string) => void;
    }[];
    EmptyStateIcon: React.FC<{className?: string}>;
}

const FilterDropdown: React.FC<{label: string, options: {value: string, label: string}[], value: string, onChange: (value: string) => void}> = ({label, options, value, onChange}) => (
    <div className="relative">
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm text-brand-gray focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="all">{label}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
    </div>
);


const ContentPageLayout: React.FC<ContentPageLayoutProps> = ({
    title,
    subtitle,
    buttonText,
    onButtonClick,
    secondaryButton,
    emptyStateText,
    children,
    itemCount,
    searchTerm,
    onSearchTermChange,
    filterGroups,
    EmptyStateIcon
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark">{title}</h1>
                    <p className="text-brand-gray mt-2">{subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    {secondaryButton && (
                         <button 
                            onClick={secondaryButton.onClick}
                            className="flex items-center bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition duration-300">
                            <secondaryButton.icon className="w-5 h-5 mr-2" />
                            {secondaryButton.text}
                        </button>
                    )}
                    <button 
                        onClick={onButtonClick}
                        className="flex items-center bg-brand-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {buttonText}
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                    <input 
                        type="text" 
                        placeholder={`Buscar ${title.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {filterGroups.map(f => <FilterDropdown key={f.label} label={f.label} options={f.options} value={f.value} onChange={f.onChange} />)}
                <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200 text-brand-dark' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <ListIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200 text-brand-dark' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <GridIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {itemCount > 0 ? (
                    children(viewMode)
                ) : (
                    <div className="w-full text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
                        <EmptyStateIcon className="w-16 h-16 text-gray-300 mb-4"/>
                        <p className="text-brand-gray mb-6">{emptyStateText}</p>
                        <button 
                            onClick={onButtonClick}
                            className="flex items-center bg-brand-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            {buttonText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ContentPageLayout;