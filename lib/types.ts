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
