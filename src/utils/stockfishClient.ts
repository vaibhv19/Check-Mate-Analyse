export interface StockfishOutput {
  depth?: number;
  score?: number; // centipawns or mate-in-N
  isMate?: boolean;
  nps?: number;
  bestMove?: string;
}

export type StockfishMessageCallback = (msg: string) => void;
export type StockfishEvaluationCallback = (evaluation: StockfishOutput) => void;

export class StockfishClient {
  private worker: Worker | null = null;
  private messageListeners: StockfishMessageCallback[] = [];
  private evalListeners: StockfishEvaluationCallback[] = [];

  constructor() {}

  /**
   * Initializes the Stockfish Web Worker.
   */
  public start(): void {
    if (this.worker) return;

    try {
      // Spawn Stockfish JS worker from the public/ static assets folder
      this.worker = new Worker('/stockfish.js');
      
      this.worker.onmessage = (event: MessageEvent) => {
        const msg = event.data as string;
        this.handleMessage(msg);
      };

      // Set up engine parameters
      this.sendCommand('uci');
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
   * Sends a raw command to the UCI engine.
   */
  public sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  /**
   * Sets up a position with a custom FEN and triggers a search.
   */
  public analyzePosition(fen: string, depth: number): void {
    this.sendCommand('stop');
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
      const parsedEval = this.parseInfoLine(msg);
      if (parsedEval) {
        this.evalListeners.forEach(listener => listener(parsedEval));
      }
    } else if (msg.startsWith('bestmove ')) {
      const parts = msg.split(' ');
      const bestMove = parts[1];
      this.evalListeners.forEach(listener => listener({ bestMove }));
    }
  }

  /**
   * Parses standard UCI 'info' lines to extract depth, score (cp/mate), and nodes-per-second (NPS).
   */
  private parseInfoLine(line: string): StockfishOutput | null {
    const parts = line.split(' ');
    
    const depthIdx = parts.indexOf('depth');
    const scoreIdx = parts.indexOf('score');
    const npsIdx = parts.indexOf('nps');
    
    if (scoreIdx === -1) return null;

    const depth = depthIdx !== -1 ? parseInt(parts[depthIdx + 1], 10) : undefined;
    const nps = npsIdx !== -1 ? parseInt(parts[npsIdx + 1], 10) : undefined;

    let score = 0;
    let isMate = false;

    const scoreType = parts[scoreIdx + 1]; // 'cp' or 'mate'
    const scoreValStr = parts[scoreIdx + 2];
    
    if (scoreType === 'cp' && scoreValStr) {
      score = parseInt(scoreValStr, 10);
    } else if (scoreType === 'mate' && scoreValStr) {
      score = parseInt(scoreValStr, 10);
      isMate = true;
    }

    return {
      depth,
      score,
      isMate,
      nps,
    };
  }
}
