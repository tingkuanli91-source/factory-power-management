// UIModule - 專業 UI/UX 增強模組
import React from 'react';

const UIModule = () => {
  return (
    <div>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
          }}>🎨</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>UI/UX 優化</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>UI/UX Enhancement</div>
          </div>
        </div>
      </div>
      
      {/* RWD 展示 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e', marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          📱 響應式設計 (RWD)
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '20px', backgroundColor: '#12121a', borderRadius: '12px', 
            textAlign: 'center', flex: '1 1 200px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
            <div style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>手機</div>
            <div style={{ fontSize: '12px', color: '#666' }}>&lt; 768px</div>
          </div>
          <div style={{ 
            padding: '20px', backgroundColor: '#12121a', borderRadius: '12px', 
            textAlign: 'center', flex: '1 1 200px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
            <div style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>平板</div>
            <div style={{ fontSize: '12px', color: '#666' }}>768px - 1024px</div>
          </div>
          <div style={{ 
            padding: '20px', backgroundColor: '#12121a', borderRadius: '12px', 
            textAlign: 'center', flex: '1 1 200px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💻</div>
            <div style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>桌面</div>
            <div style={{ fontSize: '12px', color: '#666' }}>&gt; 1024px</div>
          </div>
        </div>
      </div>
      
      {/* 深色模式 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e', marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          🌙 深色模式主題
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: '#0a0a0f', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚫</div>
            <div style={{ fontSize: '12px', color: '#fff' }}>背景 #0a0a0f</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#1a1a2e', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔵</div>
            <div style={{ fontSize: '12px', color: '#fff' }}>卡片 #1a1a2e</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#FFD700', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🟡</div>
            <div style={{ fontSize: '12px', color: '#000' }}>強調 #FFD700</div>
          </div>
        </div>
      </div>
      
      {/* 動畫展示 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
          ✨ 動畫效果
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ 
            padding: '24px', backgroundColor: '#12121a', borderRadius: '12px', 
            textAlign: 'center', animation: 'float 2s ease-in-out infinite'
          }}>
            <div style={{ fontSize: '32px' }}>🎈</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '8px' }}>浮動動畫</div>
          </div>
          <div style={{ 
            padding: '24px', backgroundColor: '#12121a', borderRadius: '12px', 
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '32px', 
              background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s ease infinite'
            }}>
              🌈
            </div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '8px' }}>漸變動畫</div>
          </div>
        </div>
      </div>
      
      {/* 說明 */}
      <div style={{ 
        marginTop: '24px', padding: '20px', backgroundColor: '#12121a', 
        borderRadius: '12px', fontSize: '12px', color: '#666', lineHeight: '1.8'
      }}>
        <div style={{ fontWeight: 'bold', color: '#a0a0a0', marginBottom: '8px' }}>📌 UI/UX 特色</div>
        <div>• 完整響應式設計，支援手機、平板、桌面</div>
        <div>• 深色主題護眼，適合長時間使用</div>
        <div>• 流暢動畫提升使用者體驗</div>
        <div>• 金色強調色系，專業且質感十足</div>
      </div>
    </div>
  );
};

export default UIModule;
