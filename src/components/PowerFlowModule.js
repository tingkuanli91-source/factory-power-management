// PowerFlowModule - 專業電力潮流視覺化元件
import React, { useState, useEffect } from 'react';

// 電力節點元件
const PowerNode = ({ type, power, label, icon, color, size = 'medium', status = 'active' }) => {
  const sizes = { small: 60, medium: 90, large: 120 };
  const s = sizes[size];
  const isCharging = type === 'battery' && power < 0;
  const isDischarging = type === 'battery' && power > 0;
  const isPulsing = status === 'active';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: s + 'px', height: s + 'px', borderRadius: '50%', 
        backgroundColor: color + '20', border: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 10px 40px ${color}40, inset 0 0 20px ${color}10`,
        transition: 'all 0.3s', 
        transform: isPulsing ? 'scale(1)' : 'scale(0.95)',
        animation: isPulsing ? 'pulse 2s infinite' : 'none',
      }}>
        <span style={{ fontSize: s * 0.35 }}>{icon}</span>
        <span style={{ fontSize: s * 0.1, fontWeight: 'bold', color: color, marginTop: '2px' }}>{label}</span>
        <span style={{ fontSize: s * 0.14, fontWeight: 'bold', color: '#fff' }}>{Math.abs(power).toFixed(1)} kW</span>
      </div>
      {type === 'battery' && (
        <div style={{ 
          fontSize: '11px', 
          color: isCharging ? '#00e676' : isDischarging ? '#ff9100' : '#a0a0a0',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {isCharging ? '⚡ 充電中' : isDischarging ? '🔓 放電中' : '💤 待機'}
          <span style={{ fontSize: '10px', color: '#666' }}>
            ({Math.abs(power) > 0 ? Math.round(Math.abs(power) / 50 * 100) : 0}%)
          </span>
        </div>
      )}
      {type === 'solar' && (
        <div style={{ fontSize: '11px', color: '#4CAF50' }}>
          ☀️ 發電中 {power > 0 ? `(${Math.round(power / 150 * 100)}%)` : '(待機)'}
        </div>
      )}
      {type === 'taipower' && (
        <div style={{ fontSize: '11px', color: '#FFD700' }}>
          ⚡ 供電中 {power > 0 ? `(${Math.round(power / 200 * 100)}%)` : ''}
        </div>
      )}
    </div>
  );
};

// 流動箭頭元件
const FlowArrow = ({ power, color, direction = 'right', label = '' }) => {
  if (!power || power <= 0) return null;
  const width = Math.min(Math.max(power / 15, 60), 180);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ 
        width: width + 'px', height: '6px', backgroundColor: color + '40', 
        borderRadius: '3px', position: 'relative', overflow: 'hidden',
        border: `1px solid ${color}60`
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', 
          background: `linear-gradient(90deg, transparent, ${color}, ${color}80, transparent)`,
          animation: 'flowSlide 1.5s infinite linear',
          borderRadius: '3px'
        }} />
      </div>
      <div style={{ 
        fontSize: '11px', color: color, marginTop: '6px', fontWeight: '600',
        backgroundColor: color + '15', padding: '2px 8px', borderRadius: '10px'
      }}>
        {power.toFixed(1)} kW {label && `• ${label}`}
      </div>
    </div>
  );
};

// 電力儀表板卡片
const PowerGauge = ({ value, max, label, color, unit = 'kW' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div style={{ 
      backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '16px', 
      border: '1px solid #2a2a3e', minWidth: '120px'
    }}>
      <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>{value.toFixed(1)}</span>
        <span style={{ fontSize: '12px', color: '#666' }}>{unit}</span>
      </div>
      <div style={{ 
        height: '6px', backgroundColor: '#2a2a3e', borderRadius: '3px', 
        marginTop: '8px', overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', width: percentage + '%', 
          backgroundColor: color, borderRadius: '3px',
          transition: 'width 0.5s ease'
        }} />
      </div>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', textAlign: 'right' }}>
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
};

// 主要電力潮流模組
const PowerFlowModule = ({ data }) => {
  const totalLoad = data.power || 0;
  const solarPower = data.solar || 0;
  const taipowerPower = data.taipower || 0;
  const batteryPower = data.battery || 0;
  
  // 計算流向
  const solarToLoad = Math.min(solarPower, totalLoad);
  const solarToBattery = solarPower > totalLoad ? (solarPower - totalLoad) * 0.8 : 0;
  const batteryToLoad = batteryPower > 0 ? Math.min(batteryPower, totalLoad - solarToLoad) : 0;
  const taipowerToLoad = Math.max(0, totalLoad - solarToLoad - batteryToLoad);
  
  // 自發自用率
  const selfConsumptionRate = totalLoad > 0 ? (solarToLoad / totalLoad * 100) : 0;
  const gridDependency = totalLoad > 0 ? (taipowerToLoad / totalLoad * 100) : 0;

  return (
    <div style={{ 
      backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
      border: '1px solid #2a2a3e', marginBottom: '24px'
    }}>
      <style>{`
        @keyframes flowSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 40px #FFD70040; }
          50% { transform: scale(1.02); box-shadow: 0 15px 50px #FFD70060; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px currentColor; }
          50% { box-shadow: 0 0 25px currentColor; }
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
            backgroundColor: '#FFD70020', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '20px'
          }}>⚡</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>即時電力潮流</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Real-time Power Flow</div>
          </div>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#00e67615', padding: '6px 12px', borderRadius: '20px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', 
            backgroundColor: '#00e676', animation: 'glow 2s infinite' }} />
          <span style={{ fontSize: '12px', color: '#00e676' }}>即時更新</span>
        </div>
      </div>
      
      {/* 電力流向圖 */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
        padding: '30px 0', flexWrap: 'wrap', gap: '30px', position: 'relative'
      }}>
        {/* 左側供電來源 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <PowerNode type="taipower" power={taipowerPower} label="台電" icon="⚡" color="#FFD700" size="large" />
          <PowerNode type="solar" power={solarPower} label="太陽能" icon="☀️" color="#4CAF50" size="large" />
          {batteryPower !== 0 && <PowerNode type="battery" power={batteryPower} label="儲能" icon="🔋" color="#2196F3" size="medium" />}
        </div>
        
        {/* 流向區域 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <FlowArrow power={taipowerToLoad} color="#FFD700" label="供電" />
          <FlowArrow power={solarToLoad} color="#4CAF50" label="供電" />
          {batteryToLoad > 0 && <FlowArrow power={batteryToLoad} color="#2196F3" label="放電" />}
          {solarToBattery > 0 && <FlowArrow power={solarToBattery} color="#2196F3" label="充電" />}
        </div>
        
        {/* 右側負載 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <PowerNode type="load" power={totalLoad} label="總負載" icon="🏭" color="#FF5722" size="large" />
          <div style={{ 
            fontSize: '12px', color: '#a0a0a0', marginTop: '10px', 
            backgroundColor: '#12121a', padding: '10px 15px', borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>自發自用: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{selfConsumptionRate.toFixed(1)}%</span></div>
              <div>台電依賴: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{gridDependency.toFixed(1)}%</span></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 功率流向摘要卡片 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #2a2a3e' 
      }}>
        <PowerGauge value={taipowerPower} max={200} label="台電供電" color="#FFD700" />
        <PowerGauge value={solarPower} max={150} label="太陽能發電" color="#4CAF50" />
        <PowerGauge value={Math.abs(batteryPower)} max={50} label={`儲能 ${batteryPower >= 0 ? '放電' : '充電'}`} color="#2196F3" />
        <PowerGauge value={totalLoad} max={300} label="總用電負載" color="#FF5722" />
      </div>
      
      {/* 詳細資訊 */}
      <div style={{ 
        marginTop: '20px', padding: '16px', backgroundColor: '#12121a', 
        borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>發電效率</div>
          <div style={{ fontSize: '16px', color: '#4CAF50', fontWeight: 'bold' }}>
            {solarPower > 0 ? (solarPower / 150 * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>剩餘供電</div>
          <div style={{ fontSize: '16px', color: '#FFD700', fontWeight: 'bold' }}>
            {Math.max(0, taipowerPower - taipowerToLoad).toFixed(1)} kW
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>負載平衡</div>
          <div style={{ fontSize: '16px', color: '#2196F3', fontWeight: 'bold' }}>
            {totalLoad > 0 ? (solarPower / totalLoad * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>預估電費</div>
          <div style={{ fontSize: '16px', color: '#FF5722', fontWeight: 'bold' }}>
            NT$ {(taipowerPower * 4.5 / 1000).toFixed(2)}/h
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerFlowModule;
