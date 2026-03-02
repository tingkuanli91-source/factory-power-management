import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PowerFlowModule from './components/PowerFlowModule';
import DeviceManagementModule from './components/DeviceManagementModule';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: '1', email: 'admin@taiwanmicrogrid.com', password: 'Demo1234!', companyName: '台灣微網科技股份有限公司', role: 'admin', name: '管理員' }
];

const MOCK_DEVICES = [
  { id: '1', name: '台電進線', type: 'taipower', location: '總配電室', status: 'active', power: 150 },
  { id: '2', name: '太陽能A區', type: 'solar', location: '屋頂A', status: 'active', power: 85 },
  { id: '3', name: '太陽能B區', type: 'solar', location: '屋頂B', status: 'active', power: 62 },
  { id: '4', name: '儲能系統', type: 'battery', location: '地下室', status: 'active', power: -35 },
  { id: '5', name: '工廠主負載', type: 'load', location: '生產線', status: 'active', power: 180 },
  { id: '6', name: '辦公區', type: 'load', location: '辦公大樓', status: 'active', power: 45 },
  { id: '7', name: '冷氣設備', type: 'load', location: '全區', status: 'active', power: 55 },
];

const TAIWAN_ELECTRICITY = {
  twoPeriod: { summer: { peak: 4.46, offPeak: 2.12 }, nonSummer: { peak: 3.97, offPeak: 1.87 } },
  threePeriod: { summer: { peak: 4.46, semiPeak: 3.52, offPeak: 2.12 }, nonSummer: { peak: 3.97, semiPeak: 3.16, offPeak: 1.87 } }
};

const calculateCost = (dailyData, planType) => {
  const isSummer = new Date().getMonth() >= 5 && new Date().getMonth() <= 8;
  const rates = planType === 'twoPeriod' 
    ? (isSummer ? TAIWAN_ELECTRICITY.twoPeriod.summer : TAIWAN_ELECTRICITY.twoPeriod.nonSummer) 
    : (isSummer ? TAIWAN_ELECTRICITY.threePeriod.summer : TAIWAN_ELECTRICITY.threePeriod.nonSummer);
  let cost = 0, peakKwh = 0, offPeakKwh = 0, semiPeakKwh = 0;
  dailyData.forEach(hour => {
    const hourNum = parseInt(hour.time.split(':')[0]);
    const kwh = hour.power / 1000;
    if (planType === 'twoPeriod') {
      if (hourNum >= 7 && hourNum < 22) peakKwh += kwh; else offPeakKwh += kwh;
    } else {
      if (hourNum >= 7 && hourNum < 22) { 
        if (hourNum >= 15 && hourNum < 20) semiPeakKwh += kwh; 
        else peakKwh += kwh; 
      } else offPeakKwh += kwh;
    }
  });
  cost = planType === 'twoPeriod' 
    ? peakKwh * rates.peak + offPeakKwh * rates.offPeak 
    : peakKwh * rates.peak + semiPeakKwh * rates.semiPeak + offPeakKwh * rates.offPeak;
  return { totalCost: Math.round(cost * 100) / 100, peakKwh, offPeakKwh, semiPeakKwh, rates };
};

const generateDailyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const isDaytime = i >= 6 && i <= 18;
    const baseLoad = 150 + Math.sin((i - 6) * Math.PI / 12) * 80;
    const solarPower = isDaytime ? Math.max(0, 120 * Math.sin((i - 6) * Math.PI / 12)) : 0;
    const load = Math.max(50, baseLoad + (Math.random() - 0.5) * 40);
    data.push({ 
      time: i.toString().padStart(2, '0') + ':00', 
      power: Math.round(load * 10) / 10, 
      solar: Math.round(solarPower * 10) / 10, 
      taipower: Math.max(0, Math.round((load - solarPower) * 10) / 10), 
      battery: solarPower > load ? Math.round((solarPower - load) * 0.5 * 10) / 10 : -Math.round(Math.max(0, load - solarPower) * 0.3 * 10) / 10 
    });
  }
  return data;
};


