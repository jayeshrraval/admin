import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Briefcase, Plus, Trash2, LogOut, Settings, 
  Phone, Award, User, BookOpen, Calendar, Users, UserPlus, MapPin, X, MessageSquare, ExternalLink, CheckCircle, Heart, Send, Shield, Save, 
  Megaphone // ✅ Notice Board આઈકન
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

  // ✅ NEW: Notice Board Form
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
      
      // ✅ સુધારો: 'notifications' ટેબલમાં ડેટા જશે
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

  // ✅ NEW: Handle Send Notice
  const handleSendNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ સુધારો: 'notifications' ટેબલમાં ડેટા જશે
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

          {/* ✅ Notice Board Button */}
          <button onClick={() => setView('notice-board')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'notice-board' ? 'bg-orange-600' : 'hover:bg-white/10'}`}>
            <Megaphone size={20} className="mr-3" /> નોટિસ બોર્ડ
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

          <div className="text-[10px] font-bold text-gray-500 mt-6 mb-2 uppercase px-3 tracking-widest">મેટ્રિમોની</div>
          <button onClick={() => setView('matrimony')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'matrimony' ? 'bg-pink-600' : 'hover:bg-white/10'}`}><Heart size={20} className="mr-3" /> પ્રોફાઈલ્સ</button>
          <button onClick={() => setView('all-requests')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'all-requests' ? 'bg-pink-600' : 'hover:bg-white/10'}`}><Send size={20} className="mr-3" /> રિક્વેસ્ટ લોગ</button>

          <div className="text-[10px] font-bold text-gray-500 mt-6 mb-2 uppercase px-3 tracking-widest">ટ્રસ્ટ સેક્શન</div>
          <button onClick={() => setView('trust-events')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'trust-events' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><Calendar size={20} className="mr-3" /> ઈવેન્ટ્સ</button>
          <button onClick={() => setView('registrations')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'registrations' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><UserPlus size={20} className="mr-3" /> રજીસ્ટ્રેશન</button>
          <button onClick={() => setView('suggestions')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'suggestions' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><MessageSquare size={20} className="mr-3" /> મંતવ્યો</button>
          
          <button onClick={() => setView('fund-manager')} className={`flex items-center w-full p-3 rounded-lg mb-1 ${view === 'fund-manager' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}><Shield size={20} className="mr-3" /> ફંડ મેનેજર</button>

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
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500"><p className="text-gray-500">Matrimony</p><h3 className="text-3xl font-bold">{matrimonyProfiles.length}</h3></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-400"><p className="text-gray-500">Requests</p><h3 className="text-3xl font-bold">{allRequests.length}</h3></div>
            </div>
          </div>
        )}

        {/* ✅ Notice Board Screen */}
        {view === 'notice-board' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-orange-600">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone className="text-orange-600"/> નોટિસ બોર્ડ</h2>
             <p className="text-sm text-gray-500 mb-6 bg-orange-50 p-3 rounded">
               અહીંથી મોકલેલો મેસેજ યુઝરની એપમાં 'Notification' સેક્શનમાં તરત જ દેખાશે.
             </p>
             <form onSubmit={handleSendNotice} className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-600 mb-1">નોટિસનું શીર્ષક (Title)</label>
                   <input required placeholder="દા.ત. અગત્યની સૂચના" className="w-full p-3 border rounded-lg"
                     value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} 
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-600 mb-1">સંદેશો (Message)</label>
                   <textarea required placeholder="તમારો મેસેજ અહીં લખો..." className="w-full p-3 border rounded-lg h-32"
                     value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} 
                   />
                </div>
                <button disabled={loading} className="w-full bg-orange-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
                   {loading ? 'મોકલાઈ રહ્યું છે...' : <><Send size={18}/> નોટિસ મોકલો (Send Notice)</>}
                </button>
             </form>
          </div>
        )}

        {/* ... બાકીના સ્ક્રીન (Jobs, Matrimony, etc.) યથાવત છે ... */}
        {view === 'matrimony' && (
          <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart className="text-pink-600"/> મેટ્રિમોની પ્રોફાઈલ્સ</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Profile</th>
                    <th className="p-4">Peta Atak / Gol</th>
                    <th className="p-4">Gaam / District</th>
                    <th className="p-4">Marital Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {matrimonyProfiles.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image_url || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div><p className="font-bold">{p.full_name}</p><p className="text-xs text-gray-400">{p.age} Years</p></div>
                      </td>
                      <td className="p-4 text-sm font-medium">{p.peta_atak} <br/><span className="text-[10px] text-pink-600">{p.gol}</span></td>
                      <td className="p-4 text-sm">{p.village} <br/><span className="text-xs text-gray-400">{p.district}</span></td>
                      <td className="p-4"><span className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs font-bold">{p.marital_status}</span></td>
                      <td className="p-4"><button onClick={() => handleDelete('matrimony_profiles', p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'all-requests' && (
          <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Send className="text-pink-500"/> મેટ્રિમોની રિક્વેસ્ટ લોગ</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Sender ID</th>
                    <th className="p-4">Receiver ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-xs font-mono">{r.sender_id}</td>
                      <td className="p-4 text-xs font-mono">{r.receiver_id}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                      <td className="p-4"><button onClick={() => handleDelete('requests', r.id)} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'registrations' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">રજીસ્ટ્રેશન લિસ્ટ (વિગતવાર)</h1>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Gaam / Gol</th>
                    <th className="p-4">School / College</th>
                    <th className="p-4">Taka / Year</th>
                    <th className="p-4">Marksheet</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-bold">
                        {reg.full_name}<br/>
                        <span className="text-xs text-gray-400 font-normal">{reg.sub_surname}</span>
                      </td>
                      <td className="p-4 text-sm">{reg.village} <br/><span className="text-[10px] text-emerald-600 font-bold">{reg.gol || '-'}</span></td>
                      <td className="p-4 text-sm">{reg.school_college || '-'} <br/><span className="text-[10px] text-gray-400">{reg.taluko}</span></td>
                      <td className="p-4 text-sm font-bold text-blue-700">{reg.percentage ? `${reg.percentage}%` : '-'} <br/><span className="text-[10px] text-gray-400 font-normal">{reg.passing_year}</span></td>
                      <td className="p-4">
                        {reg.marksheet_url ? (
                          <a href={reg.marksheet_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline">
                            <ExternalLink size={14}/> View Photo
                          </a>
                        ) : <span className="text-gray-300 text-xs">No Photo</span>}
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${reg.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{reg.status}</span></td>
                      <td className="p-4">
                        <button onClick={() => handleUpdateRegStatus(reg.id, 'Approved')} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><CheckCircle size={20}/></button>
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
        
        {view === 'fund-manager' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-emerald-600">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield className="text-emerald-600"/> સમાજ ફંડ મેનેજર</h2>
              <form onSubmit={handleUpdateFundStats} className="space-y-6">
                <div>
                   <label className="block font-bold text-sm text-gray-500 uppercase mb-1">કુલ ફંડ (રકમ)</label>
                   <input required type="text" placeholder="e.g. ₹ ૫,૦૦,૦૦૦" className="w-full p-3 border rounded-lg bg-gray-50"
                     value={fundStats.total_fund} onChange={e => setFundStats({...fundStats, total_fund: e.target.value})} />
                </div>
                <div>
                   <label className="block font-bold text-sm text-gray-500 uppercase mb-1">કુલ દાતાઓ</label>
                   <input required type="text" placeholder="e.g. ૧૫૦+" className="w-full p-3 border rounded-lg bg-gray-50"
                     value={fundStats.total_donors} onChange={e => setFundStats({...fundStats, total_donors: e.target.value})} />
                </div>
                <div>
                   <label className="block font-bold text-sm text-gray-500 uppercase mb-1">આગામી કાર્યક્રમો (આંકડો)</label>
                   <input required type="text" placeholder="e.g. ૩" className="w-full p-3 border rounded-lg bg-gray-50"
                     value={fundStats.upcoming_events} onChange={e => setFundStats({...fundStats, upcoming_events: e.target.value})} />
                </div>
                <button disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
                   <Save size={18}/> અપડેટ કરો (Update)
                </button>
             </form>
          </div>
        )}

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
                    <tr>
                      <th className="p-4">Head Name</th>
                      <th className="p-4">Mobile</th> {/* ✅ Mobile Column Added */}
                      <th className="p-4">Village</th>
                      <th className="p-4 text-center">Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedFamilies.map((fam, idx) => (
                      <tr key={idx} onClick={() => handleViewFamily(fam)} className={`border-b cursor-pointer hover:bg-purple-50 ${selectedFamily?.uniqueKey === fam.uniqueKey ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}>
                        <td className="p-4 font-bold">{fam.head_name}</td>
                        <td className="p-4 text-blue-600 font-bold text-sm">{fam.mobile_number || '-'}</td> {/* ✅ Mobile Display */}
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
                    <p className="text-xs text-purple-600">{selectedFamily.village} • {selectedFamily.mobile_number}</p>
                  </div>
                  <button onClick={() => setSelectedFamily(null)}><X className="text-purple-400 hover:text-red-500"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {selectedFamily.members.map((mem) => (
                    <div key={mem.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                          <p className="font-bold">{mem.member_name}</p>
                          <p className="text-xs text-gray-500">{mem.relationship} {mem.member_mobile ? `• ${mem.member_mobile}` : ''}</p> {/* ✅ Member Mobile Added */}
                      </div>
                      <button onClick={() => handleDelete('families', mem.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'add-family' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border-t-4 border-purple-600">
            <h2 className="text-xl font-bold mb-6">નવો પરિવાર ઉમેરો</h2>
            <form onSubmit={handleAddFamilyHead} className="space-y-4">
              <input required placeholder="Head Name" className="w-full p-3 border rounded-lg" value={familyHeadForm.head_name} onChange={e => setFamilyHeadForm({...familyHeadForm, head_name: e.target.value})} />
              
              {/* ✅ Mobile Number Input Added */}
              <input required placeholder="Mobile Number (Head)" maxLength={10} className="w-full p-3 border rounded-lg" value={familyHeadForm.mobile_number} onChange={e => setFamilyHeadForm({...familyHeadForm, mobile_number: e.target.value.replace(/[^0-9]/g, '')})} />

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
              
              {/* ✅ Member Mobile Number Input Added */}
              <input placeholder="Member Mobile Number" maxLength={10} className="w-full p-3 border rounded-lg" value={memberForm.member_mobile} onChange={e => setMemberForm({...memberForm, member_mobile: e.target.value.replace(/[^0-9]/g, '')})} />

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

// ✅ CheckCircle આઈકોન નામ કલીઝન વગર
function CustomCheckCircle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}