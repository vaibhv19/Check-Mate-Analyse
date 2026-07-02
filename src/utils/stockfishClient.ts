import type { EngineLine } from '../types/state';
import { parseUciInfoLine } from './engineEvaluationParser';

export interface StockfishOutput {
  depth?: number;
  nps?: number;
  bestMove?: string;
  lines?: EngineLine[];
}

export type StockfishMessageCallback = (msg: string) => void;
export type StockfishEvaluationCallback = (evaluation: StockfishOutput) => void;

export class StockfishClient {
  private worker: Worker | null = null;
  private messageListeners: StockfishMessageCallback[] = [];
  private evalListeners: StockfishEvaluationCallback[] = [];
  private currentLines: EngineLine[] = [];

  constructor() {}

  /**
   * Initializes the Stockfish Web Worker.
   */
  public start(): void {
    if (this.worker) return;

    try {
      this.worker = new Worker('/stockfish.js');
      
      this.worker.onmessage = (event: MessageEvent) => {
        const msg = event.data as string;
        this.handleMessage(msg);
      };

      this.sendCommand('uci');
      this.sendCommand('setoption name MultiPV value 3');
      this.sendCommand('isready');
    } catch (error) {
      console.error('Failed to initialize Stockfish worker:', error);
    }
  }

  /**
   * Terminates the Stockfish Web Worker.
   */
  public stop(): void {
    if (this.worker) {
      this.sendCommand('stop');
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Sends a UCI command to the worker.
   */
  public sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  /**
   * Sets up a position with a custom FEN and triggers search.
   */
  public analyzePosition(fen: string, depth: number): void {
    this.sendCommand('stop');
    this.currentLines = []; // reset principal variation lines for new search
    this.sendCommand('ucinewgame');
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  /**
   * Registers a listener for raw UCI output text lines.
   * Returns a cleanup function.
   */
  public addMessageListener(callback: StockfishMessageCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== callback);
    };
  }

  /**
   * Registers a listener for parsed Stockfish evaluations.
   * Returns a cleanup function.
   */
  public addEvalListener(callback: StockfishEvaluationCallback): () => void {
    this.evalListeners.push(callback);
    return () => {
      this.evalListeners = this.evalListeners.filter(l => l !== callback);
    };
  }

  /**
   * Dispatches incoming UCI messages to listeners and triggers parsing.
   */
  private handleMessage(msg: string): void {
    // Distribute raw message lines to listeners
    this.messageListeners.forEach(listener => listener(msg));

    // Parse UCI info lines
    if (msg.startsWith('info ') && msg.includes('score')) {
      const parsed = parseUciInfoLine(msg, this.currentLines);
      if (parsed) {
        this.currentLines = parsed.updatedLines;
        this.evalListeners.forEach(listener => listener({
          depth: parsed.depth,
          nps: parsed.nps,
          lines: parsed.updatedLines,
        }));
      }
    } else if (msg.startsWith('bestmove ')) {
      const parts = msg.split(' ');
      const bestMove = parts[1];
      this.evalListeners.forEach(listener => listener({ bestMove }));
    }
  }
}
