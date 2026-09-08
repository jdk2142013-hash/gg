import { Quote, EvaluatedQuote, DeliveryState, PriceState } from '../types';

export const BASE_DATE = '2026-08-27';

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function evaluateQuotes(quotes: Quote[]): EvaluatedQuote[] {
  // 1. First pass: group by item_code to check item_name variations
  const itemCodeNamesMap = new Map<string, Set<string>>();
  quotes.forEach(q => {
    const code = q.item_code?.trim() || '';
    const name = q.item_name?.trim() || '';
    if (!itemCodeNamesMap.has(code)) {
      itemCodeNamesMap.set(code, new Set());
    }
    if (name) {
      itemCodeNamesMap.get(code)!.add(name);
    }
  });

  const variedItemCodes = new Set<string>();
  itemCodeNamesMap.forEach((names, code) => {
    if (names.size >= 2) {
      variedItemCodes.add(code);
    }
  });

  // 2. Group by pr_no for price anomaly & lowest price candidate calculation
  const prGroups = new Map<string, Quote[]>();
  quotes.forEach(q => {
    const pr = q.pr_no?.trim() || 'UNKNOWN';
    if (!prGroups.has(pr)) {
      prGroups.set(pr, []);
    }
    prGroups.get(pr)!.push(q);
  });

  const baseDateTime = new Date(BASE_DATE + 'T00:00:00').getTime();

  const evaluated: EvaluatedQuote[] = [];

  prGroups.forEach((prQuotes, prNo) => {
    // Valid prices in this PR group (non-null, numeric)
    const validPrices = prQuotes
      .map(q => q.unit_price)
      .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

    const med = validPrices.length > 0 ? median(validPrices) : null;

    // Determine lowest price candidate among valid quotes (excluding outlier and missing price)
    // First, calculate priceState for each quote in PR group to filter candidates
    const prQuoteStates = prQuotes.map(q => {
      if (q.unit_price === null || q.unit_price === undefined || isNaN(Number(q.unit_price))) {
        return { q, priceState: '단가 미기재' as PriceState, deviation: null };
      }
      const price = Number(q.unit_price);
      if (validPrices.length < 3) {
        const dev = med !== null && med > 0 ? ((price - med) / med) * 100 : 0;
        return { q, priceState: '비교 불가' as PriceState, deviation: dev };
      } else {
        const dev = med !== null && med > 0 ? ((price - med) / med) * 100 : 0;
        const isOutlier = Math.abs(dev) > 30; // > 30% strictly
        return {
          q,
          priceState: (isOutlier ? '이상치' : '정상') as PriceState,
          deviation: dev,
        };
      }
    });

    // Candidates for lowest price: priceState is '정상' or '비교 불가'
    const eligibleForLowest = prQuoteStates.filter(
      item => item.priceState === '정상' || item.priceState === '비교 불가'
    );

    let lowestQuoteId: string | null = null;
    if (eligibleForLowest.length > 0) {
      // Find min unit_price
      let minPrice = Infinity;
      eligibleForLowest.forEach(item => {
        const p = Number(item.q.unit_price);
        if (p < minPrice) {
          minPrice = p;
        }
      });

      // Filter all with minPrice
      const minPriceQuotes = eligibleForLowest.filter(item => Number(item.q.unit_price) === minPrice);

      // Tie-breaker: earlier quote_date, then quote_id ascending
      minPriceQuotes.sort((a, b) => {
        const dateA = new Date(a.q.quote_date || '9999-12-31').getTime();
        const dateB = new Date(b.q.quote_date || '9999-12-31').getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.q.quote_id.localeCompare(b.q.quote_id);
      });

      lowestQuoteId = minPriceQuotes[0].q.quote_id;
    }

    // Now build evaluated quotes for this PR
    prQuoteStates.forEach(({ q, priceState, deviation }) => {
      const isLowestCandidate = q.quote_id === lowestQuoteId;
      const isItemNameVaried = variedItemCodes.has(q.item_code?.trim() || '');

      // Delivery D-day calculation
      let dValue: number | null = null;
      let deliveryState: DeliveryState = '판정 대상 아님';
      let deliveryRank = 4;

      if (q.status === '발주') {
        if (!q.promised_date) {
          deliveryState = '납기 미기재';
          deliveryRank = 3;
        } else {
          const promisedTime = new Date(q.promised_date + 'T00:00:00').getTime();
          if (isNaN(promisedTime)) {
            deliveryState = '납기 미기재';
            deliveryRank = 3;
          } else {
            const diffDays = Math.round((promisedTime - baseDateTime) / (1000 * 60 * 60 * 24));
            dValue = diffDays;
            if (diffDays < 0) {
              deliveryState = '지연';
              deliveryRank = 0;
            } else if (diffDays <= 7) {
              deliveryState = '임박';
              deliveryRank = 1;
            } else {
              deliveryState = '정상';
              deliveryRank = 2;
            }
          }
        }
      }

      // Promised exceeded required date flag
      let isPromisedExceeded = false;
      if (q.promised_date && q.required_date) {
        const pTime = new Date(q.promised_date).getTime();
        const rTime = new Date(q.required_date).getTime();
        if (!isNaN(pTime) && !isNaN(rTime) && pTime > rTime) {
          isPromisedExceeded = true;
        }
      }

      evaluated.push({
        ...q,
        dValue,
        deliveryState,
        isPromisedExceeded,
        medianPrice: med,
        priceDeviationRate: deviation !== null ? Number(deviation.toFixed(1)) : null,
        priceState,
        isLowestCandidate,
        isItemNameVaried,
        deliveryRank,
      });
    });
  });

  return evaluated;
}

export function parseCSVQuotes(csvText: string): Quote[] {
  const Papa = (window as any).Papa || require('papaparse');
  // We can use standard PapaParse import or global
  return [];
}
