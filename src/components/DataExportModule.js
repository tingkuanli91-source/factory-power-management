// DataExportModule - 專業資料匯出模組
import React, { useState } from 'react';

const ExportCard = ({ icon, title, description, format, onClick, color }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px',
      border: '1px solid #2a2a3e', cursor: 'pointer', transition: 'all 0.3s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3e'}
  >
    <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '13px', color: '#a0a0a0' }}>{description}</div>
    <div style={{ 
      marginTop: '16px', padding: '8px 16px', borderRadius: '20px', 
      backgroundColor: color + '20', color: color, fontSize: '12px', fontWeight: '600',
      display: 'inline-block'
    }}>
      {format}
    </div>
  </div>
);

const DataExportModule = ({ dailyData, devices }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  
  // CSV 匯出
  const exportCSV = () => {
    setExporting(true);
    setExportFormat('CSV');
    
    const headers = ['時間', '功率(kW)', '太陽能(kW)', '台電(kW)', '儲能(kW)'];
    const rows = dailyData.map(h => [h.time, h.power, h.solar, h.taipower, h.battery]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用電資料_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => {
      setExporting(false);
      setExportFormat(null);
    }, 1500);
  };
  
  // JSON 匯出
  const exportJSON = () => {
    setExporting(true);
    setExportFormat('JSON');
    
    const data = {
      exportDate: new Date().toISOString(),
      dailyData: dailyData,
      devices: devices,
      summary: {
        totalPower: dailyData.reduce((s, h) => s + h.power, 0),
        totalSolar: dailyData.reduce((s, h) => s + h.solar, 0),
        avgPower: dailyData.reduce((s, h) => s + h.power, 0) / 24
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用電資料_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setTimeout(() => {
      setExporting(false);
      setExportFormat(null);
    }, 1500);
  };
  
  // 匯出設備資料
  const exportDevices = () => {
    setExporting(true);
    setExportFormat('Devices');
    
    const headers = ['設備名稱', '類型', '位置', '功率(kW)', '狀態'];
    const rows = devices.map(d => [d.name, d.type, d.location, d.power, d.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `設備列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => {
      setExporting(false);
      setExportFormat(null);
    }, 1500);
  };
  
  // 匯出電費報表
  const exportReport = () => {
    setExporting(true);
    setExportFormat('Report');
    
    const totalPower = dailyData.reduce((s, h) => s + h.power, 0);
    const totalSolar = dailyData.reduce((s, h) => s + h.solar, 0);
    const report = `
=====================================
    工廠用電管理系統 - 每日報告
=====================================
匯出日期: ${new Date().toLocaleString('zh-TW')}
-------------------------------------

📊 用電概況
--------------------------------------
今日總用電: ${(totalPower / 1000).toFixed(2)} kWh
太陽能發電: ${(totalSolar / 1000).toFixed(2)} kWh
太陽能佔比: ${(totalSolar / totalPower * 100).toFixed(1)}%
平均功率: ${(totalPower / 24).toFixed(2)} kW

📈 24小時用電資料
--------------------------------------
${dailyData.map(h => `${h.time} - ${h.power} kW`).join('\n')}

📱 設備清單
--------------------------------------
${devices.map(d => `${d.name} (${d.type}): ${d.power} kW`).join('\n')}

=====================================
    台灣微網科技股份有限公司
=====================================
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用電報告_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    setTimeout(() => {
      setExporting(false);
      setExportFormat(null);
    }, 1500);
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
            backgroundColor: '#4CAF5020', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '20px'
          }}>📤</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>資料匯出</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Data Export</div>
          </div>
        </div>
      </div>
      
      {/* 匯出選項 */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px', marginBottom: '24px'
      }}>
        <ExportCard 
          icon="📊" 
          title="用電資料 CSV" 
          description="匯出 24 小時用電數據，包含功率、太陽能發電、台電供電等資訊"
          format=".CSV"
          color="#4CAF50"
          onClick={exportCSV}
        />
        <ExportCard 
          icon="📦" 
          title="完整資料 JSON" 
          description="匯出完整資料包含用電數據、設備列表、統計摘要"
          format=".JSON"
          color="#2196F3"
          onClick={exportJSON}
        />
        <ExportCard 
          icon="📱" 
          title="設備清單" 
          description="匯出所有設備列表，包含設備名稱、類型、功率、狀態"
          format=".CSV"
          color="#FF9800"
          onClick={exportDevices}
        />
        <ExportCard 
          icon="📝" 
          title="每日報告" 
          description="匯出格式化每日用電報告，包含統計數據與圖表說明"
          format=".TXT"
          color="#9C27B0"
          onClick={exportReport}
        />
      </div>
      
      {/* 匯出狀態 */}
      {exporting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a2e', borderRadius: '24px', padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '48px', marginBottom: '24px',
              animation: 'spin 1s linear infinite'
            }}>⏳</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              正在匯出 {exportFormat}...
            </div>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
              檔案即將下載
            </div>
          </div>
        </div>
      )}
      
      {/* 資料預覽 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          📋 資料預覽
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>用電資料 (CSV)</div>
          <div style={{ 
            backgroundColor: '#12121a', borderRadius: '8px', padding: '12px', 
            fontSize: '12px', color: '#4CAF50', fontFamily: 'monospace',
            overflow: 'auto', maxHeight: '150px'
          }}>
            {dailyData.slice(0, 5).map(h => `${h.time}, ${h.power} kW, ${h.solar} kW, ${h.taipower} kW`).join('\n')}
            <br/>...
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>設備清單</div>
          <div style={{ 
            backgroundColor: '#12121a', borderRadius: '8px', padding: '12px', 
            fontSize: '12px', color: '#FF9800', fontFamily: 'monospace'
          }}>
            {devices.map(d => `${d.name}, ${d.type}, ${d.power} kW`).join('\n')}
          </div>
        </div>
      </div>
      
      {/* 說明 */}
      <div style={{ 
        marginTop: '24px', padding: '20px', backgroundColor: '#12121a', 
        borderRadius: '12px', fontSize: '12px', color: '#666', lineHeight: '1.8'
      }}>
        <div style={{ fontWeight: 'bold', color: '#a0a0a0', marginBottom: '8px' }}>📌 匯出說明</div>
        <div>• CSV 檔案可用 Excel 或 Google Sheets 開啟</div>
        <div>• JSON 檔案可供系統整合或備份使用</div>
        <div>• 報告檔案為文字格式，方便列印或EMAIL傳送</div>
        <div>• 所有檔案編碼為 UTF-8 (含 BOM)，支援中文顯示</div>
      </div>
    </div>
  );
};

export default DataExportModule;
