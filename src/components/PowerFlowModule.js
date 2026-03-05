// PowerFlowModule - 專業電力潮流視覺化元件 (v2.1 Mobile Responsive)
import React from 'react';

// 電力節點元件
const PowerNode = ({ type, power, label, icon, color, size = 'medium', status = 'active' }) => {
  const sizes = { small: 50, medium: 70, large: 85 };
  const s = sizes[size];
  const isCharging = type === 'battery' && power < 0;
  const isDischarging = type === 'battery' && power > 0;
  const isPulsing = status === 'active';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: s + 'px', height: s + 'px', borderRadius: '50%', 
        backgroundColor: color + '20', border: `2px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 30px ${color}30`,
        transition: 'all 0.3s', 
        transform: isPulsing ? 'scale(1)' : 'scale(0.95)',
        animation: isPulsing ? 'pulse 2s infinite' : 'none',
      }}>
        <span style={{ fontSize: s * 0.35 }}>{icon}</span>
        <span style={{ fontSize: s * 0.12, fontWeight: 'bold', color: color, marginTop: '2px' }}>{label}</span>
        <span style={{ fontSize: s * 0.14, fontWeight: 'bold', color: '#fff' }}>{Math.abs(power).toFixed(1)}</span>
      </div>
      {type === 'battery' && (
        <div style={{ fontSize: '10px', color: isCharging ? '#00e676' : isDischarging ? '#ff9100' : '#a0a0a0' }}>
          {isCharging ? '⚡ 充電' : isDischarging ? '🔓 放電' : '💤 待機'}
        </div>
      )}
      {type === 'solar' && (
        <div style={{ fontSize: '10px', color: '#4CAF50' }}>☀️ {power > 0 ? Math.round(power/150*100)+'%' : '待機'}</div>
      )}
      {type === 'taipower' && (
        <div style={{ fontSize: '10px', color: '#FFD700' }}>⚡ 供電中</div>
      )}
    </div>
  );
};

// 流動箭頭元件 - 手機優化
const FlowArrow = ({ power, color, label = '' }) => {
  if (!power || power <= 0) return null;
  const width = Math.min(Math.max(power / 20, 40), 100);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
      <div style={{ 
        width: width + 'px', height: '4px', backgroundColor: color + '40', 
        borderRadius: '2px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', 
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: 'flowSlide 1.5s infinite linear'
        }} />
      </div>
      <div style={{ fontSize: '10px', color: color, marginTop: '4px', fontWeight: '600' }}>
        {power.toFixed(1)}kW {label}
      </div>
    </div>
  );
};

// 電力儀表板卡片 - 手機優化
const PowerGauge = ({ value, max, label, color, unit = 'kW' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div style={{ 
      backgroundColor: '#1a1a2e', borderRadius: '10px', padding: '12px', 
      border: '1px solid #2a2a3e', minWidth: '80px', flex: '1 1 calc(50% - 8px)'
    }}>
      <div style={{ fontSize: '10px', color: '#a0a0a0', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: color }}>{value.toFixed(1)}</span>
        <span style={{ fontSize: '10px', color: '#666' }}>{unit}</span>
      </div>
      <div style={{ height: '4px', backgroundColor: '#2a2a3e', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: percentage + '%', backgroundColor: color, borderRadius: '2px' }} />
      </div>
    </div>
  );
};

// 即時功率圖表 - 手機優化
const MiniPowerChart = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) return null;
  const maxPower = Math.max(...hourlyData.map(d => d.power), 1);
  
  return (
    <div style={{ backgroundColor: '#12121a', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
      <div style={{ fontSize: '11px', color: '#a0a0a0', marginBottom: '8px' }}>📈 24h趨勢</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '40px' }}>
        {hourlyData.slice(0, 24).map((d, i) => (
          <div key={i} style={{ 
            flex: 1, height: Math.max((d.power / maxPower * 40), 2) + 'px',
            backgroundColor: d.solar > d.power ? '#4CAF50' : '#FFD700',
            borderRadius: '1px', minHeight: '2px'
          }} />
        ))}
      </div>
    </div>
  );
};

