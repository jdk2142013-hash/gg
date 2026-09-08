import React from 'react';
import { AlertTriangle, Clock, AlertCircle, FileText, CheckCircle2, Layers } from 'lucide-react';
import { EvaluatedQuote } from '../types';

interface DashboardCardsProps {
  quotes: EvaluatedQuote[];
  activeFilter: string;
  onSelectFilter: (filterType: string, value: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  quotes,
  activeFilter,
  onSelectFilter,
}) => {
  // Compute counts
  const delayedCount = quotes.filter(q => q.deliveryState === '지연').length;
  const imminentCount = quotes.filter(q => q.deliveryState === '임박').length;
  const outlierCount = quotes.filter(q => q.priceState === '이상치').length;
  
  // Item name varied quotes count
  const variedCount = quotes.filter(q => q.isItemNameVaried).length;
  
  // Missing unit_price or promised_date count
  const missingCount = quotes.filter(
    q => q.unit_price === null || (q.status === '발주' && !q.promised_date)
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 지연 카드 */}
      <div
        onClick={() => onSelectFilter('deliveryState', '지연')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'deliveryState:지연'
            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
            : 'border-slate-200 hover:border-red-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">납기 지연 (발주)</span>
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-red-600">{delayedCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">D-DAY 경과 발주건</p>
      </div>

      {/* 임박 카드 */}
      <div
        onClick={() => onSelectFilter('deliveryState', '임박')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'deliveryState:임박'
            ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/30'
            : 'border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">납기 임박 (0~7일)</span>
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-amber-600">{imminentCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">D-0 ~ D-7 도래</p>
      </div>

      {/* 단가 이상치 카드 */}
      <div
        onClick={() => onSelectFilter('priceState', '이상치')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'priceState:이상치'
            ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/30'
            : 'border-slate-200 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">단가 이상치 (±30%)</span>
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-rose-600">{outlierCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">중앙값 대비 30% 초과</p>
      </div>

      {/* 품목명 표기 상이 카드 */}
      <div
        onClick={() => onSelectFilter('itemVariation', 'true')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'itemVariation:true'
            ? 'border-purple-500 ring-2 ring-purple-100 bg-purple-50/30'
            : 'border-slate-200 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">품목명 표기 상이</span>
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-purple-600">{variedCount}</span>
          <span className="text-xs text-slate-500">행</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">동일 코드 명칭 불일치</p>
      </div>

      {/* 결측/미기재 카드 */}
      <div
        onClick={() => onSelectFilter('missing', 'true')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md col-span-2 sm:col-span-1 ${
          activeFilter === 'missing:true'
            ? 'border-slate-500 ring-2 ring-slate-100 bg-slate-100/50'
            : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">단가/납기 결측</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-700">{missingCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">값 누락 데이터</p>
      </div>
    </div>
  );
};
