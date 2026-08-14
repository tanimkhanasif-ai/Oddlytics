export type Platform = "polymarket" | "kalshi" | "screenshot";

export interface PositionSizing {
  suggested_pct_of_capital: number;
  suggested_amount: number | null;
  rationale: string;
}

export interface AnalysisResult {
  market_question: string;
  platform: Platform;
  recommendation: "YES" | "NO";
  confidence_pct: number;
  reasons: string[];
  key_risks: string[];
  position_sizing: PositionSizing;
  take_profit: { sell_if_price_reaches: string };
  stop_loss: { sell_if_price_falls_to: string };
  exit_if: string[];
  /** Server-attached metadata, not part of the model's own output contract. */
  _mock?: boolean;
  _yesPrice?: number;
  _noPrice?: number;
}

export interface MarketQuote {
  question: string;
  platform: "polymarket" | "kalshi";
  yesPrice: number;
  noPrice: number;
  url?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PaperPosition {
  id: string;
  marketQuestion: string;
  platform: Platform;
  side: "YES" | "NO";
  entryPrice: number;
  sizeUsd: number;
  openedAt: string;
  status: "open" | "closed";
  closedAt?: string;
  exitPrice?: number;
}

export interface PaperTradingState {
  cashUsd: number;
  positions: PaperPosition[];
}

export interface HandpickedBet {
  id: string;
  category: string;
  postedAt: string;
  analysis: AnalysisResult;
}

export interface AppConfig {
  aiEnabled: boolean;
  stripeEnabled: boolean;
}
