import Papa from 'papaparse';
import { Quote, StatusType } from '../types';

export function parseQuotesCSV(csvContent: string): { quotes: Quote[]; errors: string[] } {
  const errors: string[] = [];
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
  });

  if (results.errors && results.errors.length > 0) {
    results.errors.forEach((err: any) => {
      errors.push(`CSV 파싱 오류 (행 ${err.row}): ${err.message}`);
    });
  }

  const quotes: Quote[] = [];

  results.data.forEach((row: any, index: number) => {
    try {
      const quote_id = row.quote_id || row['quote_id'] || `QT-${String(index + 1).padStart(3, '0')}`;
      const pr_no = row.pr_no || row['pr_no'] || '';
      const item_code = row.item_code || row['item_code'] || '';
      const item_name = row.item_name || row['item_name'] || '';
      const supplier = row.supplier || row['supplier'] || '';
      const unit = row.unit || row['unit'] || 'EA';
      
      const rawQty = row.qty !== undefined ? String(row.qty).replace(/,/g, '').trim() : '1';
      const qty = Number(rawQty) || 1;

      let unit_price: number | null = null;
      const rawPrice = row.unit_price !== undefined ? String(row.unit_price).replace(/,/g, '').trim() : '';
      if (rawPrice !== '' && rawPrice !== '-' && rawPrice.toLowerCase() !== 'n/a') {
        const parsedP = Number(rawPrice);
        if (!isNaN(parsedP)) {
          unit_price = parsedP;
        }
      }

      const currency = row.currency || row['currency'] || 'KRW';
      const quote_date = row.quote_date || row['quote_date'] || '';
      const required_date = row.required_date || row['required_date'] || '';

      let promised_date: string | null = null;
      const rawPromised = row.promised_date !== undefined ? String(row.promised_date).trim() : '';
      if (rawPromised !== '' && rawPromised !== '-' && rawPromised.toLowerCase() !== 'n/a') {
        promised_date = rawPromised;
      }

      let status: StatusType = '견적';
      const rawStatus = (row.status || row['status'] || '견적').trim();
      if (rawStatus === '발주') {
        status = '발주';
      } else {
        status = '견적';
      }

      const remark = row.remark || row['remark'] || '';

      if (!pr_no || !item_code) {
        // Missing mandatory keys
        return;
      }

      quotes.push({
        quote_id,
        pr_no,
        item_code,
        item_name,
        supplier,
        unit,
        qty,
        unit_price,
        currency,
        quote_date,
        required_date,
        promised_date,
        status,
        remark,
      });
    } catch (e: any) {
      errors.push(`행 ${index + 1} 변환 실패: ${e?.message || '알 수 없는 오류'}`);
    }
  });

  return { quotes, errors };
}

export function exportQuotesToCSV(quotes: Quote[]): string {
  const headers = [
    'quote_id',
    'pr_no',
    'item_code',
    'item_name',
    'supplier',
    'unit',
    'qty',
    'unit_price',
    'currency',
    'quote_date',
    'required_date',
    'promised_date',
    'status',
    'remark',
  ];

  const rows = quotes.map(q => [
    q.quote_id,
    q.pr_no,
    q.item_code,
    `"${q.item_name || ''}"`,
    `"${q.supplier || ''}"`,
    q.unit,
    q.qty,
    q.unit_price !== null ? q.unit_price : '',
    q.currency,
    q.quote_date,
    q.required_date,
    q.promised_date || '',
    q.status,
    `"${q.remark || ''}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
