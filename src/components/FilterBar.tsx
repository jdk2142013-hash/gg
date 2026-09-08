import React from 'react';
import { Search, Filter, RefreshCw, List, FolderTree } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (key: keyof FilterState, value: any) => void;
  onResetFilter: () => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  onResetFilter,
  totalFiltered,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="PR번호(PR-...), 품목코드/명, 공급사 검색..."
            value={filter.search}
            onChange={e => onChangeFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* View mode toggle & reset */}
        <div className="flex items-center space-x-2 justify-end">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1">
            <button
              onClick={() => onChangeFilter('viewMode', 'flat')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter.viewMode === 'flat'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>전체 목록형</span>
            </button>
            <button
              onClick={() => onChangeFilter('viewMode', 'grouped')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter.viewMode === 'grouped'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>PR 그룹별</span>
            </button>
          </div>

          <button
            onClick={onResetFilter}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="필터 초기화"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">상태 (status)</label>
          <select
            value={filter.status}
            onChange={e => onChangeFilter('status', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 상태</option>
            <option value="견적">견적</option>
            <option value="발주">발주</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">납기 판정</label>
          <select
            value={filter.deliveryState}
            onChange={e => onChangeFilter('deliveryState', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 납기 판정</option>
            <option value="지연">지연 (D+)</option>
            <option value="임박">임박 (0~7일)</option>
            <option value="정상">정상 (&gt;7일)</option>
            <option value="납기 미기재">납기 미기재</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">단가 이상치 판정</label>
          <select
            value={filter.priceState}
            onChange={e => onChangeFilter('priceState', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 단가 판정</option>
            <option value="이상치">이상치 (±30% 초과)</option>
            <option value="정상">정상</option>
            <option value="단가 미기재">단가 미기재</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg w-full text-xs text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={filter.itemVariationOnly}
              onChange={e => onChangeFilter('itemVariationOnly', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span className="font-medium truncate">품목명 표기 상이만 보기</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>검색 결과: <strong className="text-slate-800">{totalFiltered}</strong>건</span>
        {(filter.search || filter.status !== 'all' || filter.deliveryState !== 'all' || filter.priceState !== 'all' || filter.itemVariationOnly) && (
          <span className="text-indigo-600 font-medium">필터 적용됨</span>
        )}
      </div>
    </div>
  );
};
