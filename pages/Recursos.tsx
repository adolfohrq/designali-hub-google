import React, { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '../components/ContentPageLayout';
import { Resource } from '../types';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { EditIcon, TrashIcon, ExternalLinkIcon, StarIcon, ResourcesIcon } from '../components/Icons';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface RecursosProps {
    // Props removed as component fetches its own data
}

const ResourceCard: React.FC<{ resource: Resource, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ resource, onEdit, onDelete, onToggleFavorite }) => {
    return (
        <Card>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">{resource.type}</span>
                        <h3 className="font-bold text-brand-dark mt-2">{resource.title}</h3>
                    </div>
                     <div className="flex items-center gap-2">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                           <ExternalLinkIcon className="w-5 h-5"/>
                        </a>
                        <StarIcon onClick={onToggleFavorite} className={`w-5 h-5 cursor-pointer ${resource.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    </div>
                </div>
                 <p className="text-sm text-brand-gray mt-3 h-10 overflow-hidden">{resource.description}</p>
            </div>
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end gap-2">
                 <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-4 h-4" /></button>
                 <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </Card>
    )
}

const ResourceListItem: React.FC<{ resource: Resource, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ resource, onEdit, onDelete, onToggleFavorite }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-dark truncate">{resource.title}</h3>
                <p className="text-sm text-brand-gray truncate">{resource.description}</p>
            </div>
            <div className="flex items-center gap-6 ml-4">
                <span className="text-sm text-brand-gray bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">{resource.type}</span>
                <div className="flex items-center gap-3">
                    <StarIcon onClick={onToggleFavorite} className={`w-6 h-6 cursor-pointer ${resource.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    )
}

const Recursos: React.FC<RecursosProps> = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');

  // Load resources from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching resources:', error)
        toast.error('Erro ao carregar recursos')
      } else {
        setResources(data as Resource[])
      }
    }

    fetchResources()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('resources-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
        fetchResources()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || resource.type === typeFilter;
        const matchesFavorite = favoriteFilter === 'all' || (favoriteFilter === 'favorites' && resource.isFavorite);
        return matchesSearch && matchesType && matchesFavorite;
    });
  }, [resources, searchTerm, typeFilter, favoriteFilter]);

  const handleOpenModal = (resource: Resource | null = null) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };
  
  const handleSaveResource = async (resourceData: Omit<Resource, 'id' | 'isFavorite'>) => {
    try {
      if (editingResource) {
        const { error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', editingResource.id)

        if (error) throw error
        toast.success('Recurso atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([{ ...resourceData, isFavorite: false, user_id: user?.id }])

        if (error) throw error
        toast.success('Recurso adicionado com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving resource:', error)
      toast.error('Erro ao salvar recurso')
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if(window.confirm('Tem certeza que deseja excluir este recurso?')) {
      try {
        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', resourceId)

        if (error) throw error
        toast.success('Recurso excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting resource:', error)
        toast.error('Erro ao excluir recurso')
      }
    }
  }

  const handleToggleFavorite = async (resource: Resource) => {
      try {
        const { error } = await supabase
          .from('resources')
          .update({ isFavorite: !resource.isFavorite })
          .eq('id', resource.id)

        if (error) throw error
        toast.success('Favorito atualizado!')
      } catch (error) {
        console.error('Error toggling favorite:', error)
        toast.error('Erro ao atualizar favorito')
      }
  }

  return (
    <>
        <ContentPageLayout
        title="Recursos"
        subtitle="Organize seus recursos de aprendizado"
        buttonText="Novo Recurso"
        onButtonClick={() => handleOpenModal()}
        emptyStateText="Nenhum recurso encontrado. Adicione seu primeiro recurso!"
        EmptyStateIcon={ResourcesIcon}
        itemCount={filteredResources.length}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterGroups={[
            { label: 'Tipos', value: typeFilter, options: [{value: 'Article', label: 'Artigo'}, {value: 'Book', label: 'Livro'}, {value: 'Podcast', label: 'Podcast'}], onChange: setTypeFilter },
            { label: 'Mostrar', value: favoriteFilter, options: [{value: 'favorites', label: 'Favoritos'}], onChange: setFavoriteFilter }
        ]}
        >
        {(viewMode) => viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.map(resource => (
                    <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onEdit={() => handleOpenModal(resource)}
                        onDelete={() => handleDeleteResource(resource.id)}
                        onToggleFavorite={() => handleToggleFavorite(resource)}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {filteredResources.map(resource => (
                    <ResourceListItem
                        key={resource.id}
                        resource={resource}
                        onEdit={() => handleOpenModal(resource)}
                        onDelete={() => handleDeleteResource(resource.id)}
                        onToggleFavorite={() => handleToggleFavorite(resource)}
                    />
                ))}
            </div>
        )}
        </ContentPageLayout>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingResource ? 'Editar Recurso' : 'Novo Recurso'}>
            <ResourceForm initialData={editingResource} onSave={handleSaveResource} onCancel={handleCloseModal} />
        </Modal>
    </>
  );
};


const ResourceForm: React.FC<{ initialData: Resource | null, onSave: (data: Omit<Resource, 'id' | 'isFavorite'>) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState<Resource['type']>(initialData?.type || 'Article');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, url, description, type });
    }
    
    const formInputClasses = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value as Resource['type'])} className={formInputClasses} required>
                    <option value="Article">Artigo</option>
                    <option value="Book">Livro</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Other">Outro</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={formInputClasses} rows={3} required></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-brand-dark font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-dark text-white font-semibold rounded-lg hover:bg-gray-800">Salvar</button>
            </div>
        </form>
    )
}

export default Recursos;
