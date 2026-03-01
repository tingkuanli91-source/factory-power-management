import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// ==================== 認證上下文 ====================
const AuthContext = createContext(null);

// 模擬用戶數據庫
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@taiwanmicrogrid.com',
    password: 'Demo1234!',
    companyName: '台灣微網科技股份有限公司',
    role: 'admin',
    name: '管理員'
  }
];

// 模擬設備數據
const MOCK_DEVICES = [
  { id: '1', name: '台電進線', type: 'taipower', location: '總配電室', status: 'active', power: 150 },
  { id: '2', name: '太陽能A區', type: 'solar', location: '屋頂', status: 'active', power: 85 },
  { id: '3', name: '太陽能B區', type: 'solar', location: '屋頂', status: 'active', power: 62 },
  { id: '4', name: '儲能系統', type: 'battery', location: '地下室', status: 'active', power: -35 },
  { id: '5', name: '工廠主負載', type: 'load', location: '生產線', status: 'active', power: 180 },
  { id: '6', name: '辦公區', type: 'load', location: '辦公大樓', status: 'active', power: 45 },
  { id: '7', name: '冷氣設備', type: 'load', location: '全區', status: 'active', power: 55 },
];

// 台灣電費計算
const TAIWAN_ELECTRICITY = {
  twoPeriod: {
    summer: { peak: 4.46, offPeak: 2.12 },
    nonSummer: { peak: 3.97, offPeak: 1.87 }
  },
  threePeriod: {
    summer: { peak: 4.46, semiPeak: 3.52, offPeak: 2.12 },
    nonSummer: { peak: 3.97, semiPeak: 3.16, offPeak: 1.87 }
  }
};

const calculateElectricityCost = (dailyData, planType = 'twoPeriod') => {
  const isSummer = new Date().getMonth() >= 5 && new Date().getMonth() <= 8;
  const rates = planType === 'twoPeriod' 
    ? (isSummer ? TAIWAN_ELECTRICITY.twoPeriod.summer : TAIWAN_ELECTRICITY.twoPeriod.nonSummer)
    : (isSummer ? TAIWAN_ELECTRICITY.threePeriod.summer : TAIWAN_ELECTRICITY.threePeriod.nonSummer);
  
  let cost = 0, peakKwh = 0, offPeakKwh = 0, semiPeakKwh = 0;
  
  dailyData.forEach(hour => {
    const hourNum = parseInt(hour.time.split(':')[0]);
    const kwh = hour.power / 1000;
    
    if (planType === 'twoPeriod') {
      if (hourNum >= 7 && hourNum < 22) peakKwh += kwh;
      else offPeakKwh += kwh;
    } else {
      if (hourNum >= 7 && hourNum < 22) {
        if (hourNum >= 15 && hourNum < 20) semiPeakKwh += kwh;
        else peakKwh += kwh;
      } else offPeakKwh += kwh;
    }
  });
  
  if (planType === 'twoPeriod') {
    cost = peakKwh * rates.peak + offPeakKwh * rates.offPeak;
  } else {
    cost = peakKwh * rates.peak + semiPeakKwh * rates.semiPeak + offPeakKwh * rates.offPeak;
  }
  
  return { totalCost: Math.round(cost * 100) / 100, peakKwh: Math.round(peakKwh * 100) / 100, offPeakKwh: Math.round(offPeakKwh * 100) / 100, semiPeakKwh: Math.round(semiPeakKwh * 100) / 100, rates };
};

const generateDailyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const isDaytime = i >= 6 && i <= 18;
    const baseLoad = 150 + Math.sin((i - 6) * Math.PI / 12) * 80;
    const solarPower = isDaytime ? Math.max(0, 120 * Math.sin((i - 6) * Math.PI / 12)) : 0;
    const load = Math.max(50, baseLoad + (Math.random() - 0.5) * 40);
    data.push({ time: `${i.toString().padStart(2, '0')}:00`, power: Math.round(load * 10) / 10, solar: Math.round(solarPower * 10) / 10, taipower: Math.max(0, Math.round((load - solarPower) * 10) / 10), battery: solarPower > load ? Math.round((solarPower - load) * 0.5 * 10) / 10 : -Math.round(Math.max(0, load - solarPower) * 0.3 * 10) / 10 });
  }
  return data;
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#fff', fontFamily: "'Microsoft JhengHei', 'Noto Sans TC', Arial, sans-serif" },
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', padding: '20px' },
  loginBox: { width: '100%', maxWidth: '420px', backgroundColor: '#16213e', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  header: { textAlign: 'center', marginBottom: '30px' },
  logo: { fontSize: '48px', marginBottom: '10px' },
  title: { fontSize: '24px', color: '#FFD700', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: '#888' },
  input: { width: '100%', padding: '14px 16px', marginBottom: '15px', backgroundColor: '#0f3460', border: '2px solid #1a1a2e', borderRadius: '10px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', padding: '14px', backgroundColor: '#FFD700', color: '#0a0a0f', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
  nav: { backgroundColor: '#16213e', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '10px' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLinks: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  navLink: { padding: '8px 12px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', color: '#888', fontSize: '12px', cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap' },
  navLinkActive: { backgroundColor: '#FFD700', color: '#0a0a0f' },
  main: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  card: { backgroundColor: '#16213e', borderRadius: '16px', padding: '25px', marginBottom: '20px' },
  cardTitle: { fontSize: '18px', color: '#FFD700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  statCard: { backgroundColor: '#0f3460', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statValue: { fontSize: '24px', fontWeight: 'bold', color: '#FFD700' },
  statLabel: { fontSize: '12px', color: '#888', marginTop: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', overflowX: 'auto', display: 'block' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #0f3460', color: '#888', fontSize: '12px', whiteSpace: 'nowrap' },
  td: { padding: '12px', borderBottom: '1px solid #0f3460', fontSize: '14px', whiteSpace: 'nowrap' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  badgeActive: { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50' },
  badgeInactive: { backgroundColor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
  select: { padding: '10px 15px', backgroundColor: '#0f3460', border: '1px solid #1a1a2e', borderRadius: '8px', color: '#fff', fontSize: '14px', marginRight: '10px' },
  exportBtn: { padding: '8px 16px', backgroundColor: '#0f3460', border: '1px solid #FFD700', borderRadius: '8px', color: '#FFD700', fontSize: '13px', cursor: 'pointer', marginLeft: '10px' },
  circle: { border: '3px solid', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      login(userWithoutPassword);
      navigate('/dashboard');
    } else {
      setError('帳號或密碼錯誤');
    }
    setLoading(false);
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <div style={styles.logo}>⚡</div>
          <h1 style={styles.title}>台灣微網科技</h1>
          <p style={styles.subtitle}>工廠用電管理系統</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="電子郵件" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
          {error && <p style={{ color: '#f44336', fontSize: '13px', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>{loading ? '登入中...' : '登入'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>測試帳號: admin@taiwanmicrogrid.com<br/>測試密碼: Demo1234!</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyData] = useState(generateDailyData);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentData = dailyData[currentHour] || { power: 0, solar: 0, taipower: 0, battery: 0 };
  const totalDaily = dailyData.reduce((sum, h) => sum + h.power, 0);
  const totalSolar = dailyData.reduce((sum, h) => sum + h.solar, 0);
  const totalCost = calculateElectricityCost(dailyData, 'twoPeriod');

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={{ fontSize: '28px' }}>⚡</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFD700' }}>台灣微網科技</div>
            <div style={{ fontSize: '10px', color: '#888' }}>用電管理系統</div>
          </div>
        </div>
        <div style={styles.navLinks}>
          {[{key: 'overview', label: '🏠 總覽'}, {key: 'power', label: '⚡ 電力'}, {key: 'devices', label: '📱 設備'}, {key: 'analysis', label: '📊 分析'}, {key: 'cost', label: '💰 電費'}, {key: 'export', label: '📤 匯出'}].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{...styles.navLink, ...(activeTab === tab.key ? styles.navLinkActive : {})}}>{tab.label}</button>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>{currentTime.toLocaleString('zh-TW')}</div>
      </nav>
      <main style={styles.main}>
        {activeTab === 'overview' && (
          <>
            <div style={styles.grid}>
              <div style={styles.statCard}><div style={styles.statValue}>{currentData.power.toFixed(1)}</div><div style={styles.statLabel}>目前負載 (kW)</div></div>
              <div style={styles.statCard}><div style={{...styles.statValue, color: '#4CAF50'}}>{currentData.solar.toFixed(1)}</div><div style={styles.statLabel}>太陽能發電 (kW)</div></div>
              <div style={styles.statCard}><div style={{...styles.statValue, color: '#FFD700'}}>{currentData.taipower.toFixed(1)}</div><div style={styles.statLabel}>台電供電 (kW)</div></div>
              <div style={styles.statCard}><div style={{...styles.statValue, color: '#2196F3'}}>{currentData.battery >= 0 ? '+' : ''}{currentData.battery.toFixed(1)}</div><div style={styles.statLabel}>儲能 {currentData.battery >= 0 ? '放電' : '充電'} (kW)</div></div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 今日累積</div>
              <div style={styles.grid}>
                <div style={styles.statCard}><div style={styles.statValue}>{(totalDaily / 1000).toFixed(2)}</div><div style={styles.statLabel}>總用電度數 (kWh)</div></div>
                <div style={styles.statCard}><div style={{...styles.statValue, color: '#4CAF50'}}>{(totalSolar / 1000).toFixed(2)}</div><div style={styles.statLabel}>太陽能發電度數 (kWh)</div></div>
                <div style={styles.statCard}><div style={styles.statValue}>{(totalSolar / totalDaily * 100).toFixed(1)}%</div><div style={styles.statLabel}>太陽能佔比</div></div>
                <div style={styles.statCard}><div style={{...styles.statValue, color: '#4CAF50'}}>NT$ {totalCost.totalCost.toFixed(0)}</div><div style={styles.statLabel}>今日預估電費</div></div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'power' && <PowerFlowModule data={currentData} dailyData={dailyData} />}
        {activeTab === 'devices' && <DevicesModule devices={MOCK_DEVICES} />}
        {activeTab === 'analysis' && <AnalysisModule dailyData={dailyData} />}
        {activeTab === 'cost' && <CostModule dailyData={dailyData} />}
        {activeTab === 'export' && <ExportModule dailyData={dailyData} />}
      </main>
    </div>
  );
}

function PowerFlowModule({ data, dailyData }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>⚡ 即時電力潮流</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '30px 0', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ ...styles.circle, backgroundColor: '#FFD700', width: 100, height: 100, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '30px' }}>⚡</span><span style={{ fontSize: '12px', fontWeight: 'bold' }}>台電</span><span style={{ fontSize: '14px', color: '#333' }}>{data.taipower.toFixed(1)} kW</span>
          </div>
          <div style={{ ...styles.circle, backgroundColor: '#4CAF50', width: 80, height: 80, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '24px' }}>☀️</span><span style={{ fontSize: '10px', fontWeight: 'bold' }}>太陽能</span><span style={{ fontSize: '12px', color: '#fff' }}>{data.solar.toFixed(1)} kW</span>
          </div>
        </div>
        <div style={{ fontSize: '40px', color: '#FFD700' }}>→</div>
        <div style={{ ...styles.circle, backgroundColor: '#FF5722', width: 120, height: 120, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '36px' }}>🏭</span><span style={{ fontSize: '14px', fontWeight: 'bold' }}>總負載</span><span style={{ fontSize: '18px', color: '#fff' }}>{data.power.toFixed(1)} kW</span>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>📈 24小時用電趨勢</div>
        <div style={{ display: 'flex', height: '150px', gap: '2px', alignItems: 'flex-end' }}>
          {dailyData.map((hour, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80%', height: `${Math.min(100, hour.power / 3)}%`, backgroundColor: i === new Date().getHours() ? '#FFD700' : '#0f3460', borderRadius: '2px 2px 0 0' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '5px' }}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>
    </div>
  );
}

function DevicesModule({ devices }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📱 設備列表</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>設備名稱</th><th style={styles.th}>類型</th><th style={styles.th}>位置</th><th style={styles.th}>功率</th><th style={styles.th}>狀態</th></tr></thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.id}>
                <td style={styles.td}><span style={{ marginRight: '8px' }}>{device.type === 'taipower' ? '⚡' : device.type === 'solar' ? '☀️' : device.type === 'battery' ? '🔋' : '⚙️'}</span>{device.name}</td>
                <td style={styles.td}><span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', backgroundColor: device.type === 'taipower' ? 'rgba(255,215,0,0.2)' : device.type === 'solar' ? 'rgba(76,175,80,0.2)' : device.type === 'battery' ? 'rgba(33,150,243,0.2)' : 'rgba(255,87,34,0.2)', color: device.type === 'taipower' ? '#FFD700' : device.type === 'solar' ? '#4CAF50' : device.type === 'battery' ? '#2196F3' : '#FF5722' }}>{device.type === 'taipower' ? '台電' : device.type === 'solar' ? '太陽能' : device.type === 'battery' ? '儲能' : '負載'}</span></td>
                <td style={styles.td}>{device.location}</td>
                <td style={styles.td}>{device.power} kW</td>
                <td style={styles.td}><span style={{ ...styles.badge, ...(device.status === 'active' ? styles.badgeActive : styles.badgeInactive) }}>{device.status === 'active' ? '運作中' : '停止'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalysisModule({ dailyData }) {
  const [period, setPeriod] = useState('daily');
  const monthlyData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, power: 150 + Math.random() * 100 + Math.sin(i / 5) * 30, solar: Math.random() * 80 }));
  const yearlyData = Array.from({ length: 12 }, (_, i) => ({ month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][i], power: 4000 + Math.random() * 2000 + (i >= 5 && i <= 8 ? 1500 : 0), solar: 800 + Math.random() * 400 }));
  const currentData = period === 'daily' ? dailyData : period === 'monthly' ? monthlyData : yearlyData;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📊 用電分析<select style={styles.select} value={period} onChange={(e) => setPeriod(e.target.value)}><option value="daily">每日</option><option value="monthly">每月</option><option value="yearly">每年</option></select></div>
      <div style={styles.grid}>
        <div style={styles.statCard}><div style={styles.statValue}>{period === 'daily' ? (dailyData.reduce((s, h) => s + h.power, 0) / 1000).toFixed(1) : period === 'monthly' ? monthlyData.reduce((s, d) => s + d.power, 0).toFixed(0) : yearlyData.reduce((s, d) => s + d.power, 0).toFixed(0)}</div><div style={styles.statLabel}>{period === 'daily' ? '今日' : period === 'monthly' ? '本月' : '本年'} 總用電 (kWh)</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#4CAF50'}}>{period === 'daily' ? (dailyData.reduce((s, h) => s + h.solar, 0) / 1000).toFixed(1) : period === 'monthly' ? monthlyData.reduce((s, d) => s + d.solar, 0).toFixed(0) : yearlyData.reduce((s, d) => s + d.solar, 0).toFixed(0)}</div><div style={styles.statLabel}>太陽能發電 (kWh)</div></div>
      </div>
    </div>
  );
}

function CostModule({ dailyData }) {
  const [planType, setPlanType] = useState('twoPeriod');
  const cost = calculateElectricityCost(dailyData, planType);
  const monthlyCost = cost.totalCost * 30;
  const yearlyCost = cost.totalCost * 365;
  const isSummer = new Date().getMonth() >= 5 && new Date().getMonth() <= 8;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>💰 電費試算<select style={styles.select} value={planType} onChange={(e) => setPlanType(e.target.value)}><option value="twoPeriod">高壓兩段式</option><option value="threePeriod">高壓三段式</option></select></div>
      <div style={{ backgroundColor: '#0f3460', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>📅 台灣電力公司電費表 (<span style={{ color: isSummer ? '#FF9800' : '#4CAF50' }}>{isSummer ? '夏季 (6-9月)' : '非夏季'}</span>)</div>
        <div style={styles.grid}>
          <div style={styles.statCard}><div style={styles.statValue}>{cost.totalCost.toFixed(0)}</div><div style={styles.statLabel}>今日電費</div></div>
          <div style={styles.statCard}><div style={styles.statValue}>{monthlyCost.toFixed(0)}</div><div style={styles.statLabel}>每月預估</div></div>
          <div style={styles.statCard}><div style={styles.statValue}>{(yearlyCost / 10000).toFixed(1)}萬</div><div style={styles.statLabel}>每年預估</div></div>
        </div>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>時段</th><th style={styles.th}>單價</th><th style={styles.th}>用電度數</th><th style={styles.th}>小計</th></tr></thead>
        <tbody>
          {planType === 'twoPeriod' ? (
            <>
              <tr><td style={{...styles.td, color: '#f44336'}}>尖峰 07:30-22:30</td><td style={styles.td}>{cost.rates.peak} 元/度</td><td style={styles.td}>{cost.peakKwh.toFixed(1)} kWh</td><td style={styles.td}>NT$ {(cost.peakKwh * cost.rates.peak).toFixed(0)}</td></tr>
              <tr><td style={{...styles.td, color: '#4CAF50'}}>離峰 22:30-07:30</td><td style={styles.td}>{cost.rates.offPeak} 元/度</td><td style={styles.td}>{cost.offPeakKwh.toFixed(1)} kWh</td><td style={styles.td}>NT$ {(cost.offPeakKwh * cost.rates.offPeak).toFixed(0)}</td></tr>
            </>
          ) : (
            <>
              <tr><td style={{...styles.td, color: '#f44336'}}>尖峰</td><td style={styles.td}>{cost.rates.peak}</td><td style={styles.td}>{cost.peakKwh.toFixed(1)}</td><td style={styles.td}>NT$ {(cost.peakKwh * cost.rates.peak).toFixed(0)}</td></tr>
              <tr><td style={{...styles.td, color: '#FF9800'}}>半尖峰</td><td style={styles.td}>{cost.rates.semiPeak}</td><td style={styles.td}>{cost.semiPeakKwh.toFixed(1)}</td><td style={styles.td}>NT$ {(cost.semiPeakKwh * cost.rates.semiPeak).toFixed(0)}</td></tr>
              <tr><td style={{...styles.td, color: '#4CAF50'}}>離峰</td><td style={styles.td}>{cost.rates.offPeak}</td><td style={styles.td}>{cost.offPeakKwh.toFixed(1)}</td><td style={styles.td}>NT$ {(cost.offPeakKwh * cost.rates.offPeak).toFixed(0)}</td></tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ExportModule({ dailyData }) {
  const exportCSV = () => {
    const headers = ['時間', '負載(kW)', '太陽能(kW)', '台電(kW)', '儲能(kW)'];
    const rows = dailyData.map(h => [h.time, h.power, h.solar, h.taipower, h.battery]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用電資料_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📤 資料匯出</div>
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>📄</div>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>CSV 匯出</div>
          <button style={styles.button} onClick={exportCSV}>下載 CSV</button>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>Excel 匯出</div>
          <button style={{...styles.button, opacity: 0.5}} disabled>即將推出</button>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>📑</div>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>PDF 報告</div>
          <button style={{...styles.button, opacity: 0.5}} disabled>即將推出</button>
        </div>
      </div>
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
