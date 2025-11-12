import React, { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '../components/ContentPageLayout';
import { Video } from '../types';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { EditIcon, TrashIcon, VideosIcon, StarIcon } from '../components/Icons';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';


interface VideosProps {
    // Props removed as component fetches its own data
}

const getThumbnailUrl = (video: Video) => {
    if (video.platform === 'YouTube') {
        try {
            const url = new URL(video.url);
            const videoId = url.searchParams.get('v');
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } catch (error) {
            return null;
        }
    }
    return null;
}

const VideoCard: React.FC<{ video: Video, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ video, onEdit, onDelete, onToggleFavorite }) => {
    const thumbnailUrl = getThumbnailUrl(video);
    return (
        <Card>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-gray-200 rounded-t-xl relative group">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-t-xl"/>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <VideosIcon className="w-12 h-12 text-gray-400"/>
                    </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl">
                     <VideosIcon className="w-12 h-12 text-white"/>
                </div>
            </a>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-brand-dark leading-tight">{video.title}</h3>
                        <p className="text-sm text-brand-gray mt-1">{video.channel} • {video.platform}</p>
                    </div>
                    <StarIcon onClick={onToggleFavorite} className={`w-5 h-5 cursor-pointer flex-shrink-0 ml-2 ${video.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end gap-2">
                 <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-4 h-4" /></button>
                 <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </Card>
    )
}

const VideoListItem: React.FC<{ video: Video, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ video, onEdit, onDelete, onToggleFavorite }) => {
    const thumbnailUrl = getThumbnailUrl(video);
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
                {thumbnailUrl ? <img src={thumbnailUrl} alt={video.title} className="w-24 h-14 rounded-lg object-cover bg-gray-100" /> : <div className="w-24 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><VideosIcon className="w-6 h-6 text-gray-400"/></div>}
                <div>
                    <h3 className="font-semibold text-brand-dark">{video.title}</h3>
                    <p className="text-sm text-brand-gray">{video.channel}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm text-brand-gray bg-gray-100 px-3 py-1 rounded-full">{video.platform}</span>
                <div className="flex items-center gap-3">
                    <StarIcon onClick={onToggleFavorite} className={`w-6 h-6 cursor-pointer ${video.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    )
}

const Videos: React.FC<VideosProps> = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');

  // Load videos from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching videos:', error)
        toast.error('Erro ao carregar vídeos')
      } else {
        setVideos(data as Video[])
      }
    }

    fetchVideos()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('videos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        fetchVideos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user]);

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || video.channel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = platformFilter === 'all' || video.platform === platformFilter;
        const matchesFavorite = favoriteFilter === 'all' || (favoriteFilter === 'favorites' && video.isFavorite);
        return matchesSearch && matchesPlatform && matchesFavorite;
    });
  }, [videos, searchTerm, platformFilter, favoriteFilter]);


  const handleOpenModal = (video: Video | null = null) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };
  
  const handleSaveVideo = async (videoData: Omit<Video, 'id' | 'isFavorite'>) => {
    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingVideo.id)

        if (error) throw error
        toast.success('Vídeo atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([{ ...videoData, isFavorite: false, user_id: user?.id }])

        if (error) throw error
        toast.success('Vídeo adicionado com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving video:', error)
      toast.error('Erro ao salvar vídeo')
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if(window.confirm('Tem certeza que deseja excluir este vídeo?')) {
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId)

        if (error) throw error
        toast.success('Vídeo excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting video:', error)
        toast.error('Erro ao excluir vídeo')
      }
    }
  }

  const handleToggleFavorite = async (video: Video) => {
      try {
        const { error } = await supabase
          .from('videos')
          .update({ isFavorite: !video.isFavorite })
          .eq('id', video.id)

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
        title="Vídeos"
        subtitle="Organize seus vídeos favoritos"
        buttonText="Novo Vídeo"
        onButtonClick={() => handleOpenModal()}
        emptyStateText="Nenhum vídeo encontrado. Adicione seu primeiro vídeo!"
        EmptyStateIcon={VideosIcon}
        itemCount={filteredVideos.length}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterGroups={[
            { label: 'Plataformas', value: platformFilter, options: [{value: 'YouTube', label: 'YouTube'}, {value: 'Vimeo', label: 'Vimeo'}], onChange: setPlatformFilter },
            { label: 'Mostrar', value: favoriteFilter, options: [{value: 'favorites', label: 'Favoritos'}], onChange: setFavoriteFilter }
        ]}
        >
        {(viewMode) => viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map(video => (
                    <VideoCard 
                        key={video.id} 
                        video={video} 
                        onEdit={() => handleOpenModal(video)}
                        onDelete={() => handleDeleteVideo(video.id)}
                        onToggleFavorite={() => handleToggleFavorite(video)}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {filteredVideos.map(video => (
                    <VideoListItem
                        key={video.id}
                        video={video}
                        onEdit={() => handleOpenModal(video)}
                        onDelete={() => handleDeleteVideo(video.id)}
                        onToggleFavorite={() => handleToggleFavorite(video)}
                    />
                ))}
            </div>
        )}
        </ContentPageLayout>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}>
            <VideoForm initialData={editingVideo} onSave={handleSaveVideo} onCancel={handleCloseModal} />
        </Modal>
    </>
  );
};

const VideoForm: React.FC<{ initialData: Video | null, onSave: (data: Omit<Video, 'id' | 'isFavorite'>) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [channel, setChannel] = useState(initialData?.channel || '');
    const [platform, setPlatform] = useState<Video['platform']>(initialData?.platform || 'YouTube');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, url, channel, platform });
    }
    
    const formInputClasses = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">URL do Vídeo</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Plataforma</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Video['platform'])} className={formInputClasses} required>
                    <option value="YouTube">YouTube</option>
                    <option value="Vimeo">Vimeo</option>
                    <option value="Other">Outra</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Canal / Criador</label>
                <input type="text" value={channel} onChange={e => setChannel(e.target.value)} className={formInputClasses} required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-brand-dark font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-dark text-white font-semibold rounded-lg hover:bg-gray-800">Salvar</button>
            </div>
        </form>
    )
}

export default Videos;
