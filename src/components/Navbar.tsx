import React from 'react';
import { FileSpreadsheet, Upload, Download, ClipboardPaste, Plus, RotateCcw, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  onExportCSV: () => void;
  onOpenUpload: () => void;
  onOpenPaste: () => void;
  onOpenAdd: () => void;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onExportCSV,
  onOpenUpload,
  onOpenPaste,
  onOpenAdd,
  totalCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">구매 견적 비교·납기 판정기</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                PRD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              기준일: <span className="font-medium text-slate-700">2026-08-27</span> (총 {totalCount}건)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onLoadSample}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="기본 샘플 데이터(80행) 복원"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>샘플 로드</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">파일 반입</span>
          </button>

          <button
            onClick={onOpenPaste}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-500" />
            <span>텍스트 붙여넣기</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            title="현재 데이터를 CSV로 내보내기"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">내보내기</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>견적 등록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
