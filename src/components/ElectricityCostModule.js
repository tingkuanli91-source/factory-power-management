// ElectricityCostModule - 專業電費計算模組
import React, { useState } from 'react';

const RateCard = ({ title, rate, unit, description, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: isSelected ? '#252540' : '#1a1a2e',
      borderRadius: '16px', padding: '20px',
      border: `2px solid ${isSelected ? '#FFD700' : '#2a2a3e'}`,
      cursor: 'pointer', transition: 'all 0.3s'
    }}
  >
    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700', marginBottom: '8px' }}>
      {rate} <span style={{ fontSize: '14px', color: '#666' }}>元/度</span>
    </div>
    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{description}</div>
  </div>
);

const PeriodBar = ({ peak, semi, offPeak, maxValue }) => {
  const total = peak + semi + offPeak;
  if (total === 0) return null;
  
  return (
    <div style={{ display: 'flex', height: '30px', borderRadius: '6px', overflow: 'hidden', marginTop: '12px' }}>
      {peak > 0 && (
        <div style={{ 
          width: (peak / total * 100) + '%', backgroundColor: '#FF5722', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff'
        }}>
          尖峰 {peak.toFixed(0)}kWh
        </div>
      )}
      {semi > 0 && (
        <div style={{ 
          width: (semi / total * 100) + '%', backgroundColor: '#FF9800', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff'
        }}>
          半尖峰 {semi.toFixed(0)}kWh
        </div>
      )}
      {offPeak > 0 && (
        <div style={{ 
          width: (offPeak / total * 100) + '%', backgroundColor: '#4CAF50', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: '#fff'
        }}>
          離峰 {offPeak.toFixed(0)}kWh
        </div>
      )}
    </div>
  );
};

