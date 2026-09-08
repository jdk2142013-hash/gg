import React, { useState } from 'react';
import { X, ClipboardPaste, Check, AlertCircle } from 'lucide-react';
import { parseQuotesCSV } from '../utils/parser';
import { Quote } from '../types';

interface PasteModalProps {
  onImport: (quotes: Quote[]) => void;
  onClose: () => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({ onImport, onClose }) => {
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParseAndImport = () => {
    if (!pastedText.trim()) {
      alert('붙여넣을 텍스트가 비어 있습니다.');
      return;
    }
    try {
      const { quotes, errors } = parseQuotesCSV(pastedText);
      if (quotes.length === 0) {
        setErrorMsg('파싱 가능한 견적 데이터가 없습니다. CSV 또는 탭 구분 헤더 형식을 확인하세요.');
        return;
      }
      onImport(quotes);
    } catch (err: any) {
      setErrorMsg(`파싱 실패: ${err?.message || '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ClipboardPaste className="w-5 h-5 text-indigo-600" />
            <span>텍스트 붙여넣기로 반입 (F-01)</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            엑셀이나 CSV에서 복사한 테이블 데이터(탭 또는 쉼표 구분, 첫 행 헤더 포함)를 아래에 붙여넣으세요.
          </p>
          <textarea
            rows={10}
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder={`quote_id,pr_no,item_code,item_name,supplier,unit,qty,unit_price,currency,quote_date,required_date,promised_date,status,remark\nQT-001,PR-2026-001,IT-001,MTBE 수입품,유진테크,t,5,,KRW,2026-08-05,2026-09-07,2026-08-29,견적,`}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleParseAndImport}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>반입 및 적용</span>
          </button>
        </div>
      </div>
    </div>
  );
};
