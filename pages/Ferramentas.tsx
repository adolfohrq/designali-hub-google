import React, { useState, useMemo, useEffect } from 'react';
import ContentPageLayout from '../components/ContentPageLayout';
import { Tool, SuggestedTool } from '../types';
import Modal from '../components/Modal';
import Card from '../components/Card';
import { EditIcon, TrashIcon, ExternalLinkIcon, StarIcon, ToolsIcon, SparklesIcon } from '../components/Icons';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';


const ToolCard: React.FC<{ tool: Tool, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ tool, onEdit, onDelete, onToggleFavorite }) => {
    return (
        <Card>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {tool.imageUrl ? <img src={tool.imageUrl} alt={tool.name} className="w-12 h-12 rounded-lg object-contain bg-gray-100" /> : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><ToolsIcon className="w-6 h-6 text-gray-400"/></div>}
                        <div>
                            <h3 className="font-bold text-brand-dark">{tool.name}</h3>
                            <p className="text-sm text-brand-gray">{tool.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                           <ExternalLinkIcon className="w-5 h-5"/>
                        </a>
                        <StarIcon onClick={onToggleFavorite} className={`w-5 h-5 cursor-pointer ${tool.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    </div>
                </div>
                <p className="text-sm text-brand-gray mt-3 h-10 overflow-hidden">{tool.description}</p>
            </div>
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end gap-2">
                 <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-4 h-4" /></button>
                 <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </Card>
    );
};

const ToolListItem: React.FC<{ tool: Tool, onEdit: () => void, onDelete: () => void, onToggleFavorite: () => void }> = ({ tool, onEdit, onDelete, onToggleFavorite }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
                {tool.imageUrl ? <img src={tool.imageUrl} alt={tool.name} className="w-10 h-10 rounded-lg object-contain bg-gray-100" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ToolsIcon className="w-5 h-5 text-gray-400"/></div>}
                <div>
                    <h3 className="font-semibold text-brand-dark">{tool.name}</h3>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{tool.url}</a>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm text-brand-gray bg-gray-100 px-3 py-1 rounded-full">{tool.category}</span>
                <div className="flex items-center gap-3">
                    <StarIcon onClick={onToggleFavorite} className={`w-6 h-6 cursor-pointer ${tool.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                    <button onClick={onEdit} className="p-2 text-gray-500 hover:text-brand-dark rounded-md transition-colors"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    )
}

const Ferramentas: React.FC = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');

  // Load tools from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchTools = async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching tools:', error)
        toast.error('Erro ao carregar ferramentas')
      } else {
        // Map snake_case from DB to camelCase for frontend
        const mappedTools = data.map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          url: tool.url,
          category: tool.category,
          description: tool.description,
          imageUrl: tool.icon,
          isFavorite: tool.is_favorite
        }))
        setTools(mappedTools as Tool[])
      }
    }

    fetchTools()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('tools-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        fetchTools()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user]);

  const categories = useMemo(() => [...new Set(tools.map(t => t.category))], [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
        const matchesFavorite = favoriteFilter === 'all' || (favoriteFilter === 'favorites' && tool.isFavorite);
        return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [tools, searchTerm, categoryFilter, favoriteFilter]);

  const handleOpenModal = (tool: Tool | null = null) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
  };
  
  const handleOpenAiModal = () => setIsAiModalOpen(true);
  const handleCloseAiModal = () => setIsAiModalOpen(false);

  const handleSaveTool = async (toolData: Omit<Tool, 'id' | 'isFavorite'>) => {
    try {
      // Map camelCase to snake_case for DB
      const dbData = {
        name: toolData.name,
        url: toolData.url,
        category: toolData.category,
        description: toolData.description,
        icon: toolData.imageUrl || null
      }

      if (editingTool) {
        const { error} = await supabase
          .from('tools')
          .update(dbData)
          .eq('id', editingTool.id)

        if (error) throw error
        toast.success('Ferramenta atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('tools')
          .insert([{ ...dbData, is_favorite: false, user_id: user?.id }])

        if (error) throw error
        toast.success('Ferramenta criada com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving tool:', error)
      toast.error('Erro ao salvar ferramenta')
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if(window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      try {
        const { error } = await supabase
          .from('tools')
          .delete()
          .eq('id', toolId)

        if (error) throw error
        toast.success('Ferramenta excluída com sucesso!')
      } catch (error) {
        console.error('Error deleting tool:', error)
        toast.error('Erro ao excluir ferramenta')
      }
    }
  }

  const handleToggleFavorite = async (tool: Tool) => {
      try {
        const { error } = await supabase
          .from('tools')
          .update({ is_favorite: !tool.isFavorite })
          .eq('id', tool.id)

        if (error) throw error
        toast.success('Favorito atualizado!')
      } catch (error) {
        console.error('Error toggling favorite:', error)
        toast.error('Erro ao atualizar favorito')
      }
  }

  const handleAddSuggestedTools = async (suggestedTools: SuggestedTool[]) => {
    try {
      const newTools = suggestedTools.map(tool => ({
        name: tool.name,
        url: tool.url,
        category: tool.category,
        description: tool.description,
        icon: null,
        is_favorite: false,
        user_id: user?.id
      }))

      const { error } = await supabase
        .from('tools')
        .insert(newTools)

      if (error) throw error

      if (newTools.length > 1) {
        toast.success(`${newTools.length} ferramentas adicionadas com sucesso!`)
      } else if (newTools.length === 1) {
        toast.success(`${newTools[0].name} adicionado à sua lista!`)
      }
    } catch (error) {
      console.error('Error adding suggested tools:', error)
      toast.error('Erro ao adicionar ferramentas')
    }
  };

  return (
    <>
      <ContentPageLayout
        title="Ferramentas"
        subtitle="Gerencie suas ferramentas de design"
        buttonText="Nova Ferramenta"
        onButtonClick={() => handleOpenModal()}
        secondaryButton={{
            text: 'Sugerir com IA',
            onClick: handleOpenAiModal,
            icon: SparklesIcon
        }}
        emptyStateText="Nenhuma ferramenta encontrada. Adicione sua primeira ferramenta!"
        EmptyStateIcon={ToolsIcon}
        itemCount={filteredTools.length}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterGroups={[
          { label: 'Categorias', value: categoryFilter, options: categories.map(c => ({value: c, label: c})), onChange: setCategoryFilter },
          { label: 'Mostrar', value: favoriteFilter, options: [{value: 'favorites', label: 'Favoritos'}], onChange: setFavoriteFilter }
        ]}
      >
        {(viewMode) => viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTools.map(tool => (
                    <ToolCard 
                        key={tool.id} 
                        tool={tool} 
                        onEdit={() => handleOpenModal(tool)}
                        onDelete={() => handleDeleteTool(tool.id)}
                        onToggleFavorite={() => handleToggleFavorite(tool)}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {filteredTools.map(tool => (
                     <ToolListItem 
                        key={tool.id} 
                        tool={tool} 
                        onEdit={() => handleOpenModal(tool)}
                        onDelete={() => handleDeleteTool(tool.id)}
                        onToggleFavorite={() => handleToggleFavorite(tool)}
                    />
                ))}
            </div>
        )}
      </ContentPageLayout>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'} size="md">
          <ToolForm initialData={editingTool} onSave={handleSaveTool} onCancel={handleCloseModal} />
      </Modal>

      <Modal isOpen={isAiModalOpen} onClose={handleCloseAiModal} size="xl" hideHeader>
          <AiSuggestToolForm currentTools={tools} onAddTools={handleAddSuggestedTools} />
      </Modal>
    </>
  );
};

const AiSuggestToolForm: React.FC<{ currentTools: Tool[], onAddTools: (tools: SuggestedTool[]) => void }> = ({ currentTools, onAddTools }) => {
    const [topic, setTopic] = useState('');
    const [toolType, setToolType] = useState('any');
    const [pricingModel, setPricingModel] = useState('any');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SuggestedTool[]>([]);
    const [addedToolNames, setAddedToolNames] = useState<string[]>([]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic && toolType === 'any' && pricingModel === 'any') {
            toast.error('Por favor, defina pelo menos um critério de busca.');
            return;
        }

        setIsLoading(true);
        setSuggestions([]);
        setAddedToolNames([]);

        try {
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('API key não configurada');
            }
            const ai = new GoogleGenAI({ apiKey });
            
            const currentToolNames = currentTools.map(t => t.name).join(', ');
            
            let prompt = `You are an expert in software and creative tools. I am looking for new tools. Please suggest up to 5 new and relevant tools based on these criteria:`;
            if (topic) prompt += `\n- Topic/Keywords: "${topic}"`;
            if (toolType !== 'any') prompt += `\n- Tool Type: "${toolType}"`;
            if (pricingModel !== 'any') prompt += `\n- Pricing Model: "${pricingModel}"`;
            prompt += `\n\nMy current tools are: ${currentToolNames}. Please suggest tools that are not in my current list. Provide the name, a brief description, a relevant category (e.g., Design, Development, Productivity), and the official URL for each tool.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tools: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        category: { type: Type.STRING },
                                        url: { type: Type.STRING },
                                    },
                                    required: ["name", "description", "category", "url"]
                                }
                            }
                        }
                    }
                }
            });

            const jsonResponse = JSON.parse(response.text);
            const newSuggestions = (jsonResponse.tools || []).filter((tool: SuggestedTool) => 
                !currentTools.some(currentTool => currentTool.name.toLowerCase() === tool.name.toLowerCase())
            );
            setSuggestions(newSuggestions);

            if (newSuggestions.length === 0) {
                 toast.success('Nenhuma nova sugestão encontrada para estes critérios.');
            }

        } catch (error: any) {
            console.error("Error generating suggestions:", error);

            // Check if it's a 503 (service unavailable) error
            if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
                toast.error('O serviço de IA está temporariamente indisponível. Por favor, tente novamente em alguns minutos.');
            } else if (error?.message?.includes('API key')) {
                toast.error('Erro na configuração da API. Verifique sua chave API.');
            } else {
                toast.error('Ocorreu um erro ao gerar sugestões. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = (tool: SuggestedTool) => {
        onAddTools([tool]);
        setAddedToolNames(prev => [...prev, tool.name]);
    };

    const handleAddAll = () => {
        const toolsToAdd = suggestions.filter(tool => !addedToolNames.includes(tool.name));
        if (toolsToAdd.length > 0) {
            onAddTools(toolsToAdd);
            setAddedToolNames(prev => [...prev, ...toolsToAdd.map(t => t.name)]);
        } else {
            toast.success('Todas as sugestões já foram adicionadas.');
        }
    };

    const allSuggestionsAdded = useMemo(() => {
        if (suggestions.length === 0) return false;
        return suggestions.every(tool => addedToolNames.includes(tool.name));
    }, [suggestions, addedToolNames]);
    
    const formSelectClasses = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-brand-dark font-medium";

    return (
        <div className="p-6 space-y-6">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Descobrir Ferramentas</h3>
                </div>
                <p className="text-purple-100 text-sm">Deixe a IA encontrar as melhores ferramentas para suas necessidades</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
                {/* Tópico principal */}
                <div>
                    <label className="block text-sm font-bold text-brand-dark mb-2" htmlFor="topic-input">
                        O que você está procurando?
                    </label>
                    <div className="relative">
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="Ex: editor de vídeo para iniciantes, ferramenta de design UI/UX..."
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-brand-dark placeholder:text-gray-400"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Filtros avançados */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border-2 border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Filtros Opcionais</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-brand-dark mb-2" htmlFor="tool-type">
                                Categoria
                            </label>
                            <select id="tool-type" value={toolType} onChange={e => setToolType(e.target.value)} className={formSelectClasses} disabled={isLoading}>
                                <option value="any">🎯 Qualquer categoria</option>
                                <option value="Design">🎨 Design</option>
                                <option value="Development">💻 Desenvolvimento</option>
                                <option value="Productivity">⚡ Produtividade</option>
                                <option value="Marketing">📢 Marketing</option>
                                <option value="AI">🤖 Inteligência Artificial</option>
                                <option value="Video">🎬 Vídeo & Áudio</option>
                                <option value="Writing">✍️ Escrita & Conteúdo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-dark mb-2" htmlFor="pricing-model">
                                Modelo de Preço
                            </label>
                            <select id="pricing-model" value={pricingModel} onChange={e => setPricingModel(e.target.value)} className={formSelectClasses} disabled={isLoading}>
                                <option value="any">💰 Qualquer preço</option>
                                <option value="Free">🆓 Gratuito</option>
                                <option value="Freemium">🎁 Freemium</option>
                                <option value="Paid">💳 Pago</option>
                                <option value="Open Source">🌐 Open Source</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Botão de gerar */}
                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Buscando sugestões...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            <span>Descobrir Ferramentas</span>
                        </>
                    )}
                </button>
            </form>

            {/* Loading state com animação */}
            {isLoading && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border-2 border-purple-100">
                    <div className="animate-pulse space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mx-auto flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <p className="text-brand-dark font-semibold">Analisando milhares de ferramentas...</p>
                        <p className="text-sm text-gray-600">Isso pode levar alguns segundos</p>
                    </div>
                </div>
            )}

            {/* Resultados */}
            {suggestions.length > 0 && !isLoading && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-brand-dark text-lg">Ferramentas Recomendadas</h4>
                            <p className="text-sm text-gray-600">{suggestions.length} {suggestions.length === 1 ? 'sugestão encontrada' : 'sugestões encontradas'}</p>
                        </div>
                        <button
                            onClick={handleAddAll}
                            disabled={allSuggestionsAdded}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {allSuggestionsAdded ? (
                                <>
                                    <span>✓</span>
                                    <span>Todas Adicionadas</span>
                                </>
                            ) : (
                                <>
                                    <span>+</span>
                                    <span>Adicionar Todas</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {suggestions.map((tool, index) => {
                            const isAdded = addedToolNames.includes(tool.name);
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <a
                                                    href={tool.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-lg text-brand-dark hover:text-purple-600 flex items-center gap-2 group-hover:underline"
                                                >
                                                    {tool.name}
                                                    <ExternalLinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                                <span className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-bold px-3 py-1 rounded-full">
                                                    {tool.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddClick(tool)}
                                            disabled={isAdded}
                                            className={`px-5 py-2.5 font-bold rounded-xl transition-all shadow-md flex-shrink-0 ${
                                                isAdded
                                                    ? 'bg-green-500 text-white cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transform hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {isAdded ? '✓ Adicionado' : '+ Adicionar'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty state quando não há sugestões e não está carregando */}
            {suggestions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Preencha os campos acima e clique em "Descobrir Ferramentas"</p>
                    <p className="text-sm mt-1">A IA irá sugerir ferramentas personalizadas para você</p>
                </div>
            )}
        </div>
    );
};


const ToolForm: React.FC<{ initialData: Tool | null, onSave: (data: Omit<Tool, 'id' | 'isFavorite'>) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, url, category, description, imageUrl });
    }
    
    const formInputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className={formInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">URL da Imagem (Opcional)</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={formInputClasses} />
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Categoria</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={formInputClasses} required />
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


export default Ferramentas;
