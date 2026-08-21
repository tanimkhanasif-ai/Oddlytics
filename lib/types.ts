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
  source?: "manual" | "analyzer" | "copy-trading";
  sourceTraderAddress?: string;
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
  paddleEnabled: boolean;
}

export interface TopTrader {
  rank: number;
  walletAddress: string;
  name: string | null;
  pnl: number;
  volume: number;
  /** Real count of Oddlytics users currently following this trader via Copy Trading. */
  followerCount: number;
}

export interface TraderTrade {
  market: string;
  question: string | null;
  outcome: string | null;
  side: "BUY" | "SELL" | null;
  size: number;
  price: number;
  timestampMs: number;
  traderName?: string | null;
}

export interface TrackedWallet {
  walletAddress: string;
  name: string | null;
  trackedAt: string;
}

export interface CopyTradingFollow {
  walletAddress: string;
  name: string | null;
  allocationUsd: number;
  followedAt: string;
  lastSeenTradeTimestampMs: number;
}
