import React, { useState, useEffect } from 'react';
import { Page, Tool, Course, Video, Note, Resource } from '../types';
import { ToolsIcon, VideosIcon, NotesIcon, StudyIcon, ResourcesIcon } from '../components/Icons';
// @ts-ignore
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
    setActivePage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: number; subtext: string; icon: React.FC<{className?: string}>; color: string, onClick: () => void }> = ({ title, value, subtext, icon: Icon, color, onClick }) => (
  <button onClick={onClick} className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between text-left hover:border-indigo-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex justify-between items-start">
        <div>
            <p className="text-brand-gray font-medium">{title}</p>
            <p className="text-3xl font-bold text-brand-dark mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
        </div>
        <Icon className="w-6 h-6 text-brand-gray" />
    </div>
    <div className={`h-1 w-full rounded-full mt-4`} style={{backgroundColor: color}}></div>
  </button>
);


const QuickAction: React.FC<{ title: string; description: string; icon: React.FC<{className?: string}>; onClick: () => void }> = ({ title, description, icon: Icon, onClick }) => (
    <button onClick={onClick} className="bg-white p-5 rounded-xl border border-gray-200 text-left hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-2">
            <Icon className="w-5 h-5 text-brand-dark mr-3" />
            <h4 className="font-semibold text-brand-dark">{title}</h4>
        </div>
        <p className="text-sm text-brand-gray">{description}</p>
    </button>
);

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981'];

const Dashboard: React.FC<DashboardProps> = ({ setActivePage }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tools: 0, videos: 0, notes: 0, completedCourses: 0, resources: 0 });
  const [chartData, setChartData] = useState<{ toolsByCategory: { name: string; value: number }[], courseProgress: { name: string; progress: number }[] }>({ toolsByCategory: [], courseProgress: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Load statistics from Supabase
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const loadStats = async () => {
      try {
        // Load tools
        const { data: toolsData, count: toolsCount } = await supabase
          .from('tools')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (toolsData) {
          const counts = toolsData.reduce((acc, tool) => {
            acc[tool.category] = (acc[tool.category] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          setStats(prev => ({ ...prev, tools: toolsCount || 0 }))
          setChartData(prev => ({ ...prev, toolsByCategory: Object.entries(counts).map(([name, value]) => ({ name, value })) }))
        }

        // Load courses
        const { data: coursesData, count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (coursesData) {
          const completedCount = coursesData.filter(c => c.status === 'Completed').length
          const inProgressCourses = coursesData.filter(c => c.status === 'In Progress').map(c => ({ name: c.title, progress: c.progress }))
          setStats(prev => ({ ...prev, completedCourses: completedCount }))
          setChartData(prev => ({ ...prev, courseProgress: inProgressCourses }))
        }

        // Load videos
        const { count: videosCount } = await supabase
          .from('videos')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
        setStats(prev => ({ ...prev, videos: videosCount || 0 }))

        // Load notes
        const { count: notesCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
        setStats(prev => ({ ...prev, notes: notesCount || 0 }))

        // Load resources
        const { count: resourcesCount } = await supabase
          .from('resources')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
        setStats(prev => ({ ...prev, resources: resourcesCount || 0 }))
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()

    // Subscribe to realtime changes
    const toolSubscription = supabase
      .channel('tools-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        loadStats()
      })
      .subscribe()

    const courseSubscription = supabase
      .channel('courses-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        loadStats()
      })
      .subscribe()

    const videoSubscription = supabase
      .channel('videos-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        loadStats()
      })
      .subscribe()

    const noteSubscription = supabase
      .channel('notes-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        loadStats()
      })
      .subscribe()

    const resourceSubscription = supabase
      .channel('resources-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
        loadStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(toolSubscription)
      supabase.removeChannel(courseSubscription)
      supabase.removeChannel(videoSubscription)
      supabase.removeChannel(noteSubscription)
      supabase.removeChannel(resourceSubscription)
    }
  }, [user]);

  const statCards = [
    { title: 'Ferramentas', value: stats.tools, subtext: 'ferramentas salvas', icon: ToolsIcon, color: '#6366F1', page: Page.Ferramentas },
    { title: 'Vídeos', value: stats.videos, subtext: 'vídeos salvos', icon: VideosIcon, color: '#EC4899', page: Page.Videos },
    { title: 'Notas', value: stats.notes, subtext: 'notas criadas', icon: NotesIcon, color: '#F59E0B', page: Page.Notas },
    { title: 'Aprendizado', value: stats.completedCourses, subtext: 'cursos concluídos', icon: StudyIcon, color: '#8B5CF6', page: Page.Estudo },
    { title: 'Recursos', value: stats.resources, subtext: 'recursos salvos', icon: ResourcesIcon, color: '#EF4444', page: Page.Recursos },
  ];
  
  const quickActions = [
      { title: 'Nova Ferramenta', description: 'Adicionar uma nova ferramenta', icon: ToolsIcon, page: Page.Ferramentas },
      { title: 'Nova Nota', description: 'Criar uma nova nota', icon: NotesIcon, page: Page.Notas },
      { title: 'Novo Vídeo', description: 'Adicionar um vídeo', icon: VideosIcon, page: Page.Videos },
      { title: 'Novo Recurso', description: 'Adicionar um recurso', icon: ResourcesIcon, page: Page.Recursos },
  ]

  if (isLoading) {
    return <LoadingSpinner fullPage message="Carregando dashboard..." />;
  }

  return (
    <div className="p-8 space-y-8 bg-brand-light">
      <div>
        <h2 className="text-3xl font-bold text-brand-dark">Bem-vindo de volta!</h2>
        <p className="text-brand-gray mt-2">Aqui está um resumo das suas atividades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} onClick={() => setActivePage(stat.page)} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-80 flex flex-col">
              <h3 className="text-lg font-semibold text-brand-dark">Ferramentas por Categoria</h3>
              <p className="text-sm text-brand-gray mb-4">Distribuição das suas ferramentas</p>
              {chartData.toolsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData.toolsByCategory} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {chartData.toolsByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center text-brand-gray">Adicione ferramentas para ver o gráfico</div>
              )}
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-80 flex flex-col">
              <h3 className="text-lg font-semibold text-brand-dark">Progresso dos Cursos</h3>
              <p className="text-sm text-brand-gray mb-4">Seus cursos em andamento</p>
              {chartData.courseProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.courseProgress} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`}/>
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="progress" fill="#8B5CF6" background={{ fill: '#eee' }} />
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="flex-1 flex items-center justify-center text-brand-gray">Adicione cursos para ver o progresso</div>
              )}
          </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-dark mb-1">Ações Rápidas</h3>
        <p className="text-sm text-brand-gray mb-4">Adicione novos itens rapidamente</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map(action => (
                <QuickAction 
                    key={action.title}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={() => setActivePage(action.page)}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
