// DataAnalysisModule - 專業數據分析模組
import React, { useState } from 'react';

const ChartBar = ({ value, max, label, color, index }) => {
  const height = (value / max) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <div style={{ 
        width: '100%', height: '150px', display: 'flex', alignItems: 'flex-end', 
        justifyContent: 'center', padding: '0 4px'
      }}>
        <div style={{ 
          width: '80%', height: height + '%', backgroundColor: color, 
          borderRadius: '4px 4px 0 0', minHeight: '4px',
          transition: 'height 0.5s ease'
        }} />
      </div>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', textAlign: 'center' }}>{label}</div>
    </div>
  );
};

const StatCard = ({ title, value, unit, change, color, icon }) => (
  <div style={{ 
    backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '20px', 
    border: '1px solid #2a2a3e' 
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', color: '#a0a0a0' }}>{title}</div>
      <div style={{ fontSize: '20px' }}>{icon}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>{value}</span>
      <span style={{ fontSize: '14px', color: '#666' }}>{unit}</span>
    </div>
    {change !== undefined && (
      <div style={{ 
        marginTop: '8px', fontSize: '12px', 
        color: change >= 0 ? '#00e676' : '#ff5252' 
      }}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% 較昨日
      </div>
    )}
  </div>
);

const DataAnalysisModule = ({ dailyData }) => {
  const [timeRange, setTimeRange] = useState('day');
  
  // 計算統計數據 (修正: power 單位為 kW，每小時代表 1 小時，故總和即為 kWh)
  const totalPower = dailyData.reduce((sum, h) => sum + h.power, 0); // kWh (24小時加總)
  const totalPowerKwh = totalPower; // 直接使用，無需除以 1000
  const avgPower = totalPower / 24; // 平均功率 kW
  const maxPower = Math.max(...dailyData.map(h => h.power));
  const minPower = Math.min(...dailyData.filter(h => h.power > 0).map(h => h.power));
  const peakHour = dailyData.find(h => h.power === maxPower)?.time || '--';
  
  // 太陽能統計 (發電量 kWh)
  const totalSolar = dailyData.reduce((sum, h) => sum + h.solar, 0);
  const solarCoverage = totalPower > 0 ? (totalSolar / totalPower * 100) : 0;
  
  // 月份資料模擬
  const monthlyData = [
    { month: '1月', power: 3200 },
    { month: '2月', power: 2800 },
    { month: '3月', power: 3100 },
    { month: '4月', power: 3500 },
    { month: '5月', power: 4200 },
    { month: '6月', power: 4800 },
  ];
  
  const maxMonthly = Math.max(...monthlyData.map(m => m.power));

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* 標題 */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #2a2a3e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            backgroundColor: '#9C27B020', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '20px'
          }}>📊</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>用電分析</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Data Analysis</div>
          </div>
        </div>
        
        {/* 時間範圍篩選 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['day', 'week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                backgroundColor: timeRange === range ? '#FFD700' : '#1a1a2e',
                color: timeRange === range ? '#0a0a0f' : '#a0a0a0',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {range === 'day' ? '日' : range === 'week' ? '週' : range === 'month' ? '月' : '年'}
            </button>
          ))}
        </div>
      </div>
      
      {/* 統計卡片 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', marginBottom: '24px'
      }}>
        <StatCard title="今日總用電" value={totalPowerKwh.toFixed(1)} unit="kWh" change={5.2} color="#FFD700" icon="⚡" />
        <StatCard title="平均功率" value={avgPower.toFixed(0)} unit="kW" change={-2.1} color="#4CAF50" icon="📈" />
        <StatCard title="尖峰功率" value={maxPower.toFixed(0)} unit="kW" change={8.5} color="#FF5722" icon="🔺" />
        <StatCard title="太陽能覆蓋率" value={solarCoverage.toFixed(1)} unit="%" change={12.3} color="#2196F3" icon="☀️" />
      </div>
      
      {/* 24小時趨勢圖 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e', marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
          📈 24小時用電趨勢
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '4px' }}>
          {dailyData.map((hour, i) => (
            <ChartBar 
              key={i} 
              value={hour.power} 
              max={maxPower} 
              label={i % 4 === 0 ? hour.time : ''} 
              color={hour.power === maxPower ? '#FF5722' : '#4CAF50'}
              index={i}
            />
          ))}
        </div>
      </div>
      
      {/* 月度趨勢 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
          📅 月度用電趨勢
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '12px' }}>
          {monthlyData.map((month, i) => (
            <ChartBar 
              key={i} 
              value={month.power} 
              max={maxMonthly} 
              label={month.month} 
              color="#2196F3"
              index={i}
            />
          ))}
        </div>
      </div>
      
      {/* 詳細資訊 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', marginTop: '24px'
      }}>
        <div style={{ 
          backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '20px', 
          border: '1px solid #2a2a3e' 
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>📌 尖峰分析</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>尖峰時間</span>
            <span style={{ color: '#fff' }}>{peakHour}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>尖峰功率</span>
            <span style={{ color: '#FF5722' }}>{maxPower.toFixed(1)} kW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>最低功率</span>
            <span style={{ color: '#4CAF50' }}>{minPower.toFixed(1)} kW</span>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '20px', 
          border: '1px solid #2a2a3e' 
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>☀️ 太陽能效益</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>今日發電量</span>
            <span style={{ color: '#4CAF50' }}>{totalSolar.toFixed(1)} kWh</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>自發自用</span>
            <span style={{ color: '#2196F3' }}>{solarCoverage.toFixed(1)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>預估節費</span>
            <span style={{ color: '#FFD700' }}>NT$ {(totalSolar * 4.46 / 1000).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisModule;
