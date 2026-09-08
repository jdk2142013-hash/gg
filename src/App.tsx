import React, { useState, useEffect, useMemo } from 'react';
import { Quote, EvaluatedQuote, FilterState } from './types';
import { SAMPLE_QUOTES } from './data/sampleQuotes';
import { evaluateQuotes } from './utils/evaluator';
import { exportQuotesToCSV } from './utils/parser';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRDetailModal } from './components/PRDetailModal';
import { QuoteFormModal } from './components/QuoteFormModal';
import { UploadModal } from './components/UploadModal';
import { PasteModal } from './components/PasteModal';

const STORAGE_KEY = 'exs02.quotes.v1';

export default function App() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return SAMPLE_QUOTES;
  });

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    deliveryState: 'all',
    priceState: 'all',
    itemVariationOnly: false,
    selectedPrNo: null,
    viewMode: 'flat',
  });

  // Modal states
  const [showUpload, setShowUpload] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedPrDetail, setSelectedPrDetail] = useState<string | null>(null);

  // Save to localStorage with debounce
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [quotes]);

  // Evaluated quotes
  const evaluatedQuotes = useMemo(() => evaluateQuotes(quotes), [quotes]);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return evaluatedQuotes.filter(q => {
      // Search term
      if (filter.search.trim()) {
        const term = filter.search.toLowerCase();
        const matchPr = q.pr_no.toLowerCase().includes(term);
        const matchCode = q.item_code.toLowerCase().includes(term);
        const matchName = q.item_name.toLowerCase().includes(term);
        const matchSup = q.supplier.toLowerCase().includes(term);
        const matchId = q.quote_id.toLowerCase().includes(term);
        if (!matchPr && !matchCode && !matchName && !matchSup && !matchId) {
          return false;
        }
      }

      // Status
      if (filter.status !== 'all' && q.status !== filter.status) {
        return false;
      }

      // Delivery state
      if (filter.deliveryState !== 'all' && q.deliveryState !== filter.deliveryState) {
        return false;
      }

      // Price state
      if (filter.priceState !== 'all' && q.priceState !== filter.priceState) {
        return false;
      }

      // Item variation only
      if (filter.itemVariationOnly && !q.isItemNameVaried) {
        return false;
      }

      return true;
    });
  }, [evaluatedQuotes, filter]);

  // Handlers
  const handleLoadSample = () => {
    if (confirm('기본 샘플 데이터(80행)로 초기화하시겠습니까?')) {
      setQuotes(SAMPLE_QUOTES);
      setFilter({
        search: '',
        status: 'all',
        deliveryState: 'all',
        priceState: 'all',
        itemVariationOnly: false,
        selectedPrNo: null,
        viewMode: 'flat',
      });
    }
  };

  const handleExportCSV = () => {
    const csv = exportQuotesToCSV(quotes);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'purchase_quotes_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportQuotes = (newQuotes: Quote[]) => {
    setQuotes(newQuotes);
    setShowUpload(false);
    setShowPaste(false);
  };

  const handleSaveQuote = (saved: Quote) => {
    setQuotes(prev => {
      const exists = prev.some(q => q.quote_id === saved.quote_id);
      if (exists) {
        return prev.map(q => (q.quote_id === saved.quote_id ? saved : q));
      } else {
        return [saved, ...prev];
      }
    });
    setShowForm(false);
    setEditingQuote(null);
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (confirm(`견적 ID [${quoteId}]를 삭제하시겠습니까?`)) {
      setQuotes(prev => prev.filter(q => q.quote_id !== quoteId));
    }
  };

  const handleUpdateStatus = (quoteId: string, newStatus: '견적' | '발주') => {
    setQuotes(prev =>
      prev.map(q => (q.quote_id === quoteId ? { ...q, status: newStatus } : q))
    );
  };

  const handleDashboardFilterClick = (filterType: string, value: string) => {
    if (filterType === 'deliveryState') {
      const newVal = filter.deliveryState === value ? 'all' : value;
      setFilter(prev => ({ ...prev, deliveryState: newVal, priceState: 'all', itemVariationOnly: false }));
    } else if (filterType === 'priceState') {
      const newVal = filter.priceState === value ? 'all' : value;
      setFilter(prev => ({ ...prev, priceState: newVal, deliveryState: 'all', itemVariationOnly: false }));
    } else if (filterType === 'itemVariation') {
      const newVal = !filter.itemVariationOnly;
      setFilter(prev => ({ ...prev, itemVariationOnly: newVal, deliveryState: 'all', priceState: 'all' }));
    } else if (filterType === 'missing') {
      // Filter search or missing
      setFilter(prev => ({ ...prev, search: '', deliveryState: 'all', priceState: 'all', itemVariationOnly: false }));
    }
  };

  const handleResetFilter = () => {
    setFilter({
      search: '',
      status: 'all',
      deliveryState: 'all',
      priceState: 'all',
      itemVariationOnly: false,
      selectedPrNo: null,
      viewMode: 'flat',
    });
  };

  const nextId = useMemo(() => {
    const maxNum = quotes.reduce((max, q) => {
      const match = q.quote_id.match(/QT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `QT-${String(maxNum + 1).padStart(3, '0')}`;
  }, [quotes]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar
        onLoadSample={handleLoadSample}
        onExportCSV={handleExportCSV}
        onOpenUpload={() => setShowUpload(true)}
        onOpenPaste={() => setShowPaste(true)}
        onOpenAdd={() => {
          setEditingQuote(null);
          setShowForm(true);
        }}
        totalCount={quotes.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Warning Summary Dashboard (F-07) */}
        <DashboardCards
          quotes={evaluatedQuotes}
          activeFilter={
            filter.deliveryState !== 'all'
              ? `deliveryState:${filter.deliveryState}`
              : filter.priceState !== 'all'
              ? `priceState:${filter.priceState}`
              : filter.itemVariationOnly
              ? 'itemVariation:true'
              : ''
          }
          onSelectFilter={handleDashboardFilterClick}
        />

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onChangeFilter={(key, val) => setFilter(prev => ({ ...prev, [key]: val }))}
          onResetFilter={handleResetFilter}
          totalFiltered={filteredQuotes.length}
        />

        {/* Quote Table (Flat or Grouped) */}
        <QuoteTable
          quotes={filteredQuotes}
          viewMode={filter.viewMode}
          onSelectPr={prNo => setSelectedPrDetail(prNo)}
          onEditQuote={q => {
            setEditingQuote(q);
            setShowForm(true);
          }}
          onDeleteQuote={handleDeleteQuote}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>구매 견적 비교·납기 판정기 (PRD-S02) &bull; LocalStorage 영속화 적용</p>
      </footer>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onImport={handleImportQuotes}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showPaste && (
        <PasteModal
          onImport={handleImportQuotes}
          onClose={() => setShowPaste(false)}
        />
      )}

      {showForm && (
        <QuoteFormModal
          initialQuote={editingQuote}
          onSave={handleSaveQuote}
          onClose={() => {
            setShowForm(false);
            setEditingQuote(null);
          }}
          nextQuoteId={nextId}
        />
      )}

      {selectedPrDetail && (
        <PRDetailModal
          prNo={selectedPrDetail}
          quotes={evaluatedQuotes}
          onClose={() => setSelectedPrDetail(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
