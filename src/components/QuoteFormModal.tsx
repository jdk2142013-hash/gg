import React, { useState, useEffect } from 'react';
import { Quote, StatusType } from '../types';
import { X, Save } from 'lucide-react';

interface QuoteFormModalProps {
  initialQuote?: Quote | null;
  onSave: (quote: Quote) => void;
  onClose: () => void;
  nextQuoteId: string;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  initialQuote,
  onSave,
  onClose,
  nextQuoteId,
}) => {
  const [form, setForm] = useState<Quote>({
    quote_id: nextQuoteId,
    pr_no: 'PR-2026-033',
    item_code: 'IT-001',
    item_name: 'MTBE 수입품',
    supplier: '신규공급사',
    unit: 't',
    qty: 5,
    unit_price: 750000,
    currency: 'KRW',
    quote_date: new Date().toISOString().split('T')[0],
    required_date: '2026-10-01',
    promised_date: '2026-09-25',
    status: '견적',
    remark: '',
  });

  useEffect(() => {
    if (initialQuote) {
      setForm(initialQuote);
    } else {
      setForm(prev => ({ ...prev, quote_id: nextQuoteId }));
    }
  }, [initialQuote, nextQuoteId]);

  const handleChange = (field: keyof Quote, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pr_no || !form.item_code || !form.supplier) {
      alert('PR번호, 품목코드, 공급사는 필수 입력 항목입니다.');
      return;
    }
    onSave({
      ...form,
      qty: Number(form.qty) || 1,
      unit_price: form.unit_price !== null && form.unit_price !== undefined && form.unit_price !== ('' as any)
        ? Number(form.unit_price)
        : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {initialQuote ? '견적 정보 수정' : '신규 견적 등록'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">견적 ID</label>
              <input
                type="text"
                value={form.quote_id}
                onChange={e => handleChange('quote_id', e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700 font-mono"
                readOnly={!!initialQuote}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">PR 번호 (그룹키)</label>
              <input
                type="text"
                value={form.pr_no}
                onChange={e => handleChange('pr_no', e.target.value)}
                required
                placeholder="예: PR-2026-033"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">품목 코드</label>
              <input
                type="text"
                value={form.item_code}
                onChange={e => handleChange('item_code', e.target.value)}
                required
                placeholder="예: IT-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">품목명</label>
              <input
                type="text"
                value={form.item_name}
                onChange={e => handleChange('item_name', e.target.value)}
                required
                placeholder="예: MTBE 수입품"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">공급사</label>
              <input
                type="text"
                value={form.supplier}
                onChange={e => handleChange('supplier', e.target.value)}
                required
                placeholder="예: 대한케미칼"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">수량</label>
                <input
                  type="number"
                  step="any"
                  value={form.qty}
                  onChange={e => handleChange('qty', Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">단위</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={e => handleChange('unit', e.target.value)}
                  required
                  placeholder="t, kg, EA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">단가 (KRW, 공란 가능)</label>
              <input
                type="number"
                value={form.unit_price !== null ? form.unit_price : ''}
                onChange={e =>
                  handleChange(
                    'unit_price',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                placeholder="숫자 입력 (결측 시 공란)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">상태</label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value as StatusType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="견적">견적</option>
                <option value="발주">발주</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">견적 접수일</label>
              <input
                type="date"
                value={form.quote_date}
                onChange={e => handleChange('quote_date', e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">요청 부서 필요일</label>
              <input
                type="date"
                value={form.required_date}
                onChange={e => handleChange('required_date', e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">약속 납기 (공란 가능)</label>
              <input
                type="date"
                value={form.promised_date || ''}
                onChange={e => handleChange('promised_date', e.target.value || null)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">비고 (Remark)</label>
              <input
                type="text"
                value={form.remark || ''}
                onChange={e => handleChange('remark', e.target.value)}
                placeholder="특이사항 입력"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
