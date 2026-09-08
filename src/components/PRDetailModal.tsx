import React, { useState } from 'react';
import { EvaluatedQuote } from '../types';
import { X, Copy, Check, Award, AlertTriangle, Clock, CheckCircle2, Building2 } from 'lucide-react';

interface PRDetailModalProps {
  prNo: string;
  quotes: EvaluatedQuote[];
  onClose: () => void;
  onUpdateStatus: (quoteId: string, newStatus: '견적' | '발주') => void;
}

export const PRDetailModal: React.FC<PRDetailModalProps> = ({
  prNo,
  quotes,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const prQuotes = quotes.filter(q => q.pr_no === prNo);

  if (prQuotes.length === 0) return null;

  const first = prQuotes[0];
  const orderedCount = prQuotes.filter(q => q.status === '발주').length;

  const handleCopyClipboard = () => {
    // Generate tab-separated text for F-08
    const header = ['PR번호', '견적ID', '품목코드', '품목명', '공급사', '수량', '단가(KRW)', '단가판정', '상태', '약속납기', '납기판정'].join('\t');
    const rows = prQuotes.map(q => [
      q.pr_no,
      q.quote_id,
      q.item_code,
      q.item_name,
      q.supplier,
      `${q.qty} ${q.unit}`,
      q.unit_price !== null ? q.unit_price.toLocaleString() : '미기재',
      q.priceState + (q.priceDeviationRate !== null ? `(${q.priceDeviationRate}%)` : ''),
      q.status,
      q.promised_date || '미기재',
      q.deliveryState,
    ].join('\t'));

    const text = [header, ...rows].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              PR
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{prNo} 비교 상세</h2>
                {orderedCount > 1 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
                    발주 중복 경고 ({orderedCount}건 발주)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                품목: <strong className="text-slate-800">{first.item_name}</strong> ({first.item_code}) | 수량: {first.qty} {first.unit} | 필요일: {first.required_date}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyClipboard}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
              title="비교표 클립보드 복사 (F-08)"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '복사 완료!' : '비교표 복사'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start space-x-3">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900">
              <span className="font-bold">최저가 추천: </span>
              {prQuotes.find(q => q.isLowestCandidate) ? (
                <span>
                  <strong>{prQuotes.find(q => q.isLowestCandidate)?.supplier}</strong> ({prQuotes.find(q => q.isLowestCandidate)?.unit_price?.toLocaleString()} KRW)
                </span>
              ) : (
                <span className="text-slate-500">선정 가능한 최저가 후보가 없습니다 (이상치 또는 결측 제외됨).</span>
              )}
              {orderedCount === 1 && prQuotes.find(q => q.status === '발주') && (
                <div className="mt-1 text-slate-600">
                  현재 발주처: <strong>{prQuotes.find(q => q.status === '발주')?.supplier}</strong>
                  {prQuotes.find(q => q.status === '발주')?.quote_id !== prQuotes.find(q => q.isLowestCandidate)?.quote_id && (
                    <span className="ml-2 text-amber-700 font-medium">⚠️ 발주처와 최저가 후보가 다릅니다.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">견적ID</th>
                  <th className="py-3 px-4 font-semibold">공급사</th>
                  <th className="py-3 px-4 font-semibold text-right">단가 (KRW)</th>
                  <th className="py-3 px-4 font-semibold">단가 판정 (편차율)</th>
                  <th className="py-3 px-4 font-semibold">상태 전환</th>
                  <th className="py-3 px-4 font-semibold">약속 납기</th>
                  <th className="py-3 px-4 font-semibold">납기 판정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prQuotes.map(q => (
                  <tr key={q.quote_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-700">{q.quote_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{q.supplier}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      {q.unit_price !== null ? q.unit_price.toLocaleString() : <span className="text-slate-400">미기재</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        {q.isLowestCandidate && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
                            최저가
                          </span>
                        )}
                        {q.priceState === '이상치' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">
                            이상치 ({q.priceDeviationRate !== null && q.priceDeviationRate > 0 ? `+${q.priceDeviationRate}%` : `${q.priceDeviationRate}%`})
                          </span>
                        )}
                        {q.priceState === '정상' && (
                          <span className="text-slate-500">정상 ({q.priceDeviationRate !== null && q.priceDeviationRate > 0 ? `+${q.priceDeviationRate}%` : `${q.priceDeviationRate}%`})</span>
                        )}
                        {q.priceState === '비교 불가' && <span className="text-slate-400">비교불가</span>}
                        {q.priceState === '단가 미기재' && <span className="text-slate-400">단가미기재</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={q.status}
                        onChange={e => onUpdateStatus(q.quote_id, e.target.value as '견적' | '발주')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          q.status === '발주'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="견적">견적</option>
                        <option value="발주">발주</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {q.promised_date || <span className="text-slate-400">미기재</span>}
                    </td>
                    <td className="py-3 px-4">
                      {q.status === '발주' ? (
                        <div className="flex items-center space-x-1">
                          {q.deliveryState === '지연' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                              지연 (D+{Math.abs(q.dValue || 0)})
                            </span>
                          )}
                          {q.deliveryState === '임박' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">
                              {q.dValue === 0 ? 'D-DAY' : `임박 (D-${q.dValue})`}
                            </span>
                          )}
                          {q.deliveryState === '정상' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                              정상 (D-{q.dValue})
                            </span>
                          )}
                          {q.deliveryState === '납기 미기재' && (
                            <span className="text-slate-400">납기미기재</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