const ElectricityCostModule = ({ dailyData }) => {
  const [planType, setPlanType] = useState('twoPeriod');
  const [isSummer, setIsSummer] = useState(true);
  
  // 電費計算 (修正: power 為 kW，需除以 1000 轉為 kWh)
  const calculateCost = () => {
    let peakKwh = 0, semiPeakKwh = 0, offPeakKwh = 0;
    
    dailyData.forEach(hour => {
      const hourNum = parseInt(hour.time.split(':')[0]);
      const kwh = hour.power; // kW × 1小時 = kWh，無需轉換
      
      if (planType === 'twoPeriod') {
        // 兩段式: 尖峰 7:00-22:00, 離峰 22:00-7:00
        if (hourNum >= 7 && hourNum < 22) peakKwh += kwh;
        else offPeakKwh += kwh;
      } else {
        // 三段式: 尖峰 15:00-20:00, 半尖峰 7:00-15:00 & 20:00-22:00, 離峰 22:00-7:00
        if (hourNum >= 15 && hourNum < 20) peakKwh += kwh;
        else if ((hourNum >= 7 && hourNum < 15) || (hourNum >= 20 && hourNum < 22)) semiPeakKwh += kwh;
        else offPeakKwh += kwh;
      }
    });
    
    // 費率
    const rates = isSummer 
      ? (planType === 'twoPeriod' 
          ? { peak: 4.46, offPeak: 2.12 }
          : { peak: 4.46, semiPeak: 3.52, offPeak: 2.12 })
      : (planType === 'twoPeriod'
          ? { peak: 3.97, offPeak: 1.87 }
          : { peak: 3.97, semiPeak: 3.16, offPeak: 1.87 });
    
    const peakCost = peakKwh * rates.peak;
    const semiCost = semiPeakKwh * (rates.semiPeak || 0);
    const offPeakCost = offPeakKwh * rates.offPeak;
    const totalCost = peakCost + semiCost + offPeakCost;
    
    return { peakKwh, semiPeakKwh, offPeakKwh, peakCost, semiCost, offPeakCost, totalCost, rates };
  };
  
  const cost = calculateCost();
  
  // Bug 3 & Bug 4 修復: 計算年度平均費率 (考慮夏月/非夏月差異)
  // 夏月 (6-9月) 權重 4/12，非夏月權重 8/12
  const summerWeight = 4/12;
  const nonSummerWeight = 8/12;
  
  // 計算加權年度平均費率 (考慮用電時段分布)
  const totalDailyKwh = cost.peakKwh + cost.semiPeakKwh + cost.offPeakKwh;
  const peakRatio = totalDailyKwh > 0 ? cost.peakKwh / totalDailyKwh : 0;
  const semiPeakRatio = totalDailyKwh > 0 ? cost.semiPeakKwh / totalDailyKwh : 0;
  const offPeakRatio = totalDailyKwh > 0 ? cost.offPeakKwh / totalDailyKwh : 0;
  
  // 年度平均費率 = 各時段費率加權平均 (夏月4個月 + 非夏月8個月)
  const yearlyAvgRate = planType === 'twoPeriod'
    ? (4.46 * peakRatio + 2.12 * offPeakRatio) * summerWeight + 
      (3.97 * peakRatio + 1.87 * offPeakRatio) * nonSummerWeight
    : (4.46 * peakRatio + 3.52 * semiPeakRatio + 2.12 * offPeakRatio) * summerWeight + 
      (3.97 * peakRatio + 3.16 * semiPeakRatio + 1.87 * offPeakRatio) * nonSummerWeight;
  
  const monthlyEstimate = cost.totalCost * 30;
  
  // Bug 4 修復: 年度預估 = 每日用電量 × 365天 × 年度平均費率
  const yearlyEstimate = totalDailyKwh * 365 * yearlyAvgRate;
  
  // 太陽能節省: 發電量(kWh) × 年度平均費率
  const solarSavings = dailyData.reduce((sum, h) => sum + h.solar, 0) * yearlyAvgRate;

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
            backgroundColor: '#FF980020', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '20px'
          }}>💰</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>電費試算</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Electricity Cost Calculation</div>
          </div>
        </div>
      </div>
      
      {/* 費率方案選擇 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>📋 費率方案</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <RateCard 
            title="兩段式" 
            rate={isSummer ? "尖峰 4.46 / 離峰 2.12" : "尖峰 3.97 / 離峰 1.87"}
            unit="元/度"
            description="尖峰時段 7:00-22:00，離峰時段 22:00-7:00"
            isSelected={planType === 'twoPeriod'}
            onClick={() => setPlanType('twoPeriod')}
          />
          <RateCard 
            title="三段式" 
            rate={isSummer ? "尖峰 4.46 / 半尖峰 3.52 / 離峰 2.12" : "尖峰 3.97 / 半尖峰 3.16 / 離峰 1.87"}
            unit="元/度"
            description="尖峰 15:00-20:00，半尖峰 7:00-15:00 & 20:00-22:00"
            isSelected={planType === 'threePeriod'}
            onClick={() => setPlanType('threePeriod')}
          />
        </div>
      </div>
      
      {/* 季節切換 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>🌡️ 季節</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsSummer(true)}
            style={{
              padding: '12px 24px', borderRadius: '25px', border: 'none',
              backgroundColor: isSummer ? '#FFD700' : '#1a1a2e',
              color: isSummer ? '#0a0a0f' : '#a0a0a0',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            ☀️ 夏月 (6-9月)
          </button>
          <button
            onClick={() => setIsSummer(false)}
            style={{
              padding: '12px 24px', borderRadius: '25px', border: 'none',
              backgroundColor: !isSummer ? '#2196F3' : '#1a1a2e',
              color: !isSummer ? '#fff' : '#a0a0a0',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            ❄️ 非夏月
          </button>
        </div>
      </div>
      
      {/* 電費結果 */}
      <div style={{ 
        backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
        border: '1px solid #2a2a3e', marginBottom: '24px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
          📊 今日電費分析
        </div>
        
        {/* 用電分布 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>用電時段分布</div>
          <PeriodBar 
            peak={cost.peakKwh} 
            semi={cost.semiPeakKwh} 
            offPeak={cost.offPeakKwh} 
          />
        </div>
        
        {/* 費用明細 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>尖峰用電</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF5722' }}>{cost.peakKwh.toFixed(1)} kWh</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>NT$ {cost.peakCost.toFixed(0)}</div>
          </div>
          
          {planType === 'threePeriod' && (
            <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>半尖峰用電</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>{cost.semiPeakKwh.toFixed(1)} kWh</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>NT$ {cost.semiCost.toFixed(0)}</div>
            </div>
          )}
          
          <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>離峰用電</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>{cost.offPeakKwh.toFixed(1)} kWh</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>NT$ {cost.offPeakCost.toFixed(0)}</div>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#12121a', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>今日電費</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFD700' }}>NT$ {cost.totalCost.toFixed(0)}</div>
          </div>
        </div>
      </div>
      
      {/* 預估費用 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ 
          backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
          border: '1px solid #2a2a3e', textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>📅 每月預估</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>NT$ {monthlyEstimate.toFixed(0)}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>(30天)</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
          border: '1px solid #2a2a3e', textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>📆 每年預估</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>NT$ {yearlyEstimate >= 10000 ? (yearlyEstimate / 10000).toFixed(1) + ' 萬' : yearlyEstimate.toFixed(0)}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>(365天)</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '24px', 
          border: '1px solid #2a2a3e', textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>☀️ 太陽能節省</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>NT$ {solarSavings.toFixed(0)}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>/ 今日</div>
        </div>
      </div>
      
      {/* 費率說明 */}
      <div style={{ 
        backgroundColor: '#12121a', borderRadius: '12px', padding: '20px',
        fontSize: '12px', color: '#666', lineHeight: '1.8'
      }}>
        <div style={{ fontWeight: 'bold', color: '#a0a0a0', marginBottom: '8px' }}>📌 台電高壓用戶費率說明</div>
        <div>• 夏月尖峰: {isSummer ? '4.46' : '3.97'} 元/度 | 半尖峰: {isSummer ? '3.52' : '3.16'} 元/度 | 離峰: {isSummer ? '2.12' : '1.87'} 元/度</div>
        <div>• 三段式尖峰時間: 15:00-20:00</div>
        <div>• 半尖峰時間: 7:00-15:00 及 20:00-22:00</div>
        <div>• 離峰時間: 22:00-7:00</div>
      </div>
    </div>
  );
};

export default ElectricityCostModule;
