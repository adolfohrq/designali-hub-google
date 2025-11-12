import React, { useState, useEffect } from 'react';
import { Tutorial } from '../types';
import Modal from './Modal';

interface TutorialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tutorial: Partial<Tutorial>) => Promise<void>;
  tutorial?: Tutorial | null;
}

const TutorialForm: React.FC<TutorialFormProps> = ({ isOpen, onClose, onSave, tutorial }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tutorial) {
      setTitle(tutorial.title);
      setUrl(tutorial.url);
      setSource(tutorial.source);
      setDescription(tutorial.description || '');
    } else {
      // Reset form for new tutorial
      setTitle('');
      setUrl('');
      setSource('');
      setDescription('');
    }
  }, [tutorial, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tutorialData: Partial<Tutorial> = {
        title,
        url,
        source,
        description: description || undefined,
      };

      if (tutorial) {
        tutorialData.id = tutorial.id;
      }

      await onSave(tutorialData);
      onClose();
    } catch (error) {
      console.error('Error saving tutorial:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tutorial ? 'Editar Tutorial' : 'Adicionar Tutorial'}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="tutorial-title">
            Título *
          </label>
          <input
            id="tutorial-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como criar uma API REST com Node.js"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="tutorial-url">
            URL *
          </label>
          <input
            id="tutorial-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="tutorial-source">
            Fonte *
          </label>
          <input
            id="tutorial-source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex: Medium, Dev.to, Blog pessoal"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="tutorial-description">
            Descrição (opcional)
          </label>
          <textarea
            id="tutorial-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do tutorial..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
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
            {loading ? 'Salvando...' : tutorial ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TutorialForm;