// 主要電力潮流模組
const PowerFlowModule = ({ data, hourlyData = [] }) => {
  const totalLoad = data.power || 0;
  const solarPower = data.solar || 0;
  const taipowerPower = data.taipower || 0;
  const batteryPower = data.battery || 0;
  
  const solarToLoad = Math.min(solarPower, totalLoad);
  const batteryToLoad = batteryPower > 0 ? Math.min(batteryPower, totalLoad - solarToLoad) : 0;
  const taipowerToLoad = Math.max(0, totalLoad - solarToLoad - batteryToLoad);
  
  const selfConsumptionRate = totalLoad > 0 ? (solarToLoad / totalLoad * 100) : 0;

  return (
    <div style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid #2a2a3e', marginBottom: '16px' }}>
      <style>{`
        @keyframes flowSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
      `}</style>
      
      {/* 標題 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2a2a3e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFD70020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>電力潮流</div>
            <div style={{ fontSize: '10px', color: '#a0a0a0' }}>Power Flow v2.1</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#00e67615', padding: '4px 8px', borderRadius: '12px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676' }} />
          <span style={{ fontSize: '10px', color: '#00e676' }}>即時</span>
        </div>
      </div>
      
      {/* 電力流向圖 - 手機版垂直排列 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
        
        {/* 上方：供電來源 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <PowerNode type="taipower" power={taipowerPower} label="台電" icon="⚡" color="#FFD700" size="medium" />
          <PowerNode type="solar" power={solarPower} label="太陽能" icon="☀️" color="#4CAF50" size="medium" />
          {batteryPower !== 0 && <PowerNode type="battery" power={batteryPower} label="儲能" icon="🔋" color="#2196F3" size="small" />}
        </div>
        
        {/* 中間：流向箭頭 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <FlowArrow power={taipowerToLoad} color="#FFD700" />
          <FlowArrow power={solarToLoad} color="#4CAF50" />
          {batteryToLoad > 0 && <FlowArrow power={batteryToLoad} color="#2196F3" label="放電" />}
        </div>
        
        {/* 下方：負載 */}
        <PowerNode type="load" power={totalLoad} label="總負載" icon="🏭" color="#FF5722" size="medium" />
        
        {/* 自發自用率 */}
        <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '4px', backgroundColor: '#12121a', padding: '6px 12px', borderRadius: '6px' }}>
          自發自用: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{selfConsumptionRate.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* 功率儀表板 - 2x2 網格 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a2a3e' }}>
        <PowerGauge value={taipowerPower} max={200} label="台電" color="#FFD700" />
        <PowerGauge value={solarPower} max={150} label="太陽能" color="#4CAF50" />
        <PowerGauge value={Math.abs(batteryPower)} max={50} label="儲能" color="#2196F3" />
        <PowerGauge value={totalLoad} max={300} label="負載" color="#FF5722" />
      </div>
      
      {/* 今日統計 + 圖表 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
        <div style={{ backgroundColor: '#12121a', borderRadius: '10px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#a0a0a0', marginBottom: '6px' }}>📊 今日統計</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px' }}>
            <div><span style={{ color: '#666' }}>用電:</span> <span style={{ color: '#fff' }}>{(hourlyData.reduce((s,d)=>s+d.power,0)).toFixed(1)} kWh</span></div>
            <div><span style={{ color: '#666' }}>太陽能:</span> <span style={{ color: '#4CAF50' }}>{(hourlyData.reduce((s,d)=>s+d.solar,0)).toFixed(1)} kWh</span></div>
          </div>
        </div>
        <MiniPowerChart hourlyData={hourlyData} />
      </div>
      
      {/* 詳細資訊 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', fontSize: '10px' }}>
        <div style={{ backgroundColor: '#12121a', borderRadius: '8px', padding: '8px' }}>
          <div style={{ color: '#666' }}>發電效率</div>
          <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>{solarPower>0?(solarPower/150*100).toFixed(1):0}%</div>
        </div>
        <div style={{ backgroundColor: '#12121a', borderRadius: '8px', padding: '8px' }}>
          <div style={{ color: '#666' }}>預估電費</div>
          <div style={{ color: '#FF5722', fontWeight: 'bold' }}>NT${(taipowerPower*4.5/1000).toFixed(2)}/h</div>
        </div>
      </div>
    </div>
  );
};

export default PowerFlowModule;
