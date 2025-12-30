import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Briefcase, Plus, Trash2, LogOut, Settings, 
  Phone, Award, User, BookOpen, Calendar, Users, UserPlus, MapPin, X, MessageSquare, ExternalLink, CheckCircle, Heart, Send, Shield, Save, 
  Megaphone, UserCheck // ✅ UserCheck આઈકન ઉમેર્યું
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // --- States for Data ---
  const [jobs, setJobs] = useState([]);
  const [achievers, setAchievers] = useState([]);
  const [guidance, setGuidance] = useState([]);
  
  // ✅ NEW: App Users State
  const [appUsers, setAppUsers] = useState([]);

  // ✅ ટ્રસ્ટ ડેટા
  const [trustEvents, setTrustEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
    
  // ✅ ફંડ મેનેજમેન્ટ
  const [fundStats, setFundStats] = useState({
    id: '', 
    total_fund: '',
    total_donors: '',
    upcoming_events: ''
  });
    
  // ✅ Matrimony & Requests
  const [matrimonyProfiles, setMatrimonyProfiles] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  // ✅ ઈવેન્ટ ફોર્મ
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
    
  // ✅ Families Data
  const [groupedFamilies, setGroupedFamilies] = useState([]); 
  const [selectedFamily, setSelectedFamily] = useState(null);

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

  // ✅ Family Forms
  const [familyHeadForm, setFamilyHeadForm] = useState({ 
    head_name: '', mobile_number: '', sub_surname: '', gol: '', village: '', taluko: '', district: '' 
  });
    
  const [memberForm, setMemberForm] = useState({ 
    head_name: '', village: '', 
    member_name: '', relationship: '', gender: 'Male', age: '', education: '', member_mobile: '' 
  });

  // ✅ Notice Board Form
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });

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
      fetchFamilies();
      fetchTrustData();
      fetchSettings();
      fetchMatrimonyData();
      fetchFundStats();
      fetchAppUsers(); // ✅ Users Fetch Call
    }
  }, [session]);

  // ✅ NEW: Fetch App Users
  const fetchAppUsers = async () => {
    // આપણે 'users' ટેબલમાંથી ડેટા લાવીશું (જે public સ્કીમામાં હોય)
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
            uniqueKey: key,
            head_name: curr.head_name,
            mobile_number: curr.mobile_number, 
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
        id: data.id,
        total_fund: data.total_fund,
        total_donors: data.total_donors,
        upcoming_events: data.upcoming_events
      });
    }
  };

  // --- Logic Functions ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: jobError } = await supabase.from('job_alerts').insert([jobForm]);
      if (jobError) throw jobError;
      
      const notificationMsg = {
        title: `નવી ભરતી: ${jobForm.title}`,
        message: `${jobForm.department} માં ભરતી.`,
        type: 'job',
        is_active: true
      };
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
    const newEntry = { 
        ...familyHeadForm, 
        member_name: familyHeadForm.head_name, 
        relationship: 'Self (Head)', 
        gender: 'Male',
        mobile_number: familyHeadForm.mobile_number 
    };
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
        head_name: commonDetails.head_name,
        mobile_number: commonDetails.mobile_number, 
        sub_surname: commonDetails.sub_surname,
        gol: commonDetails.gol,
        village: commonDetails.village,
        taluko: commonDetails.taluko,
        district: commonDetails.district,
        member_name: memberForm.member_name,
        relationship: memberForm.relationship,
        gender: memberForm.gender,
        member_mobile: memberForm.member_mobile 
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
      if (!fundStats.id) {
         alert('Error: No record ID found. Please refresh page.');
         return;
      }
      const { error } = await supabase.from('fund_stats').update({
        total_fund: fundStats.total_fund,
        total_donors: fundStats.total_donors,
        upcoming_events: fundStats.upcoming_events
      }).eq('id', fundStats.id); 

      if (error) throw error;
      alert('✅ ફંડ સ્ટેટસ અપડેટ થઈ ગયું!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRegStatus = async (id, status) => {
    const { error } = await supabase.from('trust_registrations').update({ status }).eq('id', id);
    if (!error) {
      alert(`✅ Status updated to ${status}`);
      fetchTrustData();
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('notifications').insert([{
        title: noticeForm.title,
        message: noticeForm.message,
        type: 'admin',
        is_active: true
      }]);

      if (error) throw error;

      alert('✅ નોટિસ મોકલાઈ ગઈ! બધા યુઝરને દેખાશે.');
      setNoticeForm({ title: '', message: '' });

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
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
      if(table === 'users') fetchAppUsers(); // ✅ Users Delete
      if(table.startsWith('trust')) fetchTrustData();
    }
  };

  // --- 🔒 Login Screen ---
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 font-sans">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-96 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
             <LayoutDashboard size={32} className="text-blue-900"/>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">યોગી સમાજ સંબંધ</h1>
          <p className="text-blue-200 mb-6 text-sm uppercase tracking-widest">Admin Panel Login</p>
          <input 
            type="password" 
            placeholder="Enter Password" 
            cache-password="off" 
            className="w-full p-4 bg-white/10 border border-white/30 rounded-xl mb-4 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 transition-all text-center tracking-widest" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-white text-blue-900 p-4 rounded-xl font-bold hover:bg-blue-50 hover:scale-[1.02] transition-all shadow-lg uppercase text-sm tracking-wider"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- 🔓 Main Dashboard ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-white flex flex-col p-4 shrink-0 shadow-2xl z-10 overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-slate-700/50 mb-6">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">યોગી સમાજ</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Admin & Control Panel</p>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <MenuButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={LayoutDashboard} label="ડેશબોર્ડ" color="blue" />
          <MenuButton active={view === 'notice-board'} onClick={() => setView('notice-board')} icon={Megaphone} label="નોટિસ બોર્ડ" color="orange" />
          <MenuButton active={view === 'app-users'} onClick={() => setView('app-users')} icon={UserCheck} label="એપ યુઝર્સ" color="teal" />
          
          <SectionLabel label="પરિવાર ડેટા" />
          <MenuButton active={view === 'families'} onClick={() => setView('families')} icon={Users} label="પરિવાર લિસ્ટ" color="purple" />
          <MenuButton active={view === 'add-family'} onClick={() => setView('add-family')} icon={UserPlus} label="નવો પરિવાર" color="purple" />
          <MenuButton active={view === 'add-member'} onClick={() => setView('add-member')} icon={Plus} label="સભ્ય ઉમેરો" color="purple" />

          <SectionLabel label="મેટ્રિમોની" />
          <MenuButton active={view === 'matrimony'} onClick={() => setView('matrimony')} icon={Heart} label="પ્રોફાઈલ્સ" color="pink" />
          <MenuButton active={view === 'all-requests'} onClick={() => setView('all-requests')} icon={Send} label="રિક્વેસ્ટ લોગ" color="pink" />

          <SectionLabel label="ટ્રસ્ટ સેક્શન" />
          <MenuButton active={view === 'trust-events'} onClick={() => setView('trust-events')} icon={Calendar} label="ઈવેન્ટ્સ" color="emerald" />
          <MenuButton active={view === 'registrations'} onClick={() => setView('registrations')} icon={UserPlus} label="રજીસ્ટ્રેશન" color="emerald" />
          <MenuButton active={view === 'suggestions'} onClick={() => setView('suggestions')} icon={MessageSquare} label="મંતવ્યો" color="emerald" />
          <MenuButton active={view === 'fund-manager'} onClick={() => setView('fund-manager')} icon={Shield} label="ફંડ મેનેજર" color="emerald" />

          <SectionLabel label="અન્ય સેવાઓ" />
          <MenuButton active={view === 'jobs'} onClick={() => setView('jobs')} icon={Briefcase} label="નોકરી" color="blue" />
          <MenuButton active={view === 'achievers'} onClick={() => setView('achievers')} icon={Award} label="સમાજ ગૌરવ" color="amber" />
          <MenuButton active={view === 'guidance'} onClick={() => setView('guidance')} icon={BookOpen} label="રોજિંદુ માર્ગદર્શન" color="green" />
          <MenuButton active={view === 'settings'} onClick={() => setView('settings')} icon={Settings} label="સેટિંગ્સ" color="slate" />
        </nav>
        
        <button onClick={() => setSession(false)} className="flex items-center text-red-400 hover:text-white hover:bg-red-500/20 mt-6 p-4 rounded-xl transition-all group">
            <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" /> 
            <span className="font-bold">Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {view === 'dashboard' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">સ્વાગત છે, એડમિન! 👋</h1>
                    <p className="text-gray-500 mt-1">આજનો રિપોર્ટ અને આંકડા</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm">
                    Last Updated: Today
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="App Users" count={appUsers.length} color="teal" icon={UserCheck} />
              <StatCard label="Active Jobs" count={jobs.length} color="blue" icon={Briefcase} />
              <StatCard label="Achievers" count={achievers.length} color="amber" icon={Award} />
              <StatCard label="Families" count={groupedFamilies.length} color="purple" icon={Users} />
              <StatCard label="Trust Events" count={trustEvents.length} color="emerald" icon={Calendar} />
              <StatCard label="Profiles" count={matrimonyProfiles.length} color="pink" icon={Heart} />
              <StatCard label="Requests" count={allRequests.length} color="rose" icon={Send} />
              <StatCard label="Feedback" count={suggestions.length} color="gray" icon={MessageSquare} />
            </div>
          </div>
        )}

        {/* ✅ App Users List View */}
        {view === 'app-users' && (
          <div>
             <Header title={`રજીસ્ટર્ડ એપ યુઝર્સ (${appUsers.length})`} icon={UserCheck} color="text-teal-600" />
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-gray-50/50 border-b border-gray-100">
                   <tr>
                     <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User Profile</th>
                     <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                     <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                     <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User ID</th>
                     <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {appUsers.map((user) => (
                     <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                       <td className="p-5 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <User className="text-gray-400 w-5 h-5"/>}
                         </div>
                         <span className="font-bold text-gray-700">{user.full_name || 'No Name'}</span>
                       </td>
                       <td className="p-5 font-mono text-teal-600 font-medium">{user.mobile_number || '-'}</td>
                       <td className="p-5 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                       <td className="p-5 text-xs font-mono text-gray-400">{user.id.substring(0, 8)}...</td>
                       <td className="p-5">
                          <button onClick={() => handleDelete('users', user.id)} className="text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={18}/></button>
                       </td>
                     </tr>
                   ))}
                   {appUsers.length === 0 && (
                     <tr><td colSpan="5" className="p-10 text-center text-gray-400">No users found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {view === 'notice-board' && (
          <div className="max-w-3xl mx-auto">
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">નોટિસ બોર્ડ</h2>
                        <p className="text-gray-500 text-sm">Send instant notifications to all users</p>
                    </div>
                </div>
                
                <form onSubmit={handleSendNotice} className="space-y-6">
                   <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm border border-orange-100 mb-6">
                      ⚠️ અહીંથી મોકલેલો મેસેજ યુઝરની એપમાં 'Notification' સેક્શનમાં તરત જ દેખાશે.
                   </div>
                   <InputGroup label="નોટિસનું શીર્ષક (Title)" placeholder="દા.ત. અગત્યની સૂચના" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} />
                   <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">સંદેશો (Message)</label>
                      <textarea required placeholder="તમારો મેસેજ અહીં લખો..." className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50 h-40 transition-all resize-none"
                        value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} 
                      />
                   </div>
                   <button disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:shadow-lg hover:scale-[1.01] transition-all">
                      {loading ? 'મોકલાઈ રહ્યું છે...' : <><Send size={20}/> નોટિસ મોકલો (Send Notice)</>}
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* ... બાકીના સ્ક્રીન (Jobs, Matrimony, Families etc.) ... */}
        {view === 'matrimony' && (
          <div>
            <Header title="મેટ્રિમોની પ્રોફાઈલ્સ" icon={Heart} color="text-pink-600" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Profile</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matrimonyProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="p-5 flex items-center gap-4">
                        <img src={p.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-xl object-cover bg-gray-100 shadow-sm" />
                        <div><p className="font-bold text-gray-800">{p.full_name}</p><p className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">{p.age} Years</p></div>
                      </td>
                      <td className="p-5 text-sm font-medium text-gray-600">{p.peta_atak} <br/><span className="text-xs text-pink-500 font-bold">{p.gol}</span></td>
                      <td className="p-5 text-sm text-gray-600">{p.village} <br/><span className="text-xs text-gray-400">{p.district}</span></td>
                      <td className="p-5"><span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">{p.marital_status}</span></td>
                      <td className="p-5"><button onClick={() => handleDelete('matrimony_profiles', p.id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'all-requests' && (
          <div>
            <Header title="રિક્વેસ્ટ લોગ" icon={Send} color="text-rose-500" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Sender ID</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver ID</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allRequests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 text-xs font-mono text-gray-500 bg-gray-50 rounded mx-2 w-fit">{r.sender_id}</td>
                      <td className="p-5 text-xs font-mono text-gray-500 bg-gray-50 rounded mx-2 w-fit">{r.receiver_id}</td>
                      <td className="p-5 text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                      <td className="p-5"><button onClick={() => handleDelete('requests', r.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'registrations' && (
          <div>
            <Header title="રજીસ્ટ્રેશન લિસ્ટ" icon={UserPlus} color="text-emerald-600" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Education</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Result</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Proof</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Approve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-gray-800">{reg.full_name}</p>
                        <p className="text-xs text-gray-400 font-medium bg-gray-100 w-fit px-2 rounded mt-1">{reg.sub_surname}</p>
                      </td>
                      <td className="p-5 text-sm text-gray-600">{reg.village} <br/><span className="text-xs text-emerald-600 font-bold">{reg.gol || '-'}</span></td>
                      <td className="p-5 text-sm text-gray-600">{reg.school_college || '-'} <br/><span className="text-xs text-gray-400">{reg.taluko}</span></td>
                      <td className="p-5 text-sm font-bold text-blue-600">{reg.percentage ? `${reg.percentage}%` : '-'} <br/><span className="text-xs text-gray-400 font-normal">{reg.passing_year}</span></td>
                      <td className="p-5">
                        {reg.marksheet_url ? (
                          <a href={reg.marksheet_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                            <ExternalLink size={14}/> View
                          </a>
                        ) : <span className="text-gray-300 text-xs italic">Pending</span>}
                      </td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{reg.status}</span></td>
                      <td className="p-5">
                        <button onClick={() => handleUpdateRegStatus(reg.id, 'Approved')} className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-all"><CheckCircle size={20}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'trust-events' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <Header title="ટ્રસ્ટ કાર્યક્રમો" icon={Calendar} color="text-emerald-600" className="mb-0" />
              <button onClick={() => setView('add-event')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"><Plus size={20} className="mr-2" /> New Event</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trustEvents.map(e => (
                <div key={e.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex justify-between items-start group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 p-2 rounded-lg"><Calendar size={18}/></span>
                        <h3 className="font-bold text-lg text-gray-800">{e.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-1">{new Date(e.date).toLocaleDateString()} • {e.location}</p>
                    <p className="text-xs bg-gray-50 text-gray-500 font-bold px-3 py-1.5 rounded-full w-fit mt-4 border border-gray-100">Attendees: {e.attendees_count}</p>
                  </div>
                  <button onClick={() => handleDelete('trust_events', e.id)} className="text-gray-300 group-hover:text-red-500 p-2 transition-colors"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-event' && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100">
                <Header title="નવો કાર્યક્રમ ઉમેરો" icon={Calendar} color="text-emerald-600" />
                <form onSubmit={handlePostEvent} className="space-y-6">
                  <InputGroup label="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                  <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
                      <textarea placeholder="Event details..." className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-32 bg-gray-50" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <InputGroup type="datetime-local" label="Date & Time" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                     <InputGroup label="Location" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                  </div>
                  <button disabled={loading} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">🚀 Post Event</button>
                </form>
             </div>
          </div>
        )}

        {view === 'suggestions' && (
          <div>
            <Header title="યુવાનોના મંતવ્ય" icon={MessageSquare} color="text-emerald-600" />
            <div className="grid gap-4">
              {suggestions.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-all flex justify-between items-center group">
                  <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">❝</div>
                      <p className="text-gray-700 italic text-lg leading-relaxed pt-1">"{s.message}"</p>
                  </div>
                  <button onClick={() => handleDelete('trust_suggestions', s.id)} className="text-gray-300 group-hover:text-red-500 p-2 transition-colors"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {view === 'fund-manager' && (
          <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">સમાજ ફંડ મેનેજર</h2>
                        <p className="text-gray-500 text-sm">Update financial stats securely</p>
                    </div>
                </div>
              <form onSubmit={handleUpdateFundStats} className="space-y-6">
                <InputGroup label="કુલ ફંડ (રકમ)" placeholder="e.g. ₹ ૫,૦૦,૦૦૦" value={fundStats.total_fund} onChange={e => setFundStats({...fundStats, total_fund: e.target.value})} />
                <InputGroup label="કુલ દાતાઓ" placeholder="e.g. ૧૫૦+" value={fundStats.total_donors} onChange={e => setFundStats({...fundStats, total_donors: e.target.value})} />
                <InputGroup label="આગામી કાર્યક્રમો (આંકડો)" placeholder="e.g. ૩" value={fundStats.upcoming_events} onChange={e => setFundStats({...fundStats, upcoming_events: e.target.value})} />
                <button disabled={loading} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 shadow-lg transition-all">
                   <Save size={20}/> ડેટા અપડેટ કરો
                </button>
              </form>
              </div>
          </div>
        )}

        {view === 'families' && (
          <div className="flex gap-8 h-full">
            <div className={`${selectedFamily ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
              <div className="flex justify-between items-center mb-8">
                <Header title="પરિવાર લિસ્ટ" icon={Users} color="text-purple-600" className="mb-0" />
                <button onClick={() => setView('add-family')} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center font-bold shadow-lg shadow-purple-200 transition-all"><Plus size={18} className="mr-2" /> New Family</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Head Name</th>
                      <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                      <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Village</th>
                      <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {groupedFamilies.map((fam, idx) => (
                      <tr key={idx} onClick={() => handleViewFamily(fam)} className={`cursor-pointer transition-all hover:bg-purple-50/50 ${selectedFamily?.uniqueKey === fam.uniqueKey ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}>
                        <td className="p-5 font-bold text-gray-700">{fam.head_name}</td>
                        <td className="p-5 font-mono text-purple-600 font-medium text-sm">{fam.mobile_number || '-'}</td>
                        <td className="p-5 text-gray-500 text-sm"><span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {fam.village}</span></td>
                        <td className="p-5 text-center"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{fam.members.length}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedFamily && (
              <div className="w-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[calc(100vh-140px)] animate-fade-in-right">
                <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-white flex justify-between items-center rounded-t-2xl">
                  <div>
                    <h2 className="font-bold text-xl text-purple-900">{selectedFamily.head_name}</h2>
                    <p className="text-sm text-purple-600 mt-1 flex items-center gap-2"><MapPin size={14}/> {selectedFamily.village} • <Phone size={14}/> {selectedFamily.mobile_number}</p>
                  </div>
                  <button onClick={() => setSelectedFamily(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {selectedFamily.members.map((mem) => (
                    <div key={mem.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                      <div>
                          <p className="font-bold text-gray-800">{mem.member_name}</p>
                          <div className="flex gap-2 mt-1">
                             <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500">{mem.relationship}</span>
                             {mem.member_mobile && <span className="text-xs text-purple-600 font-mono flex items-center gap-1"><Phone size={10}/> {mem.member_mobile}</span>}
                          </div>
                      </div>
                      <button onClick={() => handleDelete('families', mem.id)} className="text-gray-300 group-hover:text-red-500 p-2 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'add-family' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
            <Header title="નવો પરિવાર ઉમેરો" icon={UserPlus} color="text-purple-600" />
            <form onSubmit={handleAddFamilyHead} className="space-y-6">
              <InputGroup label="Head Name" value={familyHeadForm.head_name} onChange={e => setFamilyHeadForm({...familyHeadForm, head_name: e.target.value})} />
              <InputGroup label="Mobile Number (Head)" maxLength={10} value={familyHeadForm.mobile_number} onChange={e => setFamilyHeadForm({...familyHeadForm, mobile_number: e.target.value.replace(/[^0-9]/g, '')})} />
              <InputGroup label="Sub Surname" value={familyHeadForm.sub_surname} onChange={e => setFamilyHeadForm({...familyHeadForm, sub_surname: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Village" value={familyHeadForm.village} onChange={e => setFamilyHeadForm({...familyHeadForm, village: e.target.value})} />
                <InputGroup label="Gol" value={familyHeadForm.gol} onChange={e => setFamilyHeadForm({...familyHeadForm, gol: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Taluko" value={familyHeadForm.taluko} onChange={e => setFamilyHeadForm({...familyHeadForm, taluko: e.target.value})} />
                <InputGroup label="District" value={familyHeadForm.district} onChange={e => setFamilyHeadForm({...familyHeadForm, district: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">Save Family Record</button>
            </form>
          </div>
        )}

        {view === 'add-member' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
            <Header title="સભ્યો ઉમેરો" icon={Plus} color="text-purple-600" />
            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Select Family</label>
                  <select required className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" onChange={e => { const [h, v] = e.target.value.split('|'); setMemberForm({...memberForm, head_name: h, village: v}); }}>
                    <option value="">-- Select Family --</option>
                    {groupedFamilies.map((f, i) => <option key={i} value={`${f.head_name}|${f.village}`}>{f.head_name} - {f.village}</option>)}
                  </select>
              </div>
              <InputGroup label="Member Name" value={memberForm.member_name} onChange={e => setMemberForm({...memberForm, member_name: e.target.value})} />
              <InputGroup label="Mobile Number" maxLength={10} value={memberForm.member_mobile} onChange={e => setMemberForm({...memberForm, member_mobile: e.target.value.replace(/[^0-9]/g, '')})} />
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Relation" value={memberForm.relationship} onChange={e => setMemberForm({...memberForm, relationship: e.target.value})} />
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Gender</label>
                    <select className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50" value={memberForm.gender} onChange={e => setMemberForm({...memberForm, gender: e.target.value})}><option>Male</option><option>Female</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputGroup label="Age" value={memberForm.age} onChange={e => setMemberForm({...memberForm, age: e.target.value})} />
                 <InputGroup label="Education" value={memberForm.education} onChange={e => setMemberForm({...memberForm, education: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">Add Member</button>
            </form>
          </div>
        )}

        {view === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <Header title="Jobs Dashboard" icon={Briefcase} color="text-blue-600" className="mb-0" />
              <button onClick={() => setView('add-job')} className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"><Plus size={18} className="mr-2" /> Add Job</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {jobs.map(job => (
                 <div key={job.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                   <div className="flex justify-between items-start">
                       <div>
                           <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${job.job_type === 'Government' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{job.job_type}</span>
                           <h3 className="font-bold text-lg mt-3 text-gray-800">{job.title}</h3>
                           <p className="text-sm text-gray-500 font-medium">{job.department}</p>
                           <div className="mt-4 flex gap-3 text-xs text-gray-400 font-medium">
                               <span className="bg-gray-50 px-2 py-1 rounded">💰 {job.salary}</span>
                               <span className="bg-gray-50 px-2 py-1 rounded">📅 {job.last_date || 'N/A'}</span>
                           </div>
                       </div>
                       <button onClick={() => handleDelete('job_alerts', job.id)} className="text-gray-300 group-hover:text-red-500 p-2 transition-colors absolute top-4 right-4"><Trash2 size={18} /></button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {view === 'add-job' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
            <Header title="નવી ભરતી ઉમેરો" icon={Briefcase} color="text-blue-600" />
            <form onSubmit={handlePostJob} className="space-y-6">
              <InputGroup label="Job Title" placeholder="ભરતીનું નામ" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
              <InputGroup label="Department" placeholder="વિભાગ" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Salary" placeholder="પગાર" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                <div>
                   <label className="block text-sm font-bold text-gray-600 mb-2">Job Type</label>
                   <select className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50" value={jobForm.job_type} onChange={e => setJobForm({...jobForm, job_type: e.target.value})}><option>Government</option><option>Private</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputGroup type="date" label="Last Date" value={jobForm.last_date} onChange={e => setJobForm({...jobForm, last_date: e.target.value})} />
                 <InputGroup label="Apply Link" value={jobForm.apply_link} onChange={e => setJobForm({...jobForm, apply_link: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
                 <textarea placeholder="વિગત..." className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-32 bg-gray-50" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Post Job Alert</button>
            </form>
          </div>
        )}

        {view === 'achievers' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <Header title="Hall of Fame" icon={Award} color="text-amber-500" className="mb-0" />
              <button onClick={() => setView('add-achiever')} className="bg-amber-500 text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all"><Plus size={18} className="mr-2" /> Add Achiever</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {achievers.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-5 relative group hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                      {item.photo ? <img src={item.photo} className="w-full h-full object-cover"/> : <User className="m-auto mt-6 text-gray-400"/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full mt-2 inline-block border border-amber-100">{item.achievements}</span>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.education_journey}</p>
                  </div>
                  <button onClick={() => handleDelete('achievers', item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-achiever' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-amber-100">
            <Header title="Add Achiever" icon={Award} color="text-amber-500" />
            <form onSubmit={handleAddAchiever} className="space-y-6">
              <InputGroup label="Full Name" value={achieverForm.name} onChange={e => setAchieverForm({...achieverForm, name: e.target.value})} />
              <InputGroup label="Achievement Title" value={achieverForm.achievements} onChange={e => setAchieverForm({...achieverForm, achievements: e.target.value})} />
              <InputGroup label="Photo URL" value={achieverForm.photo} onChange={e => setAchieverForm({...achieverForm, photo: e.target.value})} />
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Journey</label><textarea className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 h-24" value={achieverForm.education_journey} onChange={e => setAchieverForm({...achieverForm, education_journey: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Struggles</label><textarea className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 h-24" value={achieverForm.struggles} onChange={e => setAchieverForm({...achieverForm, struggles: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-gray-600 mb-2">Advice</label><textarea className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 h-24" value={achieverForm.advice_for_youth} onChange={e => setAchieverForm({...achieverForm, advice_for_youth: e.target.value})} /></div>
              <button className="w-full bg-amber-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-amber-600 transition-all">Add to Hall of Fame</button>
            </form>
          </div>
        )}

        {view === 'guidance' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <Header title="રોજિંદુ માર્ગદર્શન" icon={BookOpen} color="text-green-600" className="mb-0" />
              <button onClick={() => setView('add-guidance')} className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all"><Plus size={18} className="mr-2" /> Add Post</button>
            </div>
            <div className="space-y-4">
              {guidance.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex justify-between items-start group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded text-gray-500">{item.topic}</span>
                        <span className="text-[10px] text-gray-400">{item.display_date}</span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                  <button onClick={() => handleDelete('daily_guidance', item.id)} className="text-gray-300 group-hover:text-red-500 p-2 transition-colors"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-guidance' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-green-100">
            <Header title="નવી માર્ગદર્શન પોસ્ટ" icon={BookOpen} color="text-green-600" />
            <form onSubmit={handleAddGuidance} className="space-y-6">
              <InputGroup label="Title" value={guidanceForm.title} onChange={e => setGuidanceForm({...guidanceForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-bold text-gray-600 mb-2">Topic</label>
                     <select className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50" value={guidanceForm.topic} onChange={e => setGuidanceForm({...guidanceForm, topic: e.target.value})}><option value="general">General</option><option value="career">Career</option><option value="skills">Skills</option></select>
                  </div>
                  <InputGroup type="date" label="Publish Date" value={guidanceForm.display_date} onChange={e => setGuidanceForm({...guidanceForm, display_date: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Content</label>
                  <textarea required className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 h-40 bg-gray-50" value={guidanceForm.content} onChange={e => setGuidanceForm({...guidanceForm, content: e.target.value})} />
              </div>
              <InputGroup label="Image URL (Optional)" value={guidanceForm.image_url} onChange={e => setGuidanceForm({...guidanceForm, image_url: e.target.value})} />
              <button disabled={loading} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all">Publish Post</button>
            </form>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-10">
            <Header title="Settings" icon={Settings} color="text-gray-700" />
            <div className="mb-6">
              <InputGroup label="Helpline Number" value={helpline} onChange={(e) => setHelpline(e.target.value)} />
            </div>
            <button onClick={handleSaveSettings} className="w-full bg-gray-800 text-white p-4 rounded-xl font-bold hover:bg-black transition-all">Save Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ✨ New UI Components for Clean Code & Premium Look ---

const MenuButton = ({ active, onClick, icon: Icon, label, color }) => {
    const colorClasses = {
        blue: 'hover:bg-blue-500/20 hover:text-blue-300',
        orange: 'hover:bg-orange-500/20 hover:text-orange-300',
        teal: 'hover:bg-teal-500/20 hover:text-teal-300',
        purple: 'hover:bg-purple-500/20 hover:text-purple-300',
        pink: 'hover:bg-pink-500/20 hover:text-pink-300',
        emerald: 'hover:bg-emerald-500/20 hover:text-emerald-300',
        amber: 'hover:bg-amber-500/20 hover:text-amber-300',
        green: 'hover:bg-green-500/20 hover:text-green-300',
        slate: 'hover:bg-gray-700 hover:text-gray-300',
    };
    
    // Active Gradients based on color
    const activeGradients = {
        blue: 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/50',
        orange: 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-900/50',
        teal: 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-900/50',
        purple: 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-900/50',
        pink: 'bg-gradient-to-r from-pink-600 to-pink-500 shadow-lg shadow-pink-900/50',
        emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/50',
        amber: 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-lg shadow-amber-900/50',
        green: 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-900/50',
        slate: 'bg-gray-700 shadow-lg',
    };

    return (
        <button onClick={onClick} className={`flex items-center w-full p-3.5 rounded-xl mb-1 transition-all duration-300 font-medium text-sm ${active ? activeGradients[color] || 'bg-blue-600 text-white' : `text-gray-400 ${colorClasses[color]}`}`}>
            <Icon size={20} className={`mr-3 ${active ? 'text-white' : ''}`} /> {label}
        </button>
    );
};

const SectionLabel = ({ label }) => (
    <div className="text-[10px] font-black text-slate-500 mt-6 mb-2 uppercase px-3 tracking-widest border-t border-slate-800 pt-4">{label}</div>
);

const StatCard = ({ label, count, color, icon: Icon }) => {
    const colors = {
        teal: 'border-teal-500 text-teal-600 bg-teal-50',
        blue: 'border-blue-500 text-blue-600 bg-blue-50',
        amber: 'border-amber-500 text-amber-600 bg-amber-50',
        purple: 'border-purple-500 text-purple-600 bg-purple-50',
        emerald: 'border-emerald-500 text-emerald-600 bg-emerald-50',
        pink: 'border-pink-500 text-pink-600 bg-pink-50',
        rose: 'border-rose-500 text-rose-600 bg-rose-50',
        gray: 'border-gray-500 text-gray-600 bg-gray-50',
    };
    
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-b-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${colors[color].split(' ')[0]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">{count}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colors[color].split(' ').slice(1).join(' ')}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

const Header = ({ title, icon: Icon, color, className = "mb-6" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className={`p-2 rounded-lg bg-gray-100 ${color}`}><Icon size={24}/></div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    </div>
);

const InputGroup = ({ label, type = "text", ...props }) => (
    <div>
        <label className="block text-sm font-bold text-gray-600 mb-2">{label}</label>
        <input type={type} className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white" {...props} />
    </div>
);

// ✅ CheckCircle આઈકોન નામ કલીઝન વગર (તમારો જૂનો કોડ)
function CustomCheckCircle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}