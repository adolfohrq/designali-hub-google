import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import Modal from './Modal';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Partial<Course>) => Promise<void>;
  course?: Course | null;
}

const CourseForm: React.FC<CourseFormProps> = ({ isOpen, onClose, onSave, course }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Course['status']>('Not Started');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setPlatform(course.platform);
      setUrl(course.url || '');
      setDescription(course.description || '');
      setProgress(course.progress);
      setStatus(course.status);
    } else {
      // Reset form for new course
      setTitle('');
      setPlatform('');
      setUrl('');
      setDescription('');
      setProgress(0);
      setStatus('Not Started');
    }
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData: Partial<Course> = {
        title,
        platform,
        url: url || undefined,
        description: description || undefined,
        progress,
        status,
      };

      if (course) {
        courseData.id = course.id;
      }

      await onSave(courseData);
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? 'Editar Curso' : 'Adicionar Curso'}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-title">
            Título *
          </label>
          <input
            id="course-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: React - The Complete Guide"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-platform">
            Plataforma *
          </label>
          <input
            id="course-platform"
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Ex: Udemy, Coursera, YouTube"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-url">
            URL (opcional)
          </label>
          <input
            id="course-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-description">
            Descrição (opcional)
          </label>
          <textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do curso..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-status">
            Status *
          </label>
          <select
            id="course-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Course['status'])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Not Started">Não Iniciado</option>
            <option value="In Progress">Em Progresso</option>
            <option value="Completed">Concluído</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="course-progress">
            Progresso: {progress}%
          </label>
          <input
            id="course-progress"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-brand-gray mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-brand-gray hover:text-brand-dark transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-dark text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : course ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseForm;
