import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { parseQuotesCSV } from '../utils/parser';
import { Quote } from '../types';

interface UploadModalProps {
  onImport: (quotes: Quote[]) => void;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onImport, onClose }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [parsedQuotes, setParsedQuotes] = useState<Quote[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const { quotes, errors } = parseQuotesCSV(text);
        if (quotes.length === 0) {
          setErrorMsg('유효한 견대 데이터가 없습니다. CSV 형식을 확인해주세요.');
          return;
        }
        if (errors.length > 0) {
          console.warn('Parsing warnings:', errors);
        }
        setParsedQuotes(quotes);
        setSuccessCount(quotes.length);
      } catch (err: any) {
        setErrorMsg(`파일 읽기 실패: ${err?.message || '알 수 없는 오류'}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirm = () => {
    if (parsedQuotes && parsedQuotes.length > 0) {
      onImport(parsedQuotes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>견적 CSV 파일 반입 (F-01)</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 mb-1">
              ERP 내보내기 CSV 파일을 선택하세요
            </p>
            <p className="text-xs text-slate-400 mb-4">
              UTF-8 인코딩, 첫 행 헤더 (`quote_id, pr_no, item_code, ...`)
            </p>
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              <span>파일 선택</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
              <span>총 <strong>{successCount}</strong>개의 견적 행이 성공적으로 파싱되었습니다.</span>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors"
              >
                데이터 적용하기
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
