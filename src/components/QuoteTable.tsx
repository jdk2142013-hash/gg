import React from 'react';
import { EvaluatedQuote } from '../types';
import { Award, AlertTriangle, Clock, CheckCircle2, AlertCircle, Layers, ExternalLink, Edit2, Trash2 } from 'lucide-react';

interface QuoteTableProps {
  quotes: EvaluatedQuote[];
  viewMode: 'flat' | 'grouped';
  onSelectPr: (prNo: string) => void;
  onEditQuote: (quote: EvaluatedQuote) => void;
  onDeleteQuote: (quoteId: string) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  viewMode,
  onSelectPr,
  onEditQuote,
  onDeleteQuote,
}) => {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">조회된 견적 데이터가 없습니다</h3>
        <p className="text-sm text-slate-500 mb-4">
          검색 조건을 변경하거나, 파일 반입 또는 샘플 데이터를 불러오세요.
        </p>
      </div>
    );
  }

  // If grouped view mode
  if (viewMode === 'grouped') {
    // Group by pr_no
    const groups = new Map<string, EvaluatedQuote[]>();
    quotes.forEach(q => {
      const pr = q.pr_no;
      if (!groups.has(pr)) {
        groups.set(pr, []);
      }
      groups.get(pr)!.push(q);
    });

    return (
      <div className="space-y-6">
        {Array.from(groups.entries()).map(([prNo, prQuotes]) => {
          const itemCode = prQuotes[0]?.item_code || '';
          const itemName = prQuotes[0]?.item_name || '';
          const qty = prQuotes[0]?.qty || 0;
          const unit = prQuotes[0]?.unit || '';
          const requiredDate = prQuotes[0]?.required_date || '';
          const orderedQuote = prQuotes.find(q => q.status === '발주');

          return (
            <div key={prNo} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* PR Group Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-900 text-sm bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    {prNo}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-900">{itemName}</span>
                    <span className="text-slate-400">({itemCode})</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                      수량: {qty} {unit}
                    </span>
                    <span className="text-slate-500">필요일: {requiredDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {orderedQuote && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      발주완료 ({orderedQuote.supplier})
                    </span>
                  )}
                  <button
                    onClick={() => onSelectPr(prNo)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    <span>비교 상세</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Table for this PR */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-white">
                      <th className="py-2.5 px-3 font-semibold">견적 ID</th>
                      <th className="py-2.5 px-3 font-semibold">공급사</th>
                      <th className="py-2.5 px-3 font-semibold text-right">단가 (KRW)</th>
                      <th className="py-2.5 px-3 font-semibold">단가 판정</th>
                      <th className="py-2.5 px-3 font-semibold">상태</th>
                      <th className="py-2.5 px-3 font-semibold">약속 납기</th>
                      <th className="py-2.5 px-3 font-semibold">납기 판정</th>
                      <th className="py-2.5 px-3 font-semibold">비고</th>
                      <th className="py-2.5 px-3 font-semibold text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prQuotes.map(q => renderRow(q, onSelectPr, onEditQuote, onDeleteQuote))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat table view
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
              <th className="py-3 px-3 font-semibold">PR번호</th>
              <th className="py-3 px-3 font-semibold">견적ID</th>
              <th className="py-3 px-3 font-semibold">품목명 (코드)</th>
              <th className="py-3 px-3 font-semibold">공급사</th>
              <th className="py-3 px-3 font-semibold text-right">수량</th>
              <th className="py-3 px-3 font-semibold text-right">단가 (KRW)</th>
              <th className="py-3 px-3 font-semibold">단가 판정</th>
              <th className="py-3 px-3 font-semibold">상태</th>
              <th className="py-3 px-3 font-semibold">약속 납기</th>
              <th className="py-3 px-3 font-semibold">납기 판정</th>
              <th className="py-3 px-3 font-semibold">비고</th>
              <th className="py-3 px-3 font-semibold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.map(q => renderFlatRow(q, onSelectPr, onEditQuote, onDeleteQuote))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function renderRow(
  q: EvaluatedQuote,
  onSelectPr: (prNo: string) => void,
  onEditQuote: (quote: EvaluatedQuote) => void,
  onDeleteQuote: (quoteId: string) => void
) {
  return (
    <tr key={q.quote_id} className="hover:bg-slate-50/80 transition-colors">
      <td className="py-2.5 px-3 font-medium text-slate-700">{q.quote_id}</td>
      <td className="py-2.5 px-3 font-semibold text-slate-900">{q.supplier}</td>
      <td className="py-2.5 px-3 text-right font-mono font-medium">
        {q.unit_price !== null ? q.unit_price.toLocaleString() : <span className="text-slate-400">미기재</span>}
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {q.isLowestCandidate && (
            <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
              <Award className="w-3 h-3" />
              <span>최저가</span>
            </span>
          )}
          {q.priceState === '이상치' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700" title={`중앙값 대비 ${q.priceDeviationRate}%`}>
              이상치 ({q.priceDeviationRate !== null && q.priceDeviationRate > 0 ? `+${q.priceDeviationRate}%` : `${q.priceDeviationRate}%`})
            </span>
          )}
          {q.priceState === '정상' && (
            <span className="text-slate-500 text-[11px]">정상</span>
          )}
          {q.priceState === '비교 불가' && (
            <span className="text-slate-400 text-[11px]">비교불가</span>
          )}
          {q.priceState === '단가 미기재' && (
            <span className="text-slate-400 text-[11px]">단가미기재</span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
            q.status === '발주'
              ? 'bg-emerald-100 text-emerald-800 font-bold'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {q.status}
        </span>
      </td>
      <td className="py-2.5 px-3 text-slate-700 font-mono">
        {q.promised_date || <span className="text-slate-400">미기재</span>}
      </td>
      <td className="py-2.5 px-3">
        {q.status === '발주' ? (
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            {q.deliveryState === '지연' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3" />
                <span>지연 (D+{Math.abs(q.dValue || 0)})</span>
              </span>
            )}
            {q.deliveryState === '임박' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">
                <Clock className="w-3 h-3" />
                <span>{q.dValue === 0 ? 'D-DAY' : `임박 (D-${q.dValue})`}</span>
              </span>
            )}
            {q.deliveryState === '정상' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>정상 (D-{q.dValue})</span>
              </span>
            )}
            {q.deliveryState === '납기 미기재' && (
              <span className="text-slate-400 text-[11px]">납기미기재</span>
            )}
            {q.isPromisedExceeded && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-800 font-medium" title="요청 부서 필요일 초과">
                필요일초과
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">-</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-slate-500 max-w-[160px] truncate" title={q.remark || ''}>
        {q.remark || '-'}
      </td>
      <td className="py-2.5 px-3 text-right space-x-1">
        <button
          onClick={() => onEditQuote(q)}
          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="수정"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeleteQuote(q.quote_id)}
          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          title="삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function renderFlatRow(
  q: EvaluatedQuote,
  onSelectPr: (prNo: string) => void,
  onEditQuote: (quote: EvaluatedQuote) => void,
  onDeleteQuote: (quoteId: string) => void
) {
  return (
    <tr key={q.quote_id} className="hover:bg-slate-50/80 transition-colors">
      <td className="py-2.5 px-3 font-medium">
        <button
          onClick={() => onSelectPr(q.pr_no)}
          className="text-indigo-600 hover:underline font-semibold inline-flex items-center space-x-1"
        >
          <span>{q.pr_no}</span>
        </button>
      </td>
      <td className="py-2.5 px-3 text-slate-600">{q.quote_id}</td>
      <td className="py-2.5 px-3">
        <div className="flex items-center space-x-1.5">
          <span className={`font-medium text-slate-800 ${q.isItemNameVaried ? 'border-b-2 border-purple-400 pb-0.5' : ''}`} title={q.isItemNameVaried ? '동일 품목코드 내 명칭 표기 상이 존재' : ''}>
            {q.item_name}
          </span>
          <span className="text-slate-400 text-[11px]">({q.item_code})</span>
          {q.isItemNameVaried && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-semibold" title="표기 상이 경고">
              표기상이
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3 font-semibold text-slate-900">{q.supplier}</td>
      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
        {q.qty} {q.unit}
      </td>
      <td className="py-2.5 px-3 text-right font-mono font-medium">
        {q.unit_price !== null ? q.unit_price.toLocaleString() : <span className="text-slate-400">미기재</span>}
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {q.isLowestCandidate && (
            <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
              <Award className="w-3 h-3" />
              <span>최저가</span>
            </span>
          )}
          {q.priceState === '이상치' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700" title={`중앙값 대비 ${q.priceDeviationRate}%`}>
              이상치 ({q.priceDeviationRate !== null && q.priceDeviationRate > 0 ? `+${q.priceDeviationRate}%` : `${q.priceDeviationRate}%`})
            </span>
          )}
          {q.priceState === '정상' && (
            <span className="text-slate-500 text-[11px]">정상</span>
          )}
          {q.priceState === '비교 불가' && (
            <span className="text-slate-400 text-[11px]">비교불가</span>
          )}
          {q.priceState === '단가 미기재' && (
            <span className="text-slate-400 text-[11px]">단가미기재</span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
            q.status === '발주'
              ? 'bg-emerald-100 text-emerald-800 font-bold'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {q.status}
        </span>
      </td>
      <td className="py-2.5 px-3 text-slate-700 font-mono">
        {q.promised_date || <span className="text-slate-400">미기재</span>}
      </td>
      <td className="py-2.5 px-3">
        {q.status === '발주' ? (
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            {q.deliveryState === '지연' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3" />
                <span>지연 (D+{Math.abs(q.dValue || 0)})</span>
              </span>
            )}
            {q.deliveryState === '임박' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">
                <Clock className="w-3 h-3" />
                <span>{q.dValue === 0 ? 'D-DAY' : `임박 (D-${q.dValue})`}</span>
              </span>
            )}
            {q.deliveryState === '정상' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>정상 (D-{q.dValue})</span>
              </span>
            )}
            {q.deliveryState === '납기 미기재' && (
              <span className="text-slate-400 text-[11px]">납기미기재</span>
            )}
            {q.isPromisedExceeded && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-800 font-medium" title="요청 부서 필요일 초과">
                필요일초과
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">-</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-slate-500 max-w-[140px] truncate" title={q.remark || ''}>
        {q.remark || '-'}
      </td>
      <td className="py-2.5 px-3 text-right space-x-1">
        <button
          onClick={() => onEditQuote(q)}
          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="수정"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeleteQuote(q.quote_id)}
          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          title="삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
