import React, { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '../components/ContentPageLayout';
import { Note } from '../types';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { EditIcon, TrashIcon, StarIcon, NotesIcon } from '../components/Icons';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { marked } from 'marked';
import { useAuth } from '../contexts/AuthContext';


interface NotasProps {
    // Props removed as component fetches its own data
}

const NoteCard: React.FC<{ note: Note, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ note, onEdit, onDelete, onToggleFavorite }) => {
    const formattedDate = new Date(note.lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    const contentPreview = note.content.substring(0, 100).replace(/#|`/g, '') + (note.content.length > 100 ? '...' : '');

    return (
        <Card>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-brand-dark">{note.title}</h3>
                    <StarIcon onClick={onToggleFavorite} className={`w-5 h-5 cursor-pointer flex-shrink-0 ml-2 ${note.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                </div>
                <p className="text-sm text-brand-gray mt-2 h-12">{contentPreview}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                    {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                 <p className="text-xs text-gray-500">Atualizado em: {formattedDate}</p>
                 <div className="flex gap-2">
                    <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-4 h-4" /></button>
                 </div>
            </div>
        </Card>
    );
};

const NoteListItem: React.FC<{ note: Note, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ note, onEdit, onDelete, onToggleFavorite }) => {
    const formattedDate = new Date(note.lastUpdated).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
                 <div>
                    <h3 className="font-semibold text-brand-dark">{note.title}</h3>
                    <div className="flex gap-2 mt-1">
                        {note.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                 </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm text-brand-gray">{formattedDate}</span>
                <div className="flex items-center gap-3">
                    <StarIcon onClick={onToggleFavorite} className={`w-6 h-6 cursor-pointer ${note.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    )
}

const Notas: React.FC<NotasProps> = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');

  // Load notes from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching notes:', error)
        toast.error('Erro ao carregar notas')
      } else {
        setNotes(data as Note[])
      }
    }

    fetchNotes()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        fetchNotes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user]);

  const allTags = useMemo(() => [...new Set(notes.flatMap(n => n.tags))], [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = tagFilter === 'all' || note.tags.includes(tagFilter);
        const matchesFavorite = favoriteFilter === 'all' || (favoriteFilter === 'favorites' && note.isFavorite);
        return matchesSearch && matchesTag && matchesFavorite;
    }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [notes, searchTerm, tagFilter, favoriteFilter]);

  const handleOpenModal = (note: Note | null = null) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };
  
  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'isFavorite' | 'lastUpdated'>) => {
    try {
      const updatedNoteData = {
        ...noteData,
        lastUpdated: new Date().toISOString()
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(updatedNoteData)
          .eq('id', editingNote.id)

        if (error) throw error
        toast.success('Nota atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ ...updatedNoteData, isFavorite: false, user_id: user?.id }])

        if (error) throw error
        toast.success('Nota criada com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Erro ao salvar nota')
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if(window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId)

        if (error) throw error
        toast.success('Nota excluída com sucesso!')
      } catch (error) {
        console.error('Error deleting note:', error)
        toast.error('Erro ao excluir nota')
      }
    }
  }
  
  const handleToggleFavorite = async (note: Note) => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({ isFavorite: !note.isFavorite })
          .eq('id', note.id)

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
        title="Notas"
        subtitle="Gerencie suas anotações com Markdown"
        buttonText="Nova Nota"
        onButtonClick={() => handleOpenModal()}
        emptyStateText="Nenhuma nota encontrada. Crie sua primeira nota!"
        EmptyStateIcon={NotesIcon}
        itemCount={filteredNotes.length}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterGroups={[
            { label: 'Todas as tags', value: tagFilter, options: allTags.map(t => ({value: t, label: t})), onChange: setTagFilter },
            { label: 'Mostrar', value: favoriteFilter, options: [{value: 'favorites', label: 'Favoritos'}], onChange: setFavoriteFilter }
        ]}
        >
        {(viewMode) => viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNotes.map(note => (
                    <NoteCard 
                        key={note.id} 
                        note={note}
                        onEdit={() => handleOpenModal(note)}
                        onDelete={() => handleDeleteNote(note.id)}
                        onToggleFavorite={() => handleToggleFavorite(note)}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {filteredNotes.map(note => (
                    <NoteListItem 
                        key={note.id}
                        note={note}
                        onEdit={() => handleOpenModal(note)}
                        onDelete={() => handleDeleteNote(note.id)}
                        onToggleFavorite={() => handleToggleFavorite(note)}
                    />
                ))}
            </div>
        )}
        </ContentPageLayout>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNote ? 'Editar Nota' : 'Nova Nota'}>
            <NoteForm initialData={editingNote} onSave={handleSaveNote} onCancel={handleCloseModal} />
        </Modal>
    </>
  );
};


const NoteForm: React.FC<{ initialData: Note | null, onSave: (data: Omit<Note, 'id' | 'isFavorite' | 'lastUpdated'>) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
    const [preview, setPreview] = useState(false);
    
    const [parsedContent, setParsedContent] = useState('');

    useEffect(() => {
        if(content) {
            setParsedContent(marked.parse(content));
        }
    }, [content, preview]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        onSave({ title, content, tags: tagsArray });
    }
    
    const formInputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-brand-gray">Conteúdo (Markdown)</label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-0.5">
                        <button type="button" onClick={() => setPreview(false)} className={`px-2 py-0.5 text-sm rounded ${!preview ? 'bg-gray-200' : ''}`}>Editar</button>
                        <button type="button" onClick={() => setPreview(true)} className={`px-2 py-0.5 text-sm rounded ${preview ? 'bg-gray-200' : ''}`}>Preview</button>
                    </div>
                </div>
                {preview ? (
                     <div className={`${formInputClasses} prose min-h-[240px]`} dangerouslySetInnerHTML={{ __html: parsedContent }}></div>
                ) : (
                    <textarea value={content} onChange={e => setContent(e.target.value)} className={`${formInputClasses} font-mono`} rows={10} required></textarea>
                )}
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Tags (separadas por vírgula)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={formInputClasses} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-brand-dark font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-dark text-white font-semibold rounded-lg hover:bg-gray-800">Salvar</button>
            </div>
        </form>
    )
}

export default Notas;
