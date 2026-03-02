// DeviceManagementModule - 專業設備管理模組
import React, { useState } from 'react';

const DeviceCard = ({ device, onSelect, isSelected }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? '#00e676' : '#ff5252';
  };
  
  const getTypeIcon = (type) => {
    const icons = { taipower: '⚡', solar: '☀️', battery: '🔋', load: '⚙️' };
    return icons[type] || '📱';
  };
  
  const getTypeColor = (type) => {
    const colors = { taipower: '#FFD700', solar: '#4CAF50', battery: '#2196F3', load: '#FF5722' };
    return colors[type] || '#a0a0a0';
  };

  return (
    <div 
      onClick={() => onSelect(device)}
      style={{
        backgroundColor: isSelected ? '#252540' : '#1a1a2e',
        borderRadius: '16px',
        padding: '20px',
        border: `2px solid ${isSelected ? '#FFD700' : '#2a2a3e'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 10px 40px rgba(255,215,0,0.2)' : 'none'
      }}
    >
      {/* 設備 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            backgroundColor: getTypeColor(device.type) + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px'
          }}>
            {getTypeIcon(device.type)}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{device.name}</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{device.location}</div>
          </div>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: '20px',
          backgroundColor: getStatusColor(device.status) + '20',
          color: getStatusColor(device.status),
          fontSize: '12px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusColor(device.status) }} />
          {device.status === 'active' ? '運作中' : '停止'}
        </div>
      </div>
      
      {/* 功率顯示 */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px', backgroundColor: '#12121a', borderRadius: '12px', marginBottom: '12px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>即時功率</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: getTypeColor(device.type) }}>
            {device.power} <span style={{ fontSize: '14px', color: '#666' }}>kW</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>今日用電</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            {Math.abs(device.power * 24).toFixed(0)} <span style={{ fontSize: '12px', color: '#666' }}>kWh</span>
          </div>
        </div>
      </div>
      
      {/* 詳細規格 */}
      {device.spec && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(device.spec).map(([key, value]) => (
            <div key={key} style={{
              padding: '6px 12px', backgroundColor: '#12121a', borderRadius: '8px',
              fontSize: '11px', color: '#a0a0a0'
            }}>
              <span style={{ color: '#666' }}>{key}:</span> <span style={{ color: '#fff' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DeviceDetailModal = ({ device, onClose }) => {
  if (!device) return null;
  
  const getTypeIcon = (type) => {
    const icons = { taipower: '⚡', solar: '☀️', battery: '🔋', load: '⚙️' };
    return icons[type] || '📱';
  };
  
  const getTypeColor = (type) => {
    const colors = { taipower: '#FFD700', solar: '#4CAF50', battery: '#2196F3', load: '#FF5722' };
    return colors[type] || '#a0a0a0';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#1a1a2e', borderRadius: '24px', padding: '32px',
        maxWidth: '500px', width: '100%', border: '1px solid #2a2a3e',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              backgroundColor: getTypeColor(device.type) + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>
              {getTypeIcon(device.type)}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{device.name}</div>
              <div style={{ fontSize: '14px', color: '#a0a0a0' }}>{device.location}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer'
          }}>✕</button>
        </div>
        
        {/* 狀態 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '20px',
          backgroundColor: '#12121a', borderRadius: '16px', marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>運行狀態</div>
            <div style={{ color: device.status === 'active' ? '#00e676' : '#ff5252', fontWeight: 'bold' }}>
              {device.status === 'active' ? '● 正常運作' : '○ 已停止'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>設備類型</div>
            <div style={{ color: getTypeColor(device.type), fontWeight: 'bold' }}>
              {device.type === 'taipower' ? '台電進線' : 
               device.type === 'solar' ? '太陽能' :
               device.type === 'battery' ? '儲能系統' : '負載設備'}
            </div>
          </div>
        </div>
        
        {/* 功率資訊 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'
        }}>
          <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>即時功率</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{device.power} kW</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>今日總量</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{Math.abs(device.power * 24).toFixed(0)} kWh</div>
          </div>
        </div>
        
        {/* 額外規格 */}
        {device.spec && (
          <div style={{ padding: '20px', backgroundColor: '#12121a', borderRadius: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>設備規格</div>
            {Object.entries(device.spec).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: '1px solid #2a2a3e'
              }}>
                <span style={{ color: '#666' }}>{key}</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {device.voltage && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px'
          }}>
            <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>電壓</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700' }}>{device.voltage} V</div>
            </div>
            {device.current && (
              <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>電流</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00d4ff' }}>{device.current} A</div>
              </div>
            )}
          </div>
        )}
        
        {/* 關閉按鈕 */}
        <button onClick={onClose} style={{
          width: '100%', padding: '16px', marginTop: '20px',
          backgroundColor: '#FFD700', color: '#0a0a0f',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          關閉
        </button>
      </div>
    </div>
  );
};

const DeviceManagementModule = ({ devices }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const filteredDevices = filter === 'all' ? devices : devices.filter(d => d.type === filter);
  
  const getTypeName = (type) => {
    const names = { taipower: '台電', solar: '太陽能', battery: '儲能', load: '負載' };
    return names[type] || type;
  };
  
  const typeCounts = {
    all: devices.length,
    taipower: devices.filter(d => d.type === 'taipower').length,
    solar: devices.filter(d => d.type === 'solar').length,
    battery: devices.filter(d => d.type === 'battery').length,
    load: devices.filter(d => d.type === 'load').length,
  };

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
            backgroundColor: '#2196F320', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '20px'
          }}>📱</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>設備管理</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Device Management</div>
          </div>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#00e67615', padding: '6px 12px', borderRadius: '20px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00e676' }} />
          <span style={{ fontSize: '12px', color: '#00e676' }}>共 {devices.length} 個設備</span>
        </div>
      </div>
      
      {/* 篩選器 */}
      <div style={{ 
        display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap'
      }}>
        {['all', 'taipower', 'solar', 'battery', 'load'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '10px 20px', borderRadius: '25px', border: 'none',
              backgroundColor: filter === type ? '#FFD700' : '#1a1a2e',
              color: filter === type ? '#0a0a0f' : '#a0a0a0',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s',
              border: filter === type ? 'none' : '1px solid #2a2a3e'
            }}
          >
            {type === 'all' ? '全部 ' + typeCounts.all : 
             type === 'taipower' ? '⚡ 台電 ' + typeCounts.taipower :
             type === 'solar' ? '☀️ 太陽能 ' + typeCounts.solar :
             type === 'battery' ? '🔋 儲能 ' + typeCounts.battery :
             '⚙️ 負載 ' + typeCounts.load}
          </button>
        ))}
      </div>
      
      {/* 設備列表 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px'
      }}>
        {filteredDevices.map((device, index) => (
          <div key={device.id} style={{ animation: 'fadeIn 0.3s ease forwards', animationDelay: index * 0.05 + 's' }}>
            <DeviceCard 
              device={device} 
              isSelected={selectedDevice?.id === device.id}
              onSelect={setSelectedDevice}
            />
          </div>
        ))}
      </div>
      
      {/* 詳細 Modal */}
      {selectedDevice && (
        <DeviceDetailModal 
          device={selectedDevice} 
          onClose={() => setSelectedDevice(null)} 
        />
      )}
    </div>
  );
};

export default DeviceManagementModule;
