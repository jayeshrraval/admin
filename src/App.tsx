import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Briefcase, Plus, Trash2, LogOut, Settings, 
  Phone, Award, User, BookOpen, Calendar, Users, UserPlus, MapPin, X, MessageSquare 
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // --- States for Data ---
  const [jobs, setJobs] = useState<any[]>([]);
  const [achievers, setAchievers] = useState<any[]>([]);
  const [guidance, setGuidance] = useState<any[]>([]);

  // ✅ ટ્રસ્ટ ડેટા માટેના નવા સ્ટેટ્સ
  const [trustEvents, setTrustEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // ✅ નવું ઈવેન્ટ ફોર્મ
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  
  // ✅ Families Data (Single Table Logic)
  const [groupedFamilies, setGroupedFamilies] = useState<any[]>([]); 
  const [selectedFamily, setSelectedFamily] = useState<any | null>(null); // વિગત જોવા માટે

  const [helpline, setHelpline] = useState('');

  // --- Forms ---
  const [jobForm, setJobForm] = useState({
    title: '', department: '', salary: '', description: '', 
    apply_link: '', job_type: 'Government', last_date: ''
  });

  const [achieverForm, setAchieverForm] = useState({
    name: '', achievements: '', photo: '', education_journey: '', struggles: '', advice_for_youth: ''
  });

  const [guidanceForm, setGuidanceForm] = useState({
    title: '', content: '', topic: 'general', display_date: new Date().toISOString().split('T')[0], image_url: ''
  });

  // ✅ New: Family Forms (Single Table)
  const [familyHeadForm, setFamilyHeadForm] = useState({ 
    head_name: '', sub_surname: '', gol: '', village: '', taluko: '', district: '' 
  });
  
  const [memberForm, setMemberForm] = useState({ 
    head_name: '', village: '', // To identify family
    member_name: '', relationship: '', gender: 'Male', age: '', education: '' 
  });

  // --- Login ---
  const handleLogin = () => {
    if (password === 'admin123') setSession(true);
    else alert('ખોટો પાસવર્ડ!');
  };

  // --- Fetch Data ---
  useEffect(() => {
    if (session) {
      fetchJobs();
      fetchAchievers();
      fetchGuidance();
      fetchFamilies(); // ✅ Single Table Fetch
      fetchTrustData();
      fetchSettings();
    }
  }, [session]);

  const fetchJobs = async () => {
    const { data } = await supabase.from('job_alerts').select('*').order('id', { ascending: false });
    setJobs(data || []);
  };

  const fetchAchievers = async () => {
    const { data } = await supabase.from('achievers').select('*').order('created_at', { ascending: false });
    setAchievers(data || []);
  };

  const fetchGuidance = async () => {
    const { data } = await supabase.from('daily_guidance').select('*').order('display_date', { ascending: false });
    setGuidance(data || []);
  };

  // ✅ Fetch Families (Single Table Grouping Logic)
  const fetchFamilies = async () => {
    const { data } = await supabase.from('families').select('*').order('id', { ascending: false });
    if (data) {
      const grouped = data.reduce((acc: any, curr: any) => {
        const key = `${curr.head_name}-${curr.village}`;
        if (!acc[key]) {
          acc[key] = {
            uniqueKey: key,
            head_name: curr.head_name,
            village: curr.village,
            sub_surname: curr.sub_surname,
            district: curr.district,
            members: []
          };
        }
        acc[key].members.push(curr);
        return acc;
      }, {});
      setGroupedFamilies(Object.values(grouped));
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('setting_value').eq('setting_key', 'helpline_number').single();
    if (data) setHelpline(data.setting_value);
  };

  // ✅ Fetch Trust Data
  const fetchTrustData = async () => {
    const { data: evts } = await supabase.from('trust_events').select('*').order('date', { ascending: true });
    setTrustEvents(evts || []);
    const { data: regs } = await supabase.from('trust_registrations').select('*').order('created_at', { ascending: false });
    setRegistrations(regs || []);
    const { data: sugs } = await supabase.from('trust_suggestions').select('*').order('created_at', { ascending: false });
    setSuggestions(sugs || []);
  };

  // --- Logic Functions ---
  const handlePostJob = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: jobError } = await supabase.from('job_alerts').insert([jobForm]);
      if (jobError) throw jobError;
      const notificationMsg = {
        title: `નવી ભરતી: ${jobForm.title}`,
        message: `${jobForm.department} માં ભરતી.`,
        type: 'job',
        created_at: new Date().toISOString()
      };
      await supabase.from('app_notifications').insert([notificationMsg]);
      alert('✅ ભરતી મુકાઈ ગઈ અને નોટિફિકેશન પણ ગયું!');
      setJobForm({ title: '', department: '', salary: '', description: '', apply_link: '', job_type: 'Government', last_date: '' });
      fetchJobs();
      setView('jobs');
    } catch (error: any) { alert(error.message); }
    setLoading(false);
  };

  const handleAddAchiever = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('achievers').insert([achieverForm]);
    if (!error) {
      alert('✅ ગૌરવવંતા વિદ્યાર્થી ઉમેરાઈ ગયા!');
      setAchieverForm({ name: '', achievements: '', photo: '', education_journey: '', struggles: '', advice_for_youth: '' });
      fetchAchievers();
      setView('achievers');
    } else { alert('Error: ' + error.message); }
    setLoading(false);
  };

  const handleAddGuidance = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('daily_guidance').insert([guidanceForm]);
    if (!error) {
      alert('✅ માર્ગદર્શન પોસ્ટ મુકાઈ ગઈ!');
      setGuidanceForm({ title: '', content: '', topic: 'general', display_date: new Date().toISOString().split('T')[0], image_url: '' });
      fetchGuidance();
      setView('guidance');
    } else { alert(error.message); }
    setLoading(false);
  };

  const handleAddFamilyHead = async (e: any) => {
    e.preventDefault(); 
    setLoading(true);
    const newEntry = { ...familyHeadForm, member_name: familyHeadForm.head_name, relationship: 'Self (Head)', gender: 'Male' };
    const { error } = await supabase.from('families').insert([newEntry]);
    if (!error) { 
      alert('✅ નવો પરિવાર ઉમેરાઈ ગયો!'); 
      setFamilyHeadForm({ head_name: '', sub_surname: '', gol: '', village: '', taluko: '', district: '' }); 
      fetchFamilies(); 
      setView('families'); 
    } else { alert(error.message); }
    setLoading(false);
  };

  const handleAddMember = async (e: any) => {
    e.preventDefault(); 
    setLoading(true);
    if (!memberForm.head_name) { alert('Please select a family!'); setLoading(false); return; }
    const existingFamily = groupedFamilies.find(f => f.head_name === memberForm.head_name && f.village === memberForm.village);
    if (!existingFamily) { alert('Family details missing!'); setLoading(false); return; }
    const commonDetails = existingFamily.members[0];
    const newMemberData = {
        head_name: commonDetails.head_name,
        sub_surname: commonDetails.sub_surname,
        gol: commonDetails.gol,
        village: commonDetails.village,
        taluko: commonDetails.taluko,
        district: commonDetails.district,
        member_name: memberForm.member_name,
        relationship: memberForm.relationship,
        gender: memberForm.gender,
    };
    const { error } = await supabase.from('families').insert([newMemberData]);
    if (!error) {
       alert('✅ સભ્ય ઉમેરાઈ ગયા!'); 
       setMemberForm({ ...memberForm, member_name: '', relationship: '', gender: 'Male', age: '', education: '' }); 
       fetchFamilies();
    } else { alert(error.message); }
    setLoading(false);
  };

  // ✅ New: Trust Logic Functions
  const handlePostEvent = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('trust_events').insert([eventForm]);
    if (!error) {
      alert('✅ ટ્રસ્ટ ઈવેન્ટ મુકાઈ ગઈ!');
      setEventForm({ title: '', description: '', date: '', location: '' });
      fetchTrustData();
      setView('trust-events');
    } else { alert(error.message); }
    setLoading(false);
  };

  const handleUpdateRegStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('trust_registrations').update({ status }).eq('id', id);
    if (!error) {
      alert(`✅ Status updated to ${status}`);
      fetchTrustData();
    }
  };

  const handleViewFamily = (family: any) => { setSelectedFamily(family); };

  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('app_settings').upsert({ setting_key: 'helpline_number', setting_value: helpline }, { onConflict: 'setting_key' });
    if (!error) alert('✅ હેલ્પલાઇન નંબર અપડેટ થઈ ગયો!');
    else alert('Error: ' + error.message);
    setLoading(false);
  };

  const handleDelete = async (table: string, id: number) => {
    if(confirm('શું તમે ખરેખર ડિલીટ કરવા માંગો છો?')) {
      await supabase.from(table).delete().eq('id', id);
      if(table === 'job_alerts') fetchJobs();
      if(table === 'achievers') fetchAchievers();
      if(table === 'daily_guidance') fetchGuidance();
      if(table === 'families') fetchFamilies();
      if(table.startsWith('trust')) fetchTrustData();
    }
  };

  // --- 🔒 Login Screen ---
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">યોગી સમાજ સંબંધ</h1>
          <p className="text-gray-500 mb-6">Admin Panel Login</p>
          <input type="password" placeholder="Enter Password" cache-password="off" className="w-full p-3 border rounded-lg mb-4" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-700 text-white p-3 rounded-lg font-bold">Login</button>
        </div>
      </div>
    );
  }

  // --- 🔓 Main Dashboard ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 shrink-0 overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-400 mb-1">યોગી સમાજ સંબંધ</h2>
        <p className="text-xs text-gray-400 mb-8">Admin Panel</p>
        
        <nav className="space-y-1 flex-1">
          <button onClick={() => setView('dashboard')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
            <LayoutDashboard size={20} className="mr-3" /> ડેશબોર્ડ
          </button>
          
          <button onClick={() => setView('families')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'families' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
            <Users size={20} className="mr-3" /> પરિવાર લિસ્ટ
          </button>
          <button onClick={() => setView('add-family')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'add-family' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
            <UserPlus size={20} className="mr-3" /> નવો પરિવાર
          </button>
          <button onClick={() => setView('add-member')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'add-member' ? 'bg-purple-600' : 'hover:bg-white/10'}`}>
            <Plus size={20} className="mr-3" /> સભ્ય ઉમેરો
          </button>

          {/* ✅ New Trust Section Sidebar Buttons */}
          <div className="text-[10px] font-bold text-gray-500 mt-6 mb-2 uppercase px-3 tracking-widest">ટ્રસ્ટ સેક્શન</div>
          <button onClick={() => setView('trust-events')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'trust-events' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><Calendar size={20} className="mr-3" /> ઈવેન્ટ્સ</button>
          <button onClick={() => setView('registrations')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'registrations' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><UserPlus size={20} className="mr-3" /> રજીસ્ટ્રેશન</button>
          <button onClick={() => setView('suggestions')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'suggestions' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><MessageSquare size={20} className="mr-3" /> મંતવ્યો</button>

          <div className="text-[10px] font-bold text-gray-500 mt-6 mb-2 uppercase px-3 tracking-widest">અન્ય</div>
          <button onClick={() => setView('jobs')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'jobs' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
            <Briefcase size={20} className="mr-3" /> નોકરી
          </button>
          <button onClick={() => setView('achievers')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'achievers' ? 'bg-amber-600' : 'hover:bg-white/10'}`}>
            <Award size={20} className="mr-3" /> સમાજ ગૌરવ
          </button>
          <button onClick={() => setView('guidance')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'guidance' ? 'bg-green-600' : 'hover:bg-white/10'}`}>
            <BookOpen size={20} className="mr-3" /> રોજિંદુ માર્ગદર્શન
          </button>
          
          <button onClick={() => setView('settings')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'settings' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
            <Settings size={20} className="mr-3" /> સેટિંગ્સ
          </button>
        </nav>
        <button onClick={() => setSession(false)} className="flex items-center text-red-400 hover:text-red-300 mt-auto p-2"><LogOut size={20} className="mr-2" /> Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {view === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">સ્વાગત છે, એડમિન! 👋</h1>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500"><p className="text-gray-500">Jobs</p><h3 className="text-3xl font-bold">{jobs.length}</h3></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500"><p className="text-gray-500">Achievers</p><h3 className="text-3xl font-bold">{achievers.length}</h3></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500"><p className="text-gray-500">Families</p><h3 className="text-3xl font-bold">{groupedFamilies.length}</h3></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500"><p className="text-gray-500">Trust Events</p><h3 className="text-3xl font-bold">{trustEvents.length}</h3></div>
            </div>
          </div>
        )}

        {/* ✅ New Trust Section Views */}
        {view === 'trust-events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="text-emerald-600"/> ટ્રસ્ટ કાર્યક્રમો</h1>
              <button onClick={() => setView('add-event')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1" /> New Event</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trustEvents.map(e => (
                <div key={e.id} className="bg-white p-4 rounded-xl shadow border flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()} • {e.location}</p>
                    <p className="text-xs bg-gray-100 px-2 py-1 rounded w-fit mt-2">Attendees: {e.attendees_count}</p>
                  </div>
                  <button onClick={() => handleDelete('trust_events', e.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-event' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-emerald-600">
            <h2 className="text-xl font-bold mb-6">નવો કાર્યક્રમ ઉમેરો</h2>
            <form onSubmit={handlePostEvent} className="space-y-4">
              <input required placeholder="Event Title" className="w-full p-3 border rounded-lg" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
              <textarea placeholder="Description" className="w-full p-3 border rounded-lg h-32" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
              <input required type="datetime-local" className="w-full p-3 border rounded-lg" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
              <input placeholder="Location" className="w-full p-3 border rounded-lg" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
              <button disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold">Post Event</button>
            </form>
          </div>
        )}

        {view === 'registrations' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">રજીસ્ટ્રેશન લિસ્ટ</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4">Name</th><th className="p-4">Event</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id} className="border-b">
                      <td className="p-4 font-bold">{reg.full_name}<br/><span className="text-xs text-gray-500">{reg.mobile}</span></td>
                      <td className="p-4">{reg.event_type}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{reg.status}</span></td>
                      <td className="p-4"><button onClick={() => handleUpdateRegStatus(reg.id, 'Approved')} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><CustomCheckCircle size={20}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'suggestions' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">યુવાનોના મંતવ્ય</h1>
            <div className="space-y-4">
              {suggestions.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500 flex justify-between items-center">
                  <p className="text-gray-800 italic">"{s.message}"</p>
                  <button onClick={() => handleDelete('trust_suggestions', s.id)} className="text-red-300 hover:text-red-500"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FAMILIES VIEW --- */}
        {view === 'families' && (
          <div className="flex gap-6 h-full">
            <div className={`${selectedFamily ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="text-purple-600"/> પરિવાર લિસ્ટ</h1>
                <button onClick={() => setView('add-family')} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1" /> New Family</button>
              </div>
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr><th className="p-4">Head Name</th><th className="p-4">Village</th><th className="p-4 text-center">Members</th></tr>
                  </thead>
                  <tbody>
                    {groupedFamilies.map((fam, idx) => (
                      <tr key={idx} onClick={() => handleViewFamily(fam)} className={`border-b cursor-pointer hover:bg-purple-50 ${selectedFamily?.uniqueKey === fam.uniqueKey ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}>
                        <td className="p-4 font-bold">{fam.head_name}</td>
                        <td className="p-4 text-gray-600"><span className="flex items-center gap-1"><MapPin size={14}/> {fam.village}</span></td>
                        <td className="p-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{fam.members.length}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedFamily && (
              <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[80vh]">
                <div className="p-4 border-b bg-purple-50 flex justify-between items-center rounded-t-xl">
                  <div>
                    <h2 className="font-bold text-lg text-purple-900">{selectedFamily.head_name} ના સભ્યો</h2>
                    <p className="text-xs text-purple-600">{selectedFamily.village}</p>
                  </div>
                  <button onClick={() => setSelectedFamily(null)}><X className="text-purple-400 hover:text-red-500"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {selectedFamily.members.map((mem: any) => (
                    <div key={mem.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div><p className="font-bold">{mem.member_name}</p><p className="text-xs text-gray-500">{mem.relationship}</p></div>
                      <button onClick={() => handleDelete('families', mem.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FORM VIEWS --- */}
        {view === 'add-family' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-purple-600">
            <h2 className="text-xl font-bold mb-6">નવો પરિવાર ઉમેરો</h2>
            <form onSubmit={handleAddFamilyHead} className="space-y-4">
              <input required placeholder="Head Name" className="w-full p-3 border rounded-lg" value={familyHeadForm.head_name} onChange={e => setFamilyHeadForm({...familyHeadForm, head_name: e.target.value})} />
              <input required placeholder="Sub Surname" className="w-full p-3 border rounded-lg" value={familyHeadForm.sub_surname} onChange={e => setFamilyHeadForm({...familyHeadForm, sub_surname: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Village" className="p-3 border rounded-lg" value={familyHeadForm.village} onChange={e => setFamilyHeadForm({...familyHeadForm, village: e.target.value})} />
                <input placeholder="Gol" className="p-3 border rounded-lg" value={familyHeadForm.gol} onChange={e => setFamilyHeadForm({...familyHeadForm, gol: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Taluko" className="p-3 border rounded-lg" value={familyHeadForm.taluko} onChange={e => setFamilyHeadForm({...familyHeadForm, taluko: e.target.value})} />
                <input placeholder="District" className="p-3 border rounded-lg" value={familyHeadForm.district} onChange={e => setFamilyHeadForm({...familyHeadForm, district: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold">Save Family</button>
            </form>
          </div>
        )}

        {view === 'add-member' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-purple-600">
            <h2 className="text-xl font-bold mb-6">સભ્યો ઉમેરો</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <select required className="w-full p-3 border rounded-lg bg-white" onChange={e => { const [h, v] = e.target.value.split('|'); setMemberForm({...memberForm, head_name: h, village: v}); }}>
                <option value="">-- Select Family --</option>
                {groupedFamilies.map((f, i) => <option key={i} value={`${f.head_name}|${f.village}`}>{f.head_name} - {f.village}</option>)}
              </select>
              <input required placeholder="Member Name" className="w-full p-3 border rounded-lg" value={memberForm.member_name} onChange={e => setMemberForm({...memberForm, member_name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Relation" className="p-3 border rounded-lg" value={memberForm.relationship} onChange={e => setMemberForm({...memberForm, relationship: e.target.value})} />
                <select className="p-3 border rounded-lg" value={memberForm.gender} onChange={e => setMemberForm({...memberForm, gender: e.target.value})}><option>Male</option><option>Female</option></select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input placeholder="Age" className="p-3 border rounded-lg" value={memberForm.age} onChange={e => setMemberForm({...memberForm, age: e.target.value})} />
                 <input placeholder="Education" className="p-3 border rounded-lg" value={memberForm.education} onChange={e => setMemberForm({...memberForm, education: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold">Add Member</button>
            </form>
          </div>
        )}

        {view === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Jobs</h1>
              <button onClick={() => setView('add-job')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1" /> Add Job</button>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
               {jobs.map(job => (
                 <div key={job.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
                   <div>
                     <h3 className="font-bold">{job.title}</h3>
                     <p className="text-sm text-gray-500">{job.department} • {job.salary} • {job.job_type}</p>
                   </div>
                   <button onClick={() => handleDelete('job_alerts', job.id)} className="text-red-500"><Trash2 size={18} /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {view === 'add-job' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-6">નવી ભરતી ઉમેરો</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <input required placeholder="ભરતીનું નામ" className="w-full p-3 border rounded-lg" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
              <input required placeholder="વિભાગ" className="w-full p-3 border rounded-lg" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="પગાર" className="p-3 border rounded-lg" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                <select className="p-3 border rounded-lg" value={jobForm.job_type} onChange={e => setJobForm({...jobForm, job_type: e.target.value})}><option>Government</option><option>Private</option></select>
              </div>
              <input type="date" className="w-full p-3 border rounded-lg" value={jobForm.last_date} onChange={e => setJobForm({...jobForm, last_date: e.target.value})} />
              <input required placeholder="Apply Link" className="w-full p-3 border rounded-lg" value={jobForm.apply_link} onChange={e => setJobForm({...jobForm, apply_link: e.target.value})} />
              <textarea placeholder="વિગત..." className="w-full p-3 border rounded-lg h-32" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold">Post Job</button>
            </form>
          </div>
        )}

        {view === 'achievers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="text-amber-500"/> Achievers</h1>
              <button onClick={() => setView('add-achiever')} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1" /> Add</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {achievers.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow flex gap-4 relative group">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">{item.photo ? <img src={item.photo} className="w-full h-full object-cover"/> : <User className="m-auto mt-4"/>}</div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <span className="text-xs bg-amber-100 px-2 py-1 rounded-full">{item.achievements}</span>
                  </div>
                  <button onClick={() => handleDelete('achievers', item.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-achiever' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-amber-500">
            <h2 className="text-xl font-bold mb-6">Add Achiever</h2>
            <form onSubmit={handleAddAchiever} className="space-y-4">
              <input required placeholder="Name" className="w-full p-3 border rounded-lg" value={achieverForm.name} onChange={e => setAchieverForm({...achieverForm, name: e.target.value})} />
              <input required placeholder="Achievement" className="w-full p-3 border rounded-lg" value={achieverForm.achievements} onChange={e => setAchieverForm({...achieverForm, achievements: e.target.value})} />
              <input placeholder="Photo URL" className="w-full p-3 border rounded-lg" value={achieverForm.photo} onChange={e => setAchieverForm({...achieverForm, photo: e.target.value})} />
              <textarea placeholder="Education Journey" className="w-full p-3 border rounded-lg" value={achieverForm.education_journey} onChange={e => setAchieverForm({...achieverForm, education_journey: e.target.value})} />
              <textarea placeholder="Struggles" className="w-full p-3 border rounded-lg" value={achieverForm.struggles} onChange={e => setAchieverForm({...achieverForm, struggles: e.target.value})} />
              <textarea placeholder="Advice" className="w-full p-3 border rounded-lg" value={achieverForm.advice_for_youth} onChange={e => setAchieverForm({...achieverForm, advice_for_youth: e.target.value})} />
              <button className="w-full bg-amber-600 text-white p-3 rounded-lg font-bold">Add to Hall of Fame</button>
            </form>
          </div>
        )}

        {view === 'guidance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-green-600"/> રોજિંદુ માર્ગદર્શન</h1>
              <button onClick={() => setView('add-guidance')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus size={18} className="mr-1" /> Add Post</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {guidance.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.topic} • {item.display_date}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.content}</p>
                  </div>
                  <button onClick={() => handleDelete('daily_guidance', item.id)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-guidance' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-6">નવી માર્ગદર્શન પોસ્ટ</h2>
            <form onSubmit={handleAddGuidance} className="space-y-4">
              <input required placeholder="Title" className="w-full p-3 border rounded-lg" value={guidanceForm.title} onChange={e => setGuidanceForm({...guidanceForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <select className="p-3 border rounded-lg" value={guidanceForm.topic} onChange={e => setGuidanceForm({...guidanceForm, topic: e.target.value})}><option value="general">General</option><option value="career">Career</option><option value="skills">Skills</option></select>
                 <input type="date" className="p-3 border rounded-lg" value={guidanceForm.display_date} onChange={e => setGuidanceForm({...guidanceForm, display_date: e.target.value})} />
              </div>
              <textarea required placeholder="Content" className="w-full p-3 border rounded-lg h-40" value={guidanceForm.content} onChange={e => setGuidanceForm({...guidanceForm, content: e.target.value})} />
              <input placeholder="Image URL" className="w-full p-3 border rounded-lg" value={guidanceForm.image_url} onChange={e => setGuidanceForm({...guidanceForm, image_url: e.target.value})} />
              <button disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">Publish Post</button>
            </form>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings className="text-blue-600" /> Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Number</label>
              <input type="text" value={helpline} onChange={(e) => setHelpline(e.target.value)} className="w-full p-3 border rounded-lg" />
            </div>
            <button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Save Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Custom CheckCircle Component to Avoid Naming Collision
function CustomCheckCircle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}