import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Briefcase, Plus, Trash2, LogOut, Settings, 
  Phone, Award, User, BookOpen, Calendar, Users, UserPlus, MapPin, X, MessageSquare, ExternalLink, CheckCircle, Heart, Send, Shield, Save, 
  Megaphone, UserCheck, Search, Bell, Menu, ChevronRight 
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // UI State

  // --- States for Data (Logic Unchanged) ---
  const [jobs, setJobs] = useState([]);
  const [achievers, setAchievers] = useState([]);
  const [guidance, setGuidance] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [trustEvents, setTrustEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const [fundStats, setFundStats] = useState({
    id: '', total_fund: '', total_donors: '', upcoming_events: ''
  });
  
  const [matrimonyProfiles, setMatrimonyProfiles] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  const [groupedFamilies, setGroupedFamilies] = useState([]); 
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [helpline, setHelpline] = useState('');

  // --- Forms (Logic Unchanged) ---
  const [jobForm, setJobForm] = useState({
    title: '', department: '', salary: '', description: '', apply_link: '', job_type: 'Government', last_date: ''
  });

  const [achieverForm, setAchieverForm] = useState({
    name: '', achievements: '', photo: '', education_journey: '', struggles: '', advice_for_youth: ''
  });

  const [guidanceForm, setGuidanceForm] = useState({
    title: '', content: '', topic: 'general', display_date: new Date().toISOString().split('T')[0], image_url: ''
  });

  const [familyHeadForm, setFamilyHeadForm] = useState({ 
    head_name: '', mobile_number: '', sub_surname: '', gol: '', village: '', taluko: '', district: '' 
  });
  
  const [memberForm, setMemberForm] = useState({ 
    head_name: '', village: '', member_name: '', relationship: '', gender: 'Male', age: '', education: '', member_mobile: '' 
  });

  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });

  // --- Login Logic ---
  const handleLogin = () => {
    if (password === 'admin123') setSession(true);
    else alert('ખોટો પાસવર્ડ!');
  };

  // --- Fetch Data Effects (Logic Unchanged) ---
  useEffect(() => {
    if (session) {
      fetchJobs();
      fetchAchievers();
      fetchGuidance();
      fetchFamilies();
      fetchTrustData();
      fetchSettings();
      fetchMatrimonyData();
      fetchFundStats();
      fetchAppUsers();
    }
  }, [session]);

  const fetchAppUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setAppUsers(data || []);
  };

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

  const fetchFamilies = async () => {
    const { data } = await supabase.from('families').select('*').order('id', { ascending: false });
    if (data) {
      const grouped = data.reduce((acc, curr) => {
        const key = `${curr.head_name}-${curr.village}`;
        if (!acc[key]) {
          acc[key] = {
            uniqueKey: key, head_name: curr.head_name, mobile_number: curr.mobile_number, 
            village: curr.village, sub_surname: curr.sub_surname, district: curr.district, members: []
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

  const fetchTrustData = async () => {
    const { data: evts } = await supabase.from('trust_events').select('*').order('date', { ascending: true });
    setTrustEvents(evts || []);
    const { data: regs } = await supabase.from('trust_registrations').select('*').order('created_at', { ascending: false });
    setRegistrations(regs || []);
    const { data: sugs } = await supabase.from('trust_suggestions').select('*').order('created_at', { ascending: false });
    setSuggestions(sugs || []);
  };

  const fetchMatrimonyData = async () => {
    const { data: profiles } = await supabase.from('matrimony_profiles').select('*').order('created_at', { ascending: false });
    setMatrimonyProfiles(profiles || []);
    const { data: reqs } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    setAllRequests(reqs || []);
  };

  const fetchFundStats = async () => {
    const { data } = await supabase.from('fund_stats').select('*').single();
    if (data) {
      setFundStats({
        id: data.id, total_fund: data.total_fund, total_donors: data.total_donors, upcoming_events: data.upcoming_events
      });
    }
  };

  // --- Action Handlers (Logic Unchanged) ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: jobError } = await supabase.from('job_alerts').insert([jobForm]);
      if (jobError) throw jobError;
      const notificationMsg = { title: `નવી ભરતી: ${jobForm.title}`, message: `${jobForm.department} માં ભરતી.`, type: 'job', is_active: true };
      await supabase.from('notifications').insert([notificationMsg]);
      alert('✅ ભરતી મુકાઈ ગઈ અને નોટિફિકેશન પણ ગયું!');
      setJobForm({ title: '', department: '', salary: '', description: '', apply_link: '', job_type: 'Government', last_date: '' });
      fetchJobs();
      setView('jobs');
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  const handleAddAchiever = async (e) => {
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

  const handleAddGuidance = async (e) => {
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

  const handleAddFamilyHead = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    const newEntry = { ...familyHeadForm, member_name: familyHeadForm.head_name, relationship: 'Self (Head)', gender: 'Male', mobile_number: familyHeadForm.mobile_number };
    const { error } = await supabase.from('families').insert([newEntry]);
    if (!error) { 
      alert('✅ નવો પરિવાર ઉમેરાઈ ગયો!'); 
      setFamilyHeadForm({ head_name: '', mobile_number: '', sub_surname: '', gol: '', village: '', taluko: '', district: '' }); 
      fetchFamilies(); 
      setView('families'); 
    } else { alert(error.message); }
    setLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    if (!memberForm.head_name) { alert('Please select a family!'); setLoading(false); return; }
    const existingFamily = groupedFamilies.find(f => f.head_name === memberForm.head_name && f.village === memberForm.village);
    if (!existingFamily) { alert('Family details missing!'); setLoading(false); return; }
    const commonDetails = existingFamily.members[0];
    const newMemberData = {
        head_name: commonDetails.head_name, mobile_number: commonDetails.mobile_number, sub_surname: commonDetails.sub_surname,
        gol: commonDetails.gol, village: commonDetails.village, taluko: commonDetails.taluko, district: commonDetails.district,
        member_name: memberForm.member_name, relationship: memberForm.relationship, gender: memberForm.gender, member_mobile: memberForm.member_mobile 
    };
    const { error } = await supabase.from('families').insert([newMemberData]);
    if (!error) {
       alert('✅ સભ્ય ઉમેરાઈ ગયા!'); 
       setMemberForm({ ...memberForm, member_name: '', relationship: '', gender: 'Male', age: '', education: '', member_mobile: '' }); 
       fetchFamilies();
    } else { alert(error.message); }
    setLoading(false);
  };

  const handlePostEvent = async (e) => {
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

  const handleUpdateFundStats = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!fundStats.id) { alert('Error: No record ID found. Please refresh page.'); return; }
      const { error } = await supabase.from('fund_stats').update({
        total_fund: fundStats.total_fund, total_donors: fundStats.total_donors, upcoming_events: fundStats.upcoming_events
      }).eq('id', fundStats.id); 
      if (error) throw error;
      alert('✅ ફંડ સ્ટેટસ અપડેટ થઈ ગયું!');
    } catch (error) { alert('Error: ' + error.message); } 
    finally { setLoading(false); }
  };

  const handleUpdateRegStatus = async (id, status) => {
    const { error } = await supabase.from('trust_registrations').update({ status }).eq('id', id);
    if (!error) { alert(`✅ Status updated to ${status}`); fetchTrustData(); }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('notifications').insert([{
        title: noticeForm.title, message: noticeForm.message, type: 'admin', is_active: true
      }]);
      if (error) throw error;
      alert('✅ નોટિસ મોકલાઈ ગઈ! બધા યુઝરને દેખાશે.');
      setNoticeForm({ title: '', message: '' });
    } catch (error) { alert('Error: ' + error.message); } 
    finally { setLoading(false); }
  };

  const handleViewFamily = (family) => { setSelectedFamily(family); };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('app_settings').upsert({ setting_key: 'helpline_number', setting_value: helpline }, { onConflict: 'setting_key' });
    if (!error) alert('✅ હેલ્પલાઇન નંબર અપડેટ થઈ ગયો!');
    else alert('Error: ' + error.message);
    setLoading(false);
  };

  const handleDelete = async (table, id) => {
    if(confirm('શું તમે ખરેખર ડિલીટ કરવા માંગો છો?')) {
      await supabase.from(table).delete().eq('id', id);
      if(table === 'job_alerts') fetchJobs();
      if(table === 'achievers') fetchAchievers();
      if(table === 'daily_guidance') fetchGuidance();
      if(table === 'families') fetchFamilies();
      if(table === 'matrimony_profiles') fetchMatrimonyData();
      if(table === 'requests') fetchMatrimonyData();
      if(table === 'users') fetchAppUsers(); 
      if(table.startsWith('trust')) fetchTrustData();
    }
  };

  // --- LOGIN SCREEN (PREMIUM DESIGN) ---
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-black font-sans">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-96 border border-white/20 text-center relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-purple-500 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">યોગી સમાજ સંબંધ</h1>
            <p className="text-blue-200 mb-8 text-sm uppercase tracking-widest">Admin Access</p>
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-xl font-bold shadow-lg transform hover:scale-[1.02] transition-all"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD (PREMIUM GLASSMORPHISM DESIGN) ---
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans">
      
      {/* 1. PREMIUM SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#111827] text-white transition-all duration-300 ease-in-out shadow-2xl flex flex-col z-50`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-800/50">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              યોગી સમાજ Admin
            </h1>
          ) : (
            <span className="text-2xl font-bold text-blue-500">Y</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Megaphone />} text="Notice Board" active={view === 'notice-board'} onClick={() => setView('notice-board')} isOpen={isSidebarOpen} color="text-orange-400" />
          <SidebarItem icon={<UserCheck />} text="App Users" active={view === 'app-users'} onClick={() => setView('app-users')} isOpen={isSidebarOpen} color="text-teal-400" />
          
          <SectionLabel isOpen={isSidebarOpen}>Families</SectionLabel>
          <SidebarItem icon={<Users />} text="Family List" active={view === 'families'} onClick={() => setView('families')} isOpen={isSidebarOpen} color="text-purple-400" />
          <SidebarItem icon={<UserPlus />} text="Add Family" active={view === 'add-family'} onClick={() => setView('add-family')} isOpen={isSidebarOpen} color="text-purple-400" />
          <SidebarItem icon={<Plus />} text="Add Member" active={view === 'add-member'} onClick={() => setView('add-member')} isOpen={isSidebarOpen} color="text-purple-400" />

          <SectionLabel isOpen={isSidebarOpen}>Matrimony</SectionLabel>
          <SidebarItem icon={<Heart />} text="Profiles" active={view === 'matrimony'} onClick={() => setView('matrimony')} isOpen={isSidebarOpen} color="text-pink-400" />
          <SidebarItem icon={<Send />} text="Requests" active={view === 'all-requests'} onClick={() => setView('all-requests')} isOpen={isSidebarOpen} color="text-pink-400" />

          <SectionLabel isOpen={isSidebarOpen}>Trust</SectionLabel>
          <SidebarItem icon={<Calendar />} text="Events" active={view === 'trust-events'} onClick={() => setView('trust-events')} isOpen={isSidebarOpen} color="text-emerald-400" />
          <SidebarItem icon={<UserPlus />} text="Registrations" active={view === 'registrations'} onClick={() => setView('registrations')} isOpen={isSidebarOpen} color="text-emerald-400" />
          <SidebarItem icon={<MessageSquare />} text="Suggestions" active={view === 'suggestions'} onClick={() => setView('suggestions')} isOpen={isSidebarOpen} color="text-emerald-400" />
          <SidebarItem icon={<Shield />} text="Fund Manager" active={view === 'fund-manager'} onClick={() => setView('fund-manager')} isOpen={isSidebarOpen} color="text-emerald-400" />

          <SectionLabel isOpen={isSidebarOpen}>Others</SectionLabel>
          <SidebarItem icon={<Briefcase />} text="Jobs" active={view === 'jobs'} onClick={() => setView('jobs')} isOpen={isSidebarOpen} color="text-blue-400" />
          <SidebarItem icon={<Award />} text="Achievers" active={view === 'achievers'} onClick={() => setView('achievers')} isOpen={isSidebarOpen} color="text-amber-400" />
          <SidebarItem icon={<BookOpen />} text="Guidance" active={view === 'guidance'} onClick={() => setView('guidance')} isOpen={isSidebarOpen} color="text-green-400" />
          <SidebarItem icon={<Settings />} text="Settings" active={view === 'settings'} onClick={() => setView('settings')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => setSession(false)} className="flex items-center w-full p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header with Glassmorphism */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 capitalize">{view.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={22} className="text-gray-500" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                <img src="https://ui-avatars.com/api/?name=Admin&background=random" className="rounded-full w-full h-full border-2 border-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* --- DASHBOARD WIDGETS --- */}
          {view === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="App Users" value={appUsers.length} icon={<UserCheck />} color="teal" />
                <StatCard title="Jobs Posted" value={jobs.length} icon={<Briefcase />} color="blue" />
                <StatCard title="Achievers" value={achievers.length} icon={<Award />} color="amber" />
                <StatCard title="Families" value={groupedFamilies.length} icon={<Users />} color="purple" />
                <StatCard title="Events" value={trustEvents.length} icon={<Calendar />} color="emerald" />
                <StatCard title="Matrimony" value={matrimonyProfiles.length} icon={<Heart />} color="pink" />
                <StatCard title="Requests" value={allRequests.length} icon={<Send />} color="rose" />
              </div>
            </div>
          )}

          {/* --- APP USERS VIEW --- */}
          {view === 'app-users' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><UserCheck className="text-teal-600"/> Registered Users</h2>
                 <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">{appUsers.length} Users</span>
               </div>
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="p-4 font-semibold">User Profile</th>
                     <th className="p-4 font-semibold">Mobile</th>
                     <th className="p-4 font-semibold">Joined Date</th>
                     <th className="p-4 font-semibold text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {appUsers.map((user) => (
                     <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                       <td className="p-4 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                           {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <User className="text-gray-400"/>}
                         </div>
                         <span className="font-semibold text-gray-700">{user.full_name || 'No Name'}</span>
                       </td>
                       <td className="p-4 font-mono text-blue-600 text-sm">{user.mobile_number || '-'}</td>
                       <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                       <td className="p-4 text-right">
                         <button onClick={() => handleDelete('users', user.id)} className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18}/></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* --- NOTICE BOARD --- */}
          {view === 'notice-board' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden animate-fade-in">
              <div className="bg-orange-50 p-6 border-b border-orange-100">
                <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2"><Megaphone /> Broadcast Notice</h2>
                <p className="text-orange-600 text-sm mt-1">This message will be sent to all app users immediately.</p>
              </div>
              <form onSubmit={handleSendNotice} className="p-8 space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notice Title</label>
                    <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                      value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} placeholder="e.g. Important Announcement" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-40 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                      value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} placeholder="Type your message here..." />
                 </div>
                 <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex justify-center items-center gap-2">
                    {loading ? 'Sending...' : <><Send size={18}/> Send Broadcast Notice</>}
                 </button>
              </form>
            </div>
          )}

          {/* --- MATRIMONY VIEW --- */}
          {view === 'matrimony' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {matrimonyProfiles.map(p => (
                   <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                      <div className="h-24 bg-gradient-to-r from-pink-500 to-rose-400 relative">
                         <button onClick={() => handleDelete('matrimony_profiles', p.id)} className="absolute top-3 right-3 bg-white/20 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur-sm transition-all"><Trash2 size={16}/></button>
                      </div>
                      <div className="px-6 pb-6 relative">
                         <img src={p.image_url || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-2xl object-cover border-4 border-white absolute -top-10 shadow-md" />
                         <div className="mt-12">
                            <h3 className="text-lg font-bold text-gray-800">{p.full_name}</h3>
                            <p className="text-pink-600 text-xs font-bold uppercase tracking-wider mb-2">{p.marital_status} • {p.age} Yrs</p>
                            <div className="text-sm text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl">
                               <p>📍 {p.village}, {p.district}</p>
                               <p>🛡 {p.peta_atak} ({p.gol})</p>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* --- GENERIC FORM WRAPPER (For all 'Add' views) --- */}
          {(view.startsWith('add-') || view === 'fund-manager' || view === 'settings') && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
               <div className={`p-6 border-b border-gray-100 ${
                 view.includes('job') ? 'bg-blue-50' : 
                 view.includes('achiever') ? 'bg-amber-50' : 
                 view.includes('guidance') ? 'bg-green-50' : 
                 view.includes('trust') || view.includes('fund') ? 'bg-emerald-50' : 
                 'bg-purple-50'
               }`}>
                  <h2 className="text-xl font-bold text-gray-800 capitalize">{view.replace('-', ' ')} Form</h2>
               </div>
               <div className="p-8">
                  {/* Reuse existing form logic here */}
                  {view === 'add-job' && (
                    <form onSubmit={handlePostJob} className="space-y-4">
                      <input required placeholder="Job Title" className="form-input" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                      <input required placeholder="Department" className="form-input" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Salary" className="form-input" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                        <select className="form-input" value={jobForm.job_type} onChange={e => setJobForm({...jobForm, job_type: e.target.value})}><option>Government</option><option>Private</option></select>
                      </div>
                      <input type="date" className="form-input" value={jobForm.last_date} onChange={e => setJobForm({...jobForm, last_date: e.target.value})} />
                      <input required placeholder="Apply Link" className="form-input" value={jobForm.apply_link} onChange={e => setJobForm({...jobForm, apply_link: e.target.value})} />
                      <textarea placeholder="Description..." className="form-input h-32" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                      <button disabled={loading} type="submit" className="form-btn bg-blue-600">Post Job</button>
                    </form>
                  )}
                  {view === 'add-family' && (
                    <form onSubmit={handleAddFamilyHead} className="space-y-4">
                       <input required placeholder="Head Name" className="form-input" value={familyHeadForm.head_name} onChange={e => setFamilyHeadForm({...familyHeadForm, head_name: e.target.value})} />
                       <input required placeholder="Mobile Number" className="form-input" value={familyHeadForm.mobile_number} onChange={e => setFamilyHeadForm({...familyHeadForm, mobile_number: e.target.value})} />
                       <input required placeholder="Sub Surname" className="form-input" value={familyHeadForm.sub_surname} onChange={e => setFamilyHeadForm({...familyHeadForm, sub_surname: e.target.value})} />
                       <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Village" className="form-input" value={familyHeadForm.village} onChange={e => setFamilyHeadForm({...familyHeadForm, village: e.target.value})} />
                          <input placeholder="Gol" className="form-input" value={familyHeadForm.gol} onChange={e => setFamilyHeadForm({...familyHeadForm, gol: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Taluko" className="form-input" value={familyHeadForm.taluko} onChange={e => setFamilyHeadForm({...familyHeadForm, taluko: e.target.value})} />
                          <input placeholder="District" className="form-input" value={familyHeadForm.district} onChange={e => setFamilyHeadForm({...familyHeadForm, district: e.target.value})} />
                       </div>
                       <button disabled={loading} className="form-btn bg-purple-600">Save Family</button>
                    </form>
                  )}
                  {view === 'add-member' && (
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <select required className="form-input bg-white" onChange={e => { const [h, v] = e.target.value.split('|'); setMemberForm({...memberForm, head_name: h, village: v}); }}>
                        <option value="">-- Select Family --</option>
                        {groupedFamilies.map((f, i) => <option key={i} value={`${f.head_name}|${f.village}`}>{f.head_name} - {f.village}</option>)}
                      </select>
                      <input required placeholder="Member Name" className="form-input" value={memberForm.member_name} onChange={e => setMemberForm({...memberForm, member_name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                         <input placeholder="Relation" className="form-input" value={memberForm.relationship} onChange={e => setMemberForm({...memberForm, relationship: e.target.value})} />
                         <select className="form-input" value={memberForm.gender} onChange={e => setMemberForm({...memberForm, gender: e.target.value})}><option>Male</option><option>Female</option></select>
                      </div>
                      <button disabled={loading} className="form-btn bg-purple-600">Add Member</button>
                    </form>
                  )}
                  {view === 'fund-manager' && (
                     <form onSubmit={handleUpdateFundStats} className="space-y-4">
                        <label className="text-sm font-bold text-gray-500">Total Fund</label>
                        <input className="form-input" value={fundStats.total_fund} onChange={e => setFundStats({...fundStats, total_fund: e.target.value})} />
                        <label className="text-sm font-bold text-gray-500">Total Donors</label>
                        <input className="form-input" value={fundStats.total_donors} onChange={e => setFundStats({...fundStats, total_donors: e.target.value})} />
                        <label className="text-sm font-bold text-gray-500">Upcoming Events</label>
                        <input className="form-input" value={fundStats.upcoming_events} onChange={e => setFundStats({...fundStats, upcoming_events: e.target.value})} />
                        <button disabled={loading} className="form-btn bg-emerald-600">Update Stats</button>
                     </form>
                  )}
                  {/* Keep adding other forms similarly if needed, or rely on original structure for less critical ones */}
                  {view === 'settings' && (
                     <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-500">Helpline Number</label>
                        <input className="form-input" value={helpline} onChange={e => setHelpline(e.target.value)} />
                        <button onClick={handleSaveSettings} className="form-btn bg-blue-600">Save Settings</button>
                     </div>
                  )}
                  {view === 'add-achiever' && (
                     <form onSubmit={handleAddAchiever} className="space-y-4">
                        <input className="form-input" placeholder="Name" value={achieverForm.name} onChange={e => setAchieverForm({...achieverForm, name: e.target.value})} />
                        <input className="form-input" placeholder="Achievement" value={achieverForm.achievements} onChange={e => setAchieverForm({...achieverForm, achievements: e.target.value})} />
                        <input className="form-input" placeholder="Photo URL" value={achieverForm.photo} onChange={e => setAchieverForm({...achieverForm, photo: e.target.value})} />
                        <button className="form-btn bg-amber-600">Save</button>
                     </form>
                  )}
                  {view === 'add-guidance' && (
                     <form onSubmit={handleAddGuidance} className="space-y-4">
                        <input className="form-input" placeholder="Title" value={guidanceForm.title} onChange={e => setGuidanceForm({...guidanceForm, title: e.target.value})} />
                        <textarea className="form-input h-32" placeholder="Content" value={guidanceForm.content} onChange={e => setGuidanceForm({...guidanceForm, content: e.target.value})} />
                        <button className="form-btn bg-green-600">Publish</button>
                     </form>
                  )}
                  {view === 'add-event' && (
                    <form onSubmit={handlePostEvent} className="space-y-4">
                       <input className="form-input" placeholder="Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                       <input className="form-input" type="datetime-local" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                       <input className="form-input" placeholder="Location" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                       <button className="form-btn bg-emerald-600">Post Event</button>
                    </form>
                  )}
               </div>
            </div>
          )}
          
          {/* --- OTHER LIST VIEWS (Simplified for brevity but styled) --- */}
          {view === 'jobs' && (
             <div className="space-y-4 animate-fade-in">
                {jobs.map(job => (
                   <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all">
                      <div>
                         <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                         <div className="flex gap-2 mt-1">
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-bold">{job.department}</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{job.job_type}</span>
                         </div>
                      </div>
                      <button onClick={() => handleDelete('job_alerts', job.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg"><Trash2/></button>
                   </div>
                ))}
             </div>
          )}

          {view === 'families' && (
             <div className="flex gap-6 h-full animate-fade-in">
                <div className={`${selectedFamily ? 'w-1/2 hidden md:block' : 'w-full'} transition-all`}>
                   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <table className="w-full text-left">
                         <thead className="bg-gray-50 border-b">
                            <tr><th className="p-4">Head Name</th><th className="p-4">Village</th><th className="p-4">Mobile</th></tr>
                         </thead>
                         <tbody>
                            {groupedFamilies.map((fam, idx) => (
                               <tr key={idx} onClick={() => handleViewFamily(fam)} className="border-b hover:bg-purple-50 cursor-pointer">
                                  <td className="p-4 font-semibold text-gray-700">{fam.head_name}</td>
                                  <td className="p-4 text-gray-500">{fam.village}</td>
                                  <td className="p-4 text-purple-600 font-mono">{fam.mobile_number}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
                {selectedFamily && (
                   <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg border border-purple-100 flex flex-col h-[70vh]">
                      <div className="p-6 bg-purple-50 flex justify-between items-center rounded-t-2xl">
                         <h2 className="font-bold text-lg text-purple-900">{selectedFamily.head_name}'s Family</h2>
                         <button onClick={() => setSelectedFamily(null)}><X className="text-purple-400"/></button>
                      </div>
                      <div className="p-6 overflow-y-auto space-y-3">
                         {selectedFamily.members.map(mem => (
                            <div key={mem.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                               <div><p className="font-bold text-gray-800">{mem.member_name}</p><p className="text-xs text-gray-500">{mem.relationship}</p></div>
                               <button onClick={() => handleDelete('families', mem.id)} className="text-red-400"><Trash2 size={16}/></button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          )}

          {/* Simple renders for remaining lists like Trust Events, Suggestions, Achievers etc. using similar cards */}
          {view === 'trust-events' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {trustEvents.map(e => (
                   <div key={e.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500 relative">
                      <h3 className="font-bold text-lg">{e.title}</h3>
                      <p className="text-sm text-gray-500 mt-1"><Calendar size={14} className="inline mr-1"/> {new Date(e.date).toLocaleDateString()}</p>
                      <button onClick={() => handleDelete('trust_events', e.id)} className="absolute top-4 right-4 text-red-400"><Trash2/></button>
                   </div>
                ))}
             </div>
          )}
          
          {view === 'suggestions' && (
            <div className="space-y-4 animate-fade-in">
              {suggestions.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-400 flex justify-between items-center">
                  <p className="text-gray-700 italic">"{s.message}"</p>
                  <button onClick={() => handleDelete('trust_suggestions', s.id)} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          )}
          
          {view === 'all-requests' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <table className="w-full text-left">
                   <thead className="bg-gray-50"><tr><th className="p-4">Sender</th><th className="p-4">Receiver</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                   <tbody>
                      {allRequests.map(r => (
                         <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-mono text-xs">{r.sender_id}</td>
                            <td className="p-4 font-mono text-xs">{r.receiver_id}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                            <td className="p-4"><button onClick={() => handleDelete('requests', r.id)} className="text-red-400"><Trash2 size={16}/></button></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {view === 'registrations' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto animate-fade-in">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50"><tr><th className="p-4">Name</th><th className="p-4">Village</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                  <tbody>
                     {registrations.map(reg => (
                        <tr key={reg.id} className="border-b hover:bg-gray-50">
                           <td className="p-4 font-semibold">{reg.full_name}</td>
                           <td className="p-4 text-sm text-gray-500">{reg.village}</td>
                           <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{reg.status}</span></td>
                           <td className="p-4"><button onClick={() => handleUpdateRegStatus(reg.id, 'Approved')} className="text-green-600 bg-green-50 p-2 rounded-full hover:bg-green-100"><CheckCircle size={18}/></button></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
          
          {view === 'guidance' && (
             <div className="space-y-4 animate-fade-in">
                {guidance.map(item => (
                   <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-start">
                      <div>
                         <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                         <p className="text-gray-500 text-sm mt-1">{item.content}</p>
                      </div>
                      <button onClick={() => handleDelete('daily_guidance', item.id)} className="text-red-400"><Trash2/></button>
                   </div>
                ))}
             </div>
          )}

          {view === 'achievers' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {achievers.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 relative">
                      <div className="w-16 h-16 bg-amber-100 rounded-lg overflow-hidden flex-shrink-0">
                         {item.photo ? <img src={item.photo} className="w-full h-full object-cover"/> : <Award className="m-auto mt-4 text-amber-500"/>}
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-800">{item.name}</h3>
                         <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{item.achievements}</span>
                      </div>
                      <button onClick={() => handleDelete('achievers', item.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                ))}
             </div>
          )}
          
        </div>
      </main>

      {/* Global Styles for clean Inputs */}
      <style>{`
        .form-input {
          width: 100%;
          padding: 12px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-btn {
          width: 100%;
          padding: 12px;
          color: white;
          font-weight: bold;
          border-radius: 12px;
          transition: transform 0.1s;
        }
        .form-btn:active { transform: scale(0.98); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// --- HELPER COMPONENTS (For Cleaner Code) ---

function SidebarItem({ icon, text, active, onClick, isOpen, color = "text-blue-400" }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full p-3 mb-1 rounded-xl transition-all duration-200 group relative
      ${active ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-4 border-blue-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
    `}>
      <span className={`${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`}>{icon}</span>
      {isOpen && <span className={`ml-3 font-medium text-sm ${active ? 'text-white' : ''}`}>{text}</span>}
      {!isOpen && (
        <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
          {text}
        </div>
      )}
    </button>
  );
}

function SectionLabel({ children, isOpen }) {
  if (!isOpen) return <div className="h-4"></div>;
  return <div className="text-[11px] font-bold text-gray-500 mt-6 mb-2 uppercase px-3 tracking-widest">{children}</div>;
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    pink: "bg-pink-50 text-pink-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}