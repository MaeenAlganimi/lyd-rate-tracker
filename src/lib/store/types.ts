export type RateKind = "official" | "parallel";

export type RateDraft = {
  currencyCode: string;
  date: string;
  kind: RateKind;
  provider: string;
  lydPerUnit: string;
  isSample: boolean;
  isDerived: boolean;
  note: string | null;
};

export type RateQuery = {
  currency?: string;
  currencies?: string[];
  kind?: RateKind;
  provider?: string;
  from?: string;
  to?: string;
};

export type IngestionRunDraft = {
  provider: string;
  status: string;
  rowCount: number;
  message?: string;
};

export type IngestionRunRecord = IngestionRunDraft & {
  id: string;
  startedAt: string;
  finishedAt: string | null;
};

export interface RateStore {
  upsertRates(rows: RateDraft[]): Promise<number>;
  findRates(query?: RateQuery): Promise<RateDraft[]>;
  countRates(): Promise<number>;
  recordRun(run: IngestionRunDraft): Promise<void>;
  listRuns(limit?: number): Promise<IngestionRunRecord[]>;
}
