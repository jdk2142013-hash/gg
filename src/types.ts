export type StatusType = '견적' | '발주';

export interface Quote {
  quote_id: string;
  pr_no: string;
  item_code: string;
  item_name: string;
  supplier: string;
  unit: string;
  qty: number;
  unit_price: number | null;
  currency: string;
  quote_date: string;
  required_date: string;
  promised_date: string | null;
  status: StatusType;
  remark?: string;
}

export type DeliveryState = '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';
export type PriceState = '이상치' | '정상' | '비교 불가' | '단가 미기재';

export interface EvaluatedQuote extends Quote {
  dValue: number | null; // D-day diff
  deliveryState: DeliveryState;
  isPromisedExceeded: boolean; // promised_date > required_date
  medianPrice: number | null;
  priceDeviationRate: number | null; // %
  priceState: PriceState;
  isLowestCandidate: boolean;
  isItemNameVaried: boolean;
  deliveryRank: number; // 0: 지연, 1: 임박, 2: 정상, 3: 납기 미기재, 4: 판정 대상 아님
}

export interface FilterState {
  search: string;
  status: string; // 'all' | '견적' | '발주'
  deliveryState: string; // 'all' | '지연' | '임박' | '정상' | '납기 미기재'
  priceState: string; // 'all' | '이상치' | '정상' | '단가 미기재'
  itemVariationOnly: boolean;
  selectedPrNo: string | null;
  viewMode: 'flat' | 'grouped';
}
