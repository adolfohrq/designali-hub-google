import React, { useState, useEffect } from 'react';
import { Course, Tutorial } from '../types';
import { SearchIcon, PlusIcon, StudyIcon, NotesIcon, TrashIcon, EditIcon, StarIcon, LinkIcon } from '../components/Icons';
import Card from '../components/Card';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import CourseForm from '../components/CourseForm';
import TutorialForm from '../components/TutorialForm';
// @ts-ignore
import { toast } from 'react-hot-toast';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onProgressUpdate: (id: string, progress: number) => void;
  onStatusChange: (id: string, status: Course['status']) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  onToggleFavorite,
  onProgressUpdate,
  onStatusChange
}) => {
  const getProgressColor = (status: Course['status']) => {
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'In Progress') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getStatusBadgeClass = (status: Course['status']) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus: Course['status']): Course['status'] => {
    if (currentStatus === 'Not Started') return 'In Progress';
    if (currentStatus === 'In Progress') return 'Completed';
    return 'Not Started';
  };

  const handleStatusClick = () => {
    const nextStatus = getNextStatus(course.status);
    onStatusChange(course.id, nextStatus);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    onProgressUpdate(course.id, newProgress);
  };

  return (
    <Card className="flex flex-col relative group">
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => onToggleFavorite(course.id, !course.is_favorite)}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
          title={course.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <StarIcon className={`w-4 h-4 ${course.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={() => onEdit(course)}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
          title="Editar curso"
        >
          <EditIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja deletar este curso?')) {
              onDelete(course.id);
            }
          }}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition"
          title="Deletar curso"
        >
          <TrashIcon className="w-4 h-4 text-red-600" />
        </button>
      </div>

      <div className="p-4 flex-1">
        <button
          onClick={handleStatusClick}
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(course.status)} hover:opacity-80 transition cursor-pointer`}
          title="Clique para alterar status"
        >
          {course.status === 'Not Started' ? 'Não Iniciado' : course.status === 'In Progress' ? 'Em Progresso' : 'Concluído'}
        </button>
        <h3 className="font-bold text-brand-dark mt-2">{course.title}</h3>
        <p className="text-sm text-brand-gray">{course.platform}</p>
        {course.description && (
          <p className="text-xs text-brand-gray mt-2 line-clamp-2">{course.description}</p>
        )}
        {course.url && (
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline mt-2 inline-flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            Acessar curso
          </a>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-brand-dark">Progresso</p>
          <p className="text-sm font-bold text-brand-dark">{course.progress}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`${getProgressColor(course.status)} h-2 rounded-full transition-all`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={course.progress}
          onChange={handleProgressChange}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          title={`Ajustar progresso: ${course.progress}%`}
        />
      </div>
    </Card>
  );
};

interface TutorialCardProps {
  tutorial: Tutorial;
  onEdit: (tutorial: Tutorial) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, onEdit, onDelete, onToggleFavorite }) => {
  return (
    <Card className="relative group">
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => onToggleFavorite(tutorial.id, !tutorial.is_favorite)}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
          title={tutorial.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <StarIcon className={`w-4 h-4 ${tutorial.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={() => onEdit(tutorial)}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
          title="Editar tutorial"
        >
          <EditIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja deletar este tutorial?')) {
              onDelete(tutorial.id);
            }
          }}
          className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition"
          title="Deletar tutorial"
        >
          <TrashIcon className="w-4 h-4 text-red-600" />
        </button>
      </div>

      <div className="p-4">
        <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
          <h3 className="font-bold text-brand-dark hover:text-indigo-600 transition-colors">{tutorial.title}</h3>
        </a>
        <p className="text-sm text-brand-gray mt-1">{tutorial.source}</p>
        {tutorial.description && (
          <p className="text-xs text-brand-gray mt-2 line-clamp-2">{tutorial.description}</p>
        )}
        <a
          href={tutorial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline mt-2 inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          Acessar tutorial
        </a>
      </div>
    </Card>
  );
};

const Estudo: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'tutorials'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modal states
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isTutorialFormOpen, setIsTutorialFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);

  // Fetch courses
  const fetchCourses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erro ao carregar cursos');
    } else {
      setCourses(data as Course[]);
    }
  };

  // Fetch tutorials
  const fetchTutorials = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutorials:', error);
      toast.error('Erro ao carregar tutoriais');
    } else {
      setTutorials(data as Tutorial[]);
    }
  };

  // Initial load and real-time subscriptions
  useEffect(() => {
    fetchCourses();
    fetchTutorials();

    // Subscribe to realtime changes
    const courseSubscription = supabase
      .channel('courses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCourses();
      })
      .subscribe();

    const tutorialSubscription = supabase
      .channel('tutorials-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutorials' }, () => {
        fetchTutorials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(courseSubscription);
      supabase.removeChannel(tutorialSubscription);
    };
  }, [user]);

  // CRUD Handlers for Courses
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    if (!user) return;

    try {
      if (courseData.id) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            ...courseData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', courseData.id);

        if (error) throw error;
        toast.success('Curso atualizado com sucesso!');
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert({
            ...courseData,
            user_id: user.id,
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('Curso adicionado com sucesso!');
      }
      setEditingCourse(null);
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Erro ao salvar curso');
      throw error;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Curso deletado com sucesso!');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Erro ao deletar curso');
    }
  };

  const handleToggleCourseFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      toast.success(isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Erro ao atualizar favorito');
    }
  };

  const handleCourseProgressUpdate = async (id: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Erro ao atualizar progresso');
    }
  };

  const handleCourseStatusChange = async (id: string, status: Course['status']) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Status alterado para: ${status === 'Not Started' ? 'Não Iniciado' : status === 'In Progress' ? 'Em Progresso' : 'Concluído'}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  // CRUD Handlers for Tutorials
  const handleSaveTutorial = async (tutorialData: Partial<Tutorial>) => {
    if (!user) return;

    try {
      if (tutorialData.id) {
        // Update existing tutorial
        const { error } = await supabase
          .from('tutorials')
          .update({
            ...tutorialData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tutorialData.id);

        if (error) throw error;
        toast.success('Tutorial atualizado com sucesso!');
      } else {
        // Create new tutorial
        const { error } = await supabase
          .from('tutorials')
          .insert({
            ...tutorialData,
            user_id: user.id,
            is_favorite: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('Tutorial adicionado com sucesso!');
      }
      setEditingTutorial(null);
    } catch (error: any) {
      console.error('Error saving tutorial:', error);
      toast.error(error.message || 'Erro ao salvar tutorial');
      throw error;
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tutorial deletado com sucesso!');
    } catch (error: any) {
      console.error('Error deleting tutorial:', error);
      toast.error(error.message || 'Erro ao deletar tutorial');
    }
  };

  const handleToggleTutorialFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      toast.success(isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Erro ao atualizar favorito');
    }
  };

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorites = !showFavoritesOnly || course.is_favorite;
    return matchesSearch && matchesFavorites;
  });

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tutorial.description && tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorites = !showFavoritesOnly || tutorial.is_favorite;
    return matchesSearch && matchesFavorites;
  });

  const handleAddClick = () => {
    if (activeTab === 'courses') {
      setEditingCourse(null);
      setIsCourseFormOpen(true);
    } else {
      setEditingTutorial(null);
      setIsTutorialFormOpen(true);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseFormOpen(true);
  };

  const handleEditTutorial = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setIsTutorialFormOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Aprendizado</h1>
          <p className="text-brand-gray mt-2">Gerencie seus tutoriais e cursos</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center bg-brand-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {activeTab === 'courses' ? 'Adicionar Curso' : 'Adicionar Tutorial'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center px-4 py-2 rounded-lg border transition ${
            showFavoritesOnly
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
              : 'bg-white border-gray-300 text-brand-gray hover:bg-gray-50'
          }`}
        >
          <StarIcon className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favoritos
        </button>

        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center px-4 py-1.5 text-sm font-medium rounded transition ${
              activeTab === 'courses' ? 'bg-gray-200 text-brand-dark' : 'text-brand-gray hover:bg-gray-100'
            }`}
          >
            <StudyIcon className="w-4 h-4 mr-2" /> Cursos ({filteredCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`flex items-center px-4 py-1.5 text-sm font-medium rounded transition ${
              activeTab === 'tutorials' ? 'bg-gray-200 text-brand-dark' : 'text-brand-gray hover:bg-gray-100'
            }`}
          >
            <NotesIcon className="w-4 h-4 mr-2" /> Tutoriais ({filteredTutorials.length})
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'courses' && (
          filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onToggleFavorite={handleToggleCourseFavorite}
                  onProgressUpdate={handleCourseProgressUpdate}
                  onStatusChange={handleCourseStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
              <StudyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-brand-gray mb-2">
                {searchQuery || showFavoritesOnly
                  ? 'Nenhum curso encontrado com os filtros aplicados.'
                  : 'Nenhum curso encontrado. Adicione seu primeiro curso!'}
              </p>
              {!searchQuery && !showFavoritesOnly && (
                <button
                  onClick={handleAddClick}
                  className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                  + Adicionar Curso
                </button>
              )}
            </div>
          )
        )}

        {activeTab === 'tutorials' && (
          filteredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTutorials.map(tutorial => (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onEdit={handleEditTutorial}
                  onDelete={handleDeleteTutorial}
                  onToggleFavorite={handleToggleTutorialFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
              <NotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-brand-gray mb-2">
                {searchQuery || showFavoritesOnly
                  ? 'Nenhum tutorial encontrado com os filtros aplicados.'
                  : 'Nenhum tutorial encontrado. Adicione seu primeiro tutorial!'}
              </p>
              {!searchQuery && !showFavoritesOnly && (
                <button
                  onClick={handleAddClick}
                  className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                  + Adicionar Tutorial
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <CourseForm
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        course={editingCourse}
      />

      <TutorialForm
        isOpen={isTutorialFormOpen}
        onClose={() => {
          setIsTutorialFormOpen(false);
          setEditingTutorial(null);
        }}
        onSave={handleSaveTutorial}
        tutorial={editingTutorial}
      />
    </div>
  );
};

export default Estudo;