const styles = {
  loginBg: { background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #1e1e32 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loginBox: { width: '100%', maxWidth: '440px', backgroundColor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '48px', boxShadow: '0 25px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.1)' },
  logoIcon: { width: '80px', height: '80px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px', boxShadow: '0 10px 40px rgba(255,215,0,0.3)' },
  logoText: { fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(90deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: '4px' },
  logoSub: { textAlign: 'center', fontSize: '12px', color: '#a0a0a0', letterSpacing: '3px', marginBottom: '32px' },
  input: { width: '100%', padding: '16px 20px', backgroundColor: '#12121a', border: '2px solid #2a2a3e', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', transition: 'all 0.3s' },
  inputFocus: { borderColor: '#FFD700', boxShadow: '0 0 0 4px rgba(255,215,0,0.1)' },
  button: { width: '100%', padding: '18px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#0a0a0f', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(255,215,0,0.3)' },
  errorBox: { backgroundColor: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '20px', color: '#ff5252', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  demoBox: { backgroundColor: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '12px', padding: '16px', marginTop: '24px' },
  demoTitle: { fontSize: '12px', color: '#00d4ff', marginBottom: '8px', fontWeight: '600' },
  demoText: { fontSize: '12px', color: '#a0a0a0', lineHeight: '1.6' },
  nav: { backgroundColor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #2a2a3e', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '10px' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' },
  navIcon: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  navTitle: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  navSubtitle: { fontSize: '11px', color: '#a0a0a0' },
  navLink: { padding: '12px 16px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', color: '#a0a0a0', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' },
  navLinkActive: { backgroundColor: 'rgba(255,215,0,0.1)', color: '#FFD700' },
  main: { padding: '24px', maxWidth: '1600px', margin: '0 auto' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  pageSubtitle: { fontSize: '13px', color: '#a0a0a0', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: { backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', border: '1px solid #2a2a3e', display: 'flex', alignItems: 'center', gap: '16px' },
  statIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: '13px', color: '#a0a0a0', marginTop: '4px' },
  card: { backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', border: '1px solid #2a2a3e', marginBottom: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  powerCircle: { width: '100px', height: '100px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '3px solid', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', flexShrink: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', borderBottom: '2px solid #2a2a3e', color: '#a0a0a0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  td: { padding: '16px', borderBottom: '1px solid #2a2a3e', fontSize: '14px', color: '#fff' },
  badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  select: { padding: '10px 14px', backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer' },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (user) { 
      const userData = { ...user }; 
      delete userData.password;
      login(userData); 
      navigate('/dashboard'); 
    }
    else { setError('帳號或密碼錯誤，請重新輸入'); }
    setLoading(false);
  };

  return (
    <div style={styles.loginBg}>
      <div style={styles.loginBox}>
        <div style={styles.logoIcon}>⚡</div>
        <div style={styles.logoText}>台灣微網科技</div>
        <div style={styles.logoSub}>ENERGY MANAGEMENT SYSTEM</div>
        
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="請輸入帳號"
            style={{...styles.input, ...(focused === 'email' ? styles.inputFocus : {})}}
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required />
          
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼"
            style={{...styles.input, ...(focused === 'password' ? styles.inputFocus : {})}}
            onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} required />
          
          {error ? <div style={styles.errorBox}><span>⚠️</span> {error}</div> : null}
          
          <button type="submit" style={{...styles.button, opacity: loading ? 0.8 : 1}} disabled={loading}>
            {loading ? '登入中...' : '登入系統'}
          </button>
        </form>
        
        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>📋 測試帳號</div>
          <div style={styles.demoText}>帳號：admin@taiwanmicrogrid.com<br/>密碼：Demo1234!</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyData] = useState(generateDailyData);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const currentData = dailyData[currentTime.getHours()] || { power: 0, solar: 0, taipower: 0, battery: 0 };
  const totalDaily = dailyData.reduce((sum, h) => sum + h.power, 0);
  const totalCost = calculateCost(dailyData, 'twoPeriod');

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'taipower': return '⚡';
      case 'solar': return '☀️';
      case 'battery': return '🔋';
      case 'load': return '⚙️';
      default: return '📱';
    }
  };

  const getDeviceTypeName = (type) => {
    switch(type) {
      case 'taipower': return '台電';
      case 'solar': return '太陽能';
      case 'battery': return '儲能';
      case 'load': return '負載';
      default: return type;
    }
  };

  const getDeviceColor = (type) => {
    switch(type) {
      case 'taipower': return { bg: 'rgba(255,215,0,0.15)', color: '#FFD700' };
      case 'solar': return { bg: 'rgba(76,175,80,0.15)', color: '#4CAF50' };
      case 'battery': return { bg: 'rgba(33,150,243,0.15)', color: '#2196F3' };
      case 'load': return { bg: 'rgba(255,87,34,0.15)', color: '#FF5722' };
      default: return { bg: 'rgba(160,160,160,0.15)', color: '#a0a0a0' };
    }
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#fff', fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', Arial"}}>
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navIcon}>⚡</div>
          <div><div style={styles.navTitle}>台灣微網科技</div><div style={styles.navSubtitle}>用電管理系統</div></div>
        </div>
        <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
          {[
            {key: 'overview', label: '🏠', name: '總覽'},
            {key: 'power', label: '⚡', name: '電力'},
            {key: 'devices', label: '📱', name: '設備'},
            {key: 'analysis', label: '📊', name: '分析'},
            {key: 'cost', label: '💰', name: '電費'},
            {key: 'export', label: '📤', name: '匯出'}
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} 
              style={{...styles.navLink, ...(activeTab === tab.key ? styles.navLinkActive : {})}}>
              {tab.label} {tab.name}
            </button>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#12121a', borderRadius: '8px'}}>
          <div style={{width: '32px', height: '32px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>👨‍💼</div>
          <div><div style={{fontSize: '13px', fontWeight: '600'}}>管理員</div><div style={{fontSize: '11px', color: '#a0a0a0'}}>台灣微網科技</div></div>
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'overview' && (
          <>
            <h1 style={styles.pageTitle}>📊 系統總覽 <span style={{fontSize: '14px', color: '#a0a0a0', fontWeight: 'normal'}}>{currentTime.toLocaleString('zh-TW', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span></h1>
            <p style={styles.pageSubtitle}>即時監控工廠用電狀況與設備運行資訊</p>
            
            <div style={styles.grid}>
              <div style={{...styles.statCard, borderLeft: '4px solid #FFD700'}}><div style={{...styles.statIcon, backgroundColor: 'rgba(255,215,0,0.1)'}}>⚡</div><div><div style={{...styles.statValue, color: '#FFD700'}}>{currentData.power.toFixed(1)}</div><div style={styles.statLabel}>目前負載 (kW)</div></div></div>
              <div style={{...styles.statCard, borderLeft: '4px solid #4CAF50'}}><div style={{...styles.statIcon, backgroundColor: 'rgba(76,175,80,0.1)'}}>☀️</div><div><div style={{...styles.statValue, color: '#4CAF50'}}>{currentData.solar.toFixed(1)}</div><div style={styles.statLabel}>太陽能發電 (kW)</div></div></div>
              <div style={{...styles.statCard, borderLeft: '4px solid #FFD700'}}><div style={{...styles.statIcon, backgroundColor: 'rgba(255,215,0,0.1)'}}>🔌</div><div><div style={styles.statValue}>{currentData.taipower.toFixed(1)}</div><div style={styles.statLabel}>台電供電 (kW)</div></div></div>
              <div style={{...styles.statCard, borderLeft: '4px solid #2196F3'}}><div style={{...styles.statIcon, backgroundColor: 'rgba(33,150,243,0.1)'}}>🔋</div><div><div style={{...styles.statValue, color: '#2196F3'}}>{(currentData.battery >= 0 ? '+' : '') + currentData.battery.toFixed(1)}</div><div style={styles.statLabel}>儲能 {currentData.battery >= 0 ? '放電' : '充電'} (kW)</div></div></div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}><span>📈 今日用電趨勢</span><span style={{fontSize: '12px', color: '#a0a0a0'}}>24小時監控</span></div>
              <div style={{ display: 'flex', height: '200px', gap: '3px', alignItems: 'flex-end' }}>
                {dailyData.map((hour, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: Math.min(100, hour.power / 3) + '%', backgroundColor: i === currentTime.getHours() ? '#FFD700' : '#2a2a3e', borderRadius: '3px 3px 0 0', transition: 'all 0.3s', minHeight: '4px' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#a0a0a0' }}><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
            </div>
          </>
        )}

        {activeTab === 'power' && <PowerFlowModule data={currentData} />}

        {activeTab === 'devices' && (
          <div style={styles.card}>
            <DeviceManagementModule devices={MOCK_DEVICES} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>📊 用電分析</div>
            <div style={styles.grid}>
              <div style={styles.statCard}><div style={styles.statValue}>{(totalDaily / 1000).toFixed(1)}</div><div style={styles.statLabel}>今日總用電 (kWh)</div></div>
              <div style={styles.statCard}><div style={{...styles.statValue, color: '#4CAF50'}}>{(dailyData.reduce((s, h) => s + h.solar, 0) / 1000).toFixed(1)}</div><div style={styles.statLabel}>太陽能發電 (kWh)</div></div>
              <div style={styles.statCard}><div style={{...styles.statValue, color: '#00d4ff'}}>{((dailyData.reduce((s, h) => s + h.solar, 0) / totalDaily) * 100).toFixed(1)}%</div><div style={styles.statLabel}>太陽能佔比</div></div>
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>💰 電費試算</div>
            <div style={styles.grid}>
              <div style={styles.statCard}><div style={styles.statValue}>NT$ {totalCost.totalCost.toFixed(0)}</div><div style={styles.statLabel}>今日電費</div></div>
              <div style={styles.statCard}><div style={styles.statValue}>NT$ {(totalCost.totalCost * 30).toFixed(0)}</div><div style={styles.statLabel}>每月預估</div></div>
              <div style={styles.statCard}><div style={styles.statValue}>NT$ {(totalCost.totalCost * 365 / 10000).toFixed(1)}萬</div><div style={styles.statLabel}>每年預估</div></div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>📤 資料匯出</div>
            <div style={styles.grid}>
              <div style={{...styles.statCard, flexDirection: 'column', textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '40px', marginBottom: '16px'}}>📄</div>
                <div style={{fontSize: '16px', marginBottom: '16px'}}>CSV 匯出</div>
                <button onClick={() => { 
                  const headers = ['時間', '負載', '太陽能', '台電', '儲能']; 
                  const rows = dailyData.map(h => [h.time, h.power, h.solar, h.taipower, h.battery]); 
                  const csv = [headers, ...rows].map(r => r.join(',')).join('\n'); 
                  const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'}); 
                  const link = document.createElement('a'); 
                  link.href = URL.createObjectURL(blob); 
                  link.download = '用電資料_' + new Date().toISOString().split('T')[0] + '.csv'; 
                  link.click(); 
                }} style={styles.button}>下載 CSV</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
