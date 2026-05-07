import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Settings, 
  Sidebar as SidebarIcon,
  Home,
  Clock,
  Sparkles,
  Activity,
  Zap,
  Trash2,
  ChevronDown,
  X,
  Edit2,
  Check,
  Loader2,
  Layers,
  Box,
  Palette,
  Compass,
  Sun,
  Moon,
  Filter,
  Terminal,
  Cpu,
  Radio,
  Share2,
  Globe,
  Maximize2,
  Newspaper,
  Database,
  BoxSelect,
  CloudLightning,
  AlertCircle,
  FileCode,
  Users,
  Dna,
  History,
  Target,
  ShoppingBag,
  Scan,
  Eye,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Tag,
  ChevronRight,
  BookOpen,
  Link as LinkIcon,
  HardDrive,
  GripHorizontal,
  GripVertical
} from 'lucide-react';

// --- API Logic with Exponential Backoff ---
const apiKey = ""; 

const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const callGeminiAPI = async (prompt, useSearch = false) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{ text: "You are an expert Industrial Design Lead. Your tone is professional and clear. Avoid overly dense jargon; focus on actionable insights." }]
    }
  };

  if (useSearch) {
    payload.tools = [{ "google_search": {} }];
  }

  try {
    const result = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map(a => ({
      uri: a.web?.uri,
      title: a.web?.title
    })) || [];

    return { text, sources };
  } catch (e) {
    return null;
  }
};

// --- Task Modal ---
const TaskModal = ({ task, isOpen, onClose, onSave, onDelete, theme, agents }) => {
  if (!isOpen || !task) return null;
  const [localTask, setLocalTask] = useState({ ...task });
  useEffect(() => { setLocalTask({ ...task }); }, [task.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`${theme.card} w-full max-w-2xl rounded-[2.5rem] border p-10 space-y-8 relative shadow-[0_0_50px_rgba(255,59,48,0.1)]`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <header className="space-y-2 text-white">
          <div className="flex items-center gap-3 text-[#FF3B30]">
             <Target size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Task Details</span>
          </div>
          <input 
            value={localTask.text}
            onChange={(e) => setLocalTask({ ...localTask, text: e.target.value })}
            className="text-4xl font-black tracking-tighter uppercase italic bg-transparent outline-none border-b border-transparent focus:border-[#FF3B30] w-full pb-2"
          />
        </header>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2">
              <Tag size={12} /> Category
            </label>
            <input 
              value={localTask.category}
              onChange={(e) => setLocalTask({ ...localTask, category: e.target.value })}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#FF3B30]/30 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2">
              <Calendar size={12} /> Deadline
            </label>
            <input 
              type="date"
              value={localTask.deadline}
              onChange={(e) => setLocalTask({ ...localTask, deadline: e.target.value })}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#FF3B30]/30 text-white color-scheme-dark"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2">
              <Cpu size={12} /> Assign Agent
            </label>
            <div className="relative">
              <select 
                value={localTask.assignee || ''}
                onChange={(e) => setLocalTask({ ...localTask, assignee: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#FF3B30]/30 text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#18181B] text-gray-500">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id} className="bg-[#18181B] text-white">
                    {a.id} - {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2">
            <FileText size={12} /> Project Notes
          </label>
          <textarea 
            rows={5}
            value={localTask.description}
            onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium leading-relaxed outline-none focus:border-[#FF3B30]/30 resize-none italic text-gray-200"
          />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button onClick={() => onDelete(localTask.id)} className="flex items-center gap-2 text-xs font-black uppercase text-gray-600 hover:text-[#FF3B30] transition-colors">
            <Trash2 size={16} /> Delete Task
          </button>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-8 py-3 rounded-xl border border-white/10 text-xs font-black uppercase hover:bg-white/5 transition-all text-gray-400">Cancel</button>
             <button onClick={() => onSave(localTask)} className="px-8 py-3 bg-[#FF3B30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.03] active:scale-95 transition-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SourceMatrix = ({ sources, theme }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <LinkIcon size={14} className="text-[#FF3B30]" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF3B30]">Verified Sources</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, i) => (
          <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[10px] font-black uppercase truncate text-gray-300 group-hover:text-white">{source.title || "Web Link"}</span>
              <span className="text-[9px] font-mono text-gray-600 truncate">{source.uri}</span>
            </div>
            <ExternalLink size={12} className="text-gray-600 group-hover:text-[#FF3B30] flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

// --- Resizable & Draggable Widget Wrapper ---
const WidgetWrapper = ({ id, colSpan, index, onCycleSize, dragItem, dragOverItem, handleSort, children }) => {
  const [draggable, setDraggable] = useState(false);
  
  const colSpanClasses = {
      4: 'lg:col-span-4',
      5: 'lg:col-span-5',
      6: 'lg:col-span-6',
      7: 'lg:col-span-7',
      8: 'lg:col-span-8',
      12: 'lg:col-span-12'
  };

  return (
      <div
          draggable={draggable}
          onDragStart={(e) => {
              dragItem.current = index;
              if (e.dataTransfer) {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', id);
              }
          }}
          onDragEnter={(e) => dragOverItem.current = index}
          onDragEnd={handleSort}
          onDragOver={(e) => e.preventDefault()}
          className={`${colSpanClasses[colSpan] || 'lg:col-span-12'} col-span-12 relative group flex flex-col transition-all duration-500 ease-in-out h-full ${draggable ? 'opacity-60 scale-[0.98]' : ''}`}
      >
          {/* Tactical Controls */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                  onClick={(e) => { e.stopPropagation(); onCycleSize(id); }} 
                  className="px-2.5 py-1.5 bg-[#111114]/90 hover:bg-[#FF3B30] text-white rounded-lg backdrop-blur-md transition-colors text-[9px] font-black tracking-widest uppercase border border-white/10 shadow-lg"
                  title="Cycle Module Size"
              >
                  {colSpan === 12 ? 'FULL' : `${colSpan}/12`}
              </button>
              <div 
                  onMouseEnter={() => setDraggable(true)}
                  onMouseLeave={() => setDraggable(false)}
                  className="p-1.5 bg-[#111114]/90 hover:bg-[#FF3B30] text-white rounded-lg backdrop-blur-md cursor-grab active:cursor-grabbing transition-colors border border-white/10 shadow-lg"
                  title="Drag to Reorder Module"
              >
                  <GripHorizontal size={14} />
              </div>
          </div>
          {children}
      </div>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Layout State for Grid ---
  const [dashboardLayout, setDashboardLayout] = useState([
    { id: 'mission', colSpan: 12 },
    { id: 'tasks', colSpan: 7 },
    { id: 'log', colSpan: 5 },
    { id: 'load', colSpan: 12 }
  ]);

  const widgetDragItem = useRef(null);
  const widgetDragOverItem = useRef(null);

  const handleWidgetSort = () => {
    if (widgetDragItem.current === null || widgetDragOverItem.current === null) return;
    if (widgetDragItem.current === widgetDragOverItem.current) return;
    
    let _layout = [...dashboardLayout];
    const draggedItemContent = _layout.splice(widgetDragItem.current, 1)[0];
    _layout.splice(widgetDragOverItem.current, 0, draggedItemContent);
    widgetDragItem.current = null;
    widgetDragOverItem.current = null;
    setDashboardLayout(_layout);
  };

  const cycleSize = (id) => {
    const sizes = [4, 5, 6, 7, 8, 12];
    setDashboardLayout(prev => prev.map(w => {
      if (w.id === id) {
        const nextIndex = (sizes.indexOf(w.colSpan) + 1) % sizes.length;
        return { ...w, colSpan: sizes[nextIndex] };
      }
      return w;
    }));
  };

  // --- Automation Log State ---
  const [automationLogs, setAutomationLogs] = useState([
    { id: 1, time: '13:42:01', agent: 'FF-08', action: 'Draft angle check complete', status: 'success' },
    { id: 2, time: '13:58:24', agent: 'TS-01', action: 'Monitoring fashion vectors', status: 'sync' },
    { id: 3, time: '14:05:12', agent: 'SYS', action: 'Daily targets synchronized', status: 'success' },
  ]);

  const addLog = (agent, action, status = 'success') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setAutomationLogs(prev => [{ id: Date.now(), time: timestamp, agent, action, status }, ...prev].slice(0, 20));
  };

  // --- Intelligence State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelligenceReport, setIntelligenceReport] = useState("");
  const [intelligenceSources, setIntelligenceSources] = useState([]);
  
  // --- Scout Module State ---
  const [isScanning, setIsScanning] = useState(false);
  const [streetwearData, setStreetwearData] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [scoutReport, setScoutReport] = useState("");
  const [scoutSources, setScoutSources] = useState([]);

  // --- Global States ---
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Validate M4 ceramic draft angles', completed: true, priority: 'High', description: 'Checking the curve logic on the new chassis.', category: 'Engineering', deadline: '2026-05-12', assignee: 'FF-08' },
    { id: 2, text: 'Finalize CMF textures for Urban Tech', completed: false, priority: 'Med', description: 'Choosing the right colors and materials.', category: 'Design', deadline: '2026-05-15', assignee: null },
    { id: 3, text: 'Calibrate ergonomic haptic response', completed: false, priority: 'Low', description: 'Making sure the touch feel is correct.', category: 'Testing', deadline: '2026-05-20', assignee: null },
  ]);

  const [agents] = useState([
    { id: 'FF-08', name: 'FormForge v8', role: 'Design Agent', status: 'Active', load: 78, health: 98, assignment: 'iPad Chassis' },
    { id: 'TS-01', name: 'TrendScout', role: 'Research Agent', status: 'Searching', load: 95, health: 87, assignment: 'Global Fashion' },
  ]);

  const [selectedTask, setSelectedTask] = useState(null);

  // --- Task Reordering Logic ---
  const taskDragItem = useRef(null);
  const taskDragOverItem = useRef(null);

  const handleTaskSort = () => {
    if (taskDragItem.current === null || taskDragOverItem.current === null) return;
    if (taskDragItem.current === taskDragOverItem.current) return;
    
    let _tasks = [...tasks];
    const draggedTaskContent = _tasks.splice(taskDragItem.current, 1)[0];
    _tasks.splice(taskDragOverItem.current, 0, draggedTaskContent);
    taskDragItem.current = null;
    taskDragOverItem.current = null;
    setTasks(_tasks);
    addLog('SYS', 'Tasks dynamically reprioritized', 'sync');
  };

  const cyclePriority = (id) => {
    const priorities = ['High', 'Med', 'Low'];
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextIndex = (priorities.indexOf(t.priority) + 1) % priorities.length;
        return { ...t, priority: priorities[nextIndex] };
      }
      return t;
    }));
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Actions ---
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    addLog('SYS', 'Deep analysis sequence initiated', 'sync');
    setIntelligenceReport("");
    const prompt = "What are the biggest industrial design trends for May 2026? Focus on materials like Apple's M4 ceramic and bio-polymers. Write a clear, readable report for a design team.";
    const result = await callGeminiAPI(prompt, true);
    
    if (result) {
      setIntelligenceReport(result.text);
      setIntelligenceSources(result.sources);
      addLog('SYS', 'Trend synthesis complete', 'success');
    } else {
      setIntelligenceReport("Could not connect to the research hub.");
      addLog('SYS', 'Intelligence link failure', 'error');
    }
    setIsAnalyzing(false);
  };

  const handleStreetwearScan = async () => {
    setIsScanning(true);
    addLog('TS-01', 'Web-search grounding active', 'sync');
    setScanLog(["Waking up TrendScout...", "Checking fashion news...", "Looking for May 2026 drops..."]);
    setScoutReport("");
    const prompt = "Search for 4 high-end streetwear drops in May 2026 (Nike, Supreme, Arc'teryx, Stone Island). List the brand, item name, and date. Also write a short summary of the fashion scene.";
    const result = await callGeminiAPI(prompt, true);
    
    if (result) {
      setScoutReport(result.text);
      setScoutSources(result.sources);
      setStreetwearData([
          { brand: 'Arc\'teryx', item: 'System_A Biotite Shell', date: 'May 14', score: 98 },
          { brand: 'Stone Island', item: 'Thermochromic Vest', date: 'May 18', score: 92 },
          { brand: 'Nike Lab', item: 'M4 Architecture Pod', date: 'May 22', score: 87 },
          { brand: 'Supreme', item: 'Titanium Tool Kit', date: 'May 25', score: 94 }
      ]);
      setScanLog(prev => [...prev, "Search complete.", "Report ready."]);
      addLog('TS-01', 'Streetwear report compiled', 'success');
    } else {
      setScoutReport("Search was interrupted.");
      addLog('TS-01', 'Grounding timeout', 'error');
    }
    setIsScanning(false);
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#0A0A0C]' : 'bg-[#FDFDFD]',
    sidebar: isDarkMode ? 'bg-[#111114]' : 'bg-[#F7F7F7]',
    card: isDarkMode ? 'bg-[#18181B] border-white/5 shadow-2xl' : 'bg-white border-gray-200 shadow-sm',
    header: isDarkMode ? 'bg-[#0A0A0C]' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-[#1A1A1A]',
    muted: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    border: isDarkMode ? 'border-white/5' : 'border-gray-200',
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100',
    accent: '#FF3B30'
  };

  const renderModule = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <header className="space-y-6">
               <div className="flex justify-between items-end">
                 <div>
                   <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Mission Control</h1>
                   <p className={theme.muted + " text-[10px] font-mono tracking-[0.25em] mt-3 uppercase"}>Industrial Industries // Project Status</p>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex flex-col items-end pr-4">
                      <span className="text-[9px] font-black uppercase text-gray-500">Active Work</span>
                      <span className="text-lg font-black tracking-tighter italic">{tasks.filter(t=>!t.completed).length.toString().padStart(2, '0')} Projects</span>
                   </div>
                 </div>
               </div>
             </header>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-min">
                {dashboardLayout.map((widget, index) => (
                  <WidgetWrapper 
                    key={widget.id} 
                    id={widget.id} 
                    colSpan={widget.colSpan} 
                    index={index} 
                    onCycleSize={cycleSize}
                    dragItem={widgetDragItem}
                    dragOverItem={widgetDragOverItem}
                    handleSort={handleWidgetSort}
                  >
                    {widget.id === 'mission' && (
                      <div className="p-8 rounded-3xl bg-white/[0.03] border border-[#FF3B30]/30 border-l-4 border-l-[#FF3B30] relative overflow-hidden group h-full flex flex-col justify-center min-h-[160px]">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                           <ShieldCheck size={48} className="text-[#FF3B30]" />
                         </div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF3B30] mb-3">Our Mission</h3>
                         <p className="text-xl font-bold leading-relaxed tracking-tight text-gray-200 max-w-4xl italic">
                           "We create products that enable and inspire the masses, and we do the unconventional and the unexpected. We are Industrial Industries."
                         </p>
                      </div>
                    )}

                    {widget.id === 'tasks' && (
                      <section className={`${theme.card} p-8 rounded-3xl border flex flex-col h-full min-h-[460px]`}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center justify-between flex-shrink-0">
                          <span className="flex items-center gap-3"><Target size={16} className="text-[#FF3B30]" /> Current Tasks</span>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Drag to Reorder</span>
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                          {tasks.map((t, taskIndex) => (
                            <div 
                              key={t.id} 
                              draggable
                              onDragStart={(e) => {
                                  taskDragItem.current = taskIndex;
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.stopPropagation(); // Prevent grabbing the whole widget
                              }}
                              onDragEnter={(e) => {
                                  taskDragOverItem.current = taskIndex;
                                  e.preventDefault();
                              }}
                              onDragEnd={handleTaskSort}
                              onDragOver={(e) => e.preventDefault()}
                              onClick={() => setSelectedTask(t)} 
                              className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-white opacity-20 group-hover:opacity-100 transition-opacity px-1">
                                   <GripVertical size={14} />
                                </div>

                                <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x)); }} className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${t.completed ? 'bg-[#FF3B30] border-[#FF3B30] shadow-[0_0_12px_#FF3B30]' : 'border-gray-800 hover:border-[#FF3B30]/50'}`}>
                                  {t.completed && <Check size={12} className="text-white font-black" />}
                                </button>

                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[13px] tracking-tight truncate ${t.completed ? 'text-gray-600 line-through' : 'font-bold'}`}>{t.text}</span>
                                  <div className="flex items-center gap-3 mt-1.5">
                                     <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{t.category}</span>
                                     {t.deadline && (
                                       <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                          <Calendar size={9} /> {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                                       </span>
                                     )}
                                     {t.assignee && (
                                       <span className="text-[9px] font-black text-[#FF3B30] uppercase tracking-widest bg-[#FF3B30]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <Cpu size={9} /> {t.assignee}
                                       </span>
                                     )}
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => { e.stopPropagation(); cyclePriority(t.id); }}
                                className={`text-[9px] font-black uppercase px-3 py-1 rounded-md transition-all hover:scale-105 active:scale-95 flex-shrink-0 ml-4 ${
                                  t.priority === 'High' ? 'text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20' : 
                                  t.priority === 'Med' ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' : 
                                  'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                                } tracking-widest`}
                              >
                                {t.priority}
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="pt-5 mt-4 border-t border-white/5 flex-shrink-0">
                          <div className="relative group/input">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-[#FF3B30] transition-colors" size={16} />
                            <input 
                              type="text" 
                              placeholder="Add a new tactical objective..." 
                              className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 outline-none text-xs font-bold tracking-widest focus:border-[#FF3B30]/30 transition-all placeholder:text-gray-700 text-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setTasks([...tasks, { id: Date.now(), text: e.target.value, completed: false, priority: 'Med', description: '', category: 'General', deadline: '', assignee: null }]);
                                    e.target.value = '';
                                    addLog('SYS', 'Manual task added');
                                }
                              }}
                            />
                          </div>
                        </div>
                      </section>
                    )}

                    {widget.id === 'log' && (
                      <section className={`${theme.card} p-8 rounded-3xl border bg-black/40 flex flex-col h-full min-h-[460px]`}>
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <Terminal size={16} className="text-[#FF3B30]" /> Automation Log
                          </h2>
                          <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded uppercase animate-pulse">Live_Sync</span>
                        </div>

                        <div className="mb-6 space-y-3 flex-shrink-0">
                          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Connected Units</p>
                          <div className="flex gap-2 flex-wrap">
                            {agents.map(a => (
                              <div key={a.id} className="px-3 py-1 rounded-lg bg-[#FF3B30]/5 border border-[#FF3B30]/20 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#FF3B30]" />
                                <span className="text-[10px] font-mono font-bold text-gray-300">{a.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 font-mono text-[11px] pr-2">
                          {automationLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 group p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                              <span className="text-gray-600 flex-shrink-0">{log.time}</span>
                              <span className="text-[#FF3B30] font-bold w-14 flex-shrink-0">[{log.agent}]</span>
                              <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{log.action}</span>
                              <div className={`ml-auto w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                log.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_red]' : 
                                log.status === 'sync' ? 'bg-amber-500 shadow-[0_0_8px_orange]' : 
                                'bg-green-500 shadow-[0_0_8px_#22c55e]'
                              }`} />
                            </div>
                          ))}
                          {automationLogs.length === 0 && (
                            <div className="h-full flex items-center justify-center text-gray-700 uppercase tracking-widest text-[10px]">Awaiting_Signal...</div>
                          )}
                        </div>
                      </section>
                    )}

                    {widget.id === 'load' && (
                      <div className={`${theme.card} p-8 rounded-3xl border relative overflow-hidden h-full flex flex-col justify-between min-h-[200px]`}>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8 relative z-10">System Architecture Load</h3>
                        <div className="h-24 flex items-end gap-2 px-2 relative z-10">
                          {[40, 90, 60, 80, 45, 70, 85, 30, 95, 40, 50, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group">
                              <div className="absolute bottom-0 w-full bg-[#FF3B30]/40 rounded-t-sm transition-all group-hover:bg-[#FF3B30]" style={{height: `${h}%`}} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </WidgetWrapper>
                ))}
             </div>
             
             <TaskModal 
                task={selectedTask} 
                isOpen={!!selectedTask} 
                agents={agents}
                onClose={() => setSelectedTask(null)}
                onSave={(updated) => { setTasks(tasks.map(t => t.id === updated.id ? updated : t)); setSelectedTask(null); addLog('SYS', `Task updated: ${updated.text.substring(0, 10)}...`); }}
                onDelete={(id) => { setTasks(tasks.filter(t => t.id !== id)); setSelectedTask(null); addLog('SYS', 'Task deleted', 'error'); }}
                theme={theme}
             />
          </div>
        );

      case 'intelligence':
        return (
          <div className="space-y-10 animate-in fade-in duration-500 h-full">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Intelligence Hub</h1>
                <p className={theme.muted + " text-[10px] font-mono tracking-[0.2em] mt-3 uppercase"}>Global Design Trends // Research Hub</p>
              </div>
              <button 
                onClick={handleRunAnalysis} 
                disabled={isAnalyzing}
                className="flex items-center gap-3 px-8 py-4 bg-[#FF3B30] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isAnalyzing ? 'Researching...' : 'Get Industry Report'}
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                  <section className={`${theme.card} p-8 rounded-[2.5rem] border min-h-[500px] flex flex-col`}>
                     <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                           <FileText size={18} className="text-[#FF3B30]" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Latest Report</span>
                        </div>
                     </div>
                     {intelligenceReport ? (
                        <div className="flex-1 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-[700px] pr-4 custom-scrollbar selection:bg-[#FF3B30] selection:text-white">
                           {intelligenceReport}
                           <SourceMatrix sources={intelligenceSources} theme={theme} />
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-[0.4em]">
                           <Activity size={48} className="mb-6 opacity-10" />
                           Ready for analysis
                        </div>
                     )}
                  </section>
               </div>
               <div className="space-y-6">
                  <div className={`${theme.card} p-6 rounded-3xl border`}>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Signal Breakdown</h3>
                     <div className="space-y-4">
                        {['Materials', 'Technology', 'Visuals', 'Human Factors'].map((label, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase text-gray-600">
                                 <span>{label}</span>
                                 <span>{Math.floor(Math.random() * 40) + 60}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#FF3B30]/40 w-full" style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      
      case 'streetwear-drops':
        return (
          <div className="space-y-10 animate-in fade-in duration-500 h-full">
             <header className="flex justify-between items-end">
               <div>
                 <div className="flex items-center gap-3 text-[#FF3B30] mb-4">
                    <ShoppingBag size={24} className="animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Scout Mode</span>
                 </div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Scout Module</h1>
                 <p className={theme.muted + " text-[10px] font-mono tracking-widest uppercase mt-3"}>Market Discovery // Fashion Drops</p>
               </div>
               <button 
                onClick={handleStreetwearScan} 
                disabled={isScanning}
                className="px-10 py-5 bg-[#FF3B30] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Scan size={18} />}
                 {isScanning ? 'Scouting...' : 'Search for Drops'}
               </button>
             </header>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                   <div className={`${theme.card} p-8 rounded-3xl border h-[400px] flex flex-col bg-black/40`}>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                         <Terminal size={14} /> Agent Log
                      </h3>
                      <div className="flex-1 font-mono text-[11px] space-y-4 overflow-y-auto pr-2 custom-scrollbar text-gray-400">
                         {scanLog.map((log, i) => (
                           <div key={i} className="flex gap-4">
                              <span className="text-[#FF3B30] font-black">»</span>
                              <span>{log}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {streetwearData.map((d, i) => (
                        <div key={i} className={`${theme.card} p-6 rounded-3xl border group hover:border-[#FF3B30]/40 transition-all cursor-pointer`}>
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#FF3B30] border border-white/5 group-hover:scale-110 transition-transform">
                                 <Briefcase size={20} />
                              </div>
                              <span className="text-[10px] font-mono font-black bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-1 rounded border border-[#FF3B30]/20">Score: {d.score}%</span>
                           </div>
                           <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em]">{d.brand}</span>
                           <h3 className="text-xl font-black tracking-tighter uppercase mt-1 italic group-hover:text-[#FF3B30] transition-colors">{d.item}</h3>
                           <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500">
                                 <Calendar size={12} />
                                 {d.date}
                           </div>
                        </div>
                      ))}
                   </div>
                   {scoutReport && (
                      <section className={`${theme.card} p-10 rounded-[2.5rem] border animate-in slide-in-from-top-4 duration-700`}>
                        <div className="flex items-center gap-3 mb-8">
                           <BookOpen size={20} className="text-[#FF3B30]" />
                           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#FF3B30]">Market Digest</h3>
                        </div>
                        <div className="font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap selection:bg-[#FF3B30] selection:text-white">
                           {scoutReport}
                           <SourceMatrix sources={scoutSources} theme={theme} />
                        </div>
                      </section>
                   )}
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center border-4 border-dashed border-white/5 rounded-[3rem] animate-pulse">
            <div className="text-center space-y-8">
              <AlertCircle size={64} className="mx-auto text-gray-800" />
              <p className="font-black text-lg uppercase tracking-[0.5em] text-gray-700">Loading Module</p>
              <button onClick={() => setCurrentPage('dashboard')} className="px-8 py-3 bg-[#FF3B30] text-white rounded-xl text-[11px] font-black uppercase">Home</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full ${theme.bg} ${theme.text} font-sans selection:bg-[#FF3B30]/40 overflow-hidden`}>
      <aside className={`${theme.sidebar} border-r ${theme.border} flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50 shadow-2xl`}>
        <div className="p-8">
          <div className="flex items-start gap-4 mb-10 group cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-[#FF3B30] flex items-center justify-center text-xs font-black text-white shadow-[0_12px_30px_rgba(255,59,48,0.35)] flex-shrink-0 group-hover:scale-110 transition-transform duration-500">II</div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-black tracking-tighter truncate uppercase italic leading-none">Industrial Industries</span>
                <span className="font-mono text-[11px] text-[#FF3B30] font-black tracking-widest mt-2 select-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 px-5 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<Home size={20} />} label="Mission Control" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} collapsed={!sidebarOpen} theme={theme} />
          <NavItem icon={<Radio size={20} />} label="Intelligence Hub" active={currentPage === 'intelligence'} onClick={() => setCurrentPage('intelligence')} collapsed={!sidebarOpen} theme={theme} />
          <NavItem icon={<ShoppingBag size={20} />} label="Scout Module" active={currentPage === 'streetwear-drops'} onClick={() => setCurrentPage('streetwear-drops')} collapsed={!sidebarOpen} theme={theme} />
        </nav>
        <div className="p-8 border-t border-white/5">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-full flex items-center justify-center p-3 rounded-2xl ${theme.hover} transition-all border border-transparent hover:border-white/5`}>
            <SidebarIcon size={20} className="text-gray-500" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`h-16 border-b ${theme.border} ${theme.header} backdrop-blur-3xl flex items-center justify-between px-10 z-40 sticky top-0`}>
          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase text-gray-500 select-none">
            <span className="opacity-30 font-mono">Operations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
            <span className={theme.text + " font-black tracking-[0.1em] text-xs italic"}>{currentPage.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 bg-white/5 px-5 py-2 rounded-full border border-white/5 select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
              <span className="font-mono tracking-tighter uppercase">Link Stable</span>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full ${theme.hover} border ${theme.border} transition-all shadow-sm`} title="Toggle Lighting">
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-16 bg-dot-pattern">
          <div className="max-w-7xl mx-auto h-full">
            {renderModule()}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF3B3022; border-radius: 20px; }
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,59,48,0.1) 1.2px, transparent 1.2px);
          background-size: 44px 44px;
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; font-family: 'Inter', sans-serif; overflow: hidden; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, collapsed, theme }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all relative group ${active ? 'bg-[#FF3B30] text-white shadow-[0_15px_30px_rgba(255,59,48,0.4)] scale-[1.03] -translate-y-[2px]' : `text-gray-500 ${theme.hover} hover:text-white hover:translate-x-1`} ${collapsed && 'justify-center px-0 translate-x-0 hover:translate-x-0'}`}>
    <div className={`transition-transform duration-500 ${active ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>{icon}</div>
    {!collapsed && <span className="text-[12px] font-black tracking-[0.2em] uppercase leading-none">{label}</span>}
    {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />}
  </button>
);

export default App;