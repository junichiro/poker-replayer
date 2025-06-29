import {
  PokerHand,
  Player,
  Action,
  TableInfo,
  Pot,
  Street,
  ActionType,
  ParserResult,
  ParserError
} from '../types';

export class PokerStarsParser {
  private lines: string[];
  private currentLineIndex: number;
  private actionIndex: number;

  constructor() {
    this.lines = [];
    this.currentLineIndex = 0;
    this.actionIndex = 0;
  }

  public parse(handHistory: string): ParserResult {
    try {
      this.reset();
      this.lines = handHistory.trim().split('\n').map(line => line.trim());
      
      if (this.lines.length === 0) {
        return this.createError('Empty hand history');
      }

      const hand = this.parseHand();
      return { success: true, hand };
    } catch (error) {
      return this.createError(error instanceof Error ? error.message : 'Unknown parsing error');
    }
  }

  private reset(): void {
    this.lines = [];
    this.currentLineIndex = 0;
    this.actionIndex = 0;
  }

  private parseHand(): PokerHand {
    const header = this.parseHeader();
    const table = this.parseTable();
    const players = this.parsePlayers();
    const { blinds, ante } = this.parseBlindsAndAnte();
    const holeCards = this.parseHoleCards();
    const actions: Action[] = [];
    const board: string[] = [];
    
    // Add blinds and ante as actions
    actions.push(...blinds);
    if (ante) actions.push(...ante);
    
    // Parse preflop actions
    const preflopActions = this.parseStreetActions('preflop');
    actions.push(...preflopActions);
    
    // Parse flop
    const flopCards = this.parseFlop();
    if (flopCards.length > 0) {
      board.push(...flopCards);
      const flopActions = this.parseStreetActions('flop');
      actions.push(...flopActions);
    }
    
    // Parse turn
    const turnCard = this.parseTurn();
    if (turnCard) {
      board.push(turnCard);
      const turnActions = this.parseStreetActions('turn');
      actions.push(...turnActions);
    }
    
    // Parse river
    const riverCard = this.parseRiver();
    if (riverCard) {
      board.push(riverCard);
      const riverActions = this.parseStreetActions('river');
      actions.push(...riverActions);
    }
    
    // Parse showdown
    const showdownActions = this.parseShowdown();
    actions.push(...showdownActions);
    
    // Parse summary
    const pots = this.parseSummary();
    
    // Update players with hole cards
    this.updatePlayersWithHoleCards(players, holeCards);
    
    return {
      id: header.id,
      tournamentId: header.tournamentId,
      stakes: header.stakes,
      date: header.date,
      table,
      players,
      actions,
      board,
      pots
    };
  }

  private parseHeader(): { id: string; tournamentId?: string; stakes: string; date: Date } {
    const line = this.getLine();
    const handIdMatch = line.match(/Hand #(\d+)/);
    const tournamentMatch = line.match(/Tournament #(\d+)/);
    const stakesMatch = line.match(/\$?([\d.]+)\/\$?([\d.]+)/);
    const dateMatch = line.match(/(\d{4})\/(\d{2})\/(\d{2}) (\d{1,2}):(\d{2}):(\d{2})/);
    
    if (!handIdMatch) {
      throw new Error('Invalid header: Hand ID not found');
    }
    
    const stakes = stakesMatch ? `$${stakesMatch[1]}/$${stakesMatch[2]}` : 'Unknown';
    const date = dateMatch 
      ? new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4].padStart(2, '0')}:${dateMatch[5]}:${dateMatch[6]}`)
      : new Date();
    
    this.nextLine();
    
    return {
      id: handIdMatch[1],
      tournamentId: tournamentMatch?.[1],
      stakes,
      date
    };
  }

  private parseTable(): TableInfo {
    const line = this.getLine();
    const tableMatch = line.match(/Table '([^']+)'/);
    const seatsMatch = line.match(/(\d+)-max/);
    const buttonMatch = line.match(/Seat #(\d+) is the button/);
    
    if (!tableMatch) {
      throw new Error('Invalid table info');
    }
    
    this.nextLine();
    
    return {
      name: tableMatch[1],
      maxSeats: seatsMatch ? parseInt(seatsMatch[1]) : 9,
      buttonSeat: buttonMatch ? parseInt(buttonMatch[1]) : 1
    };
  }

  private parsePlayers(): Player[] {
    const players: Player[] = [];
    
    while (this.hasMoreLines() && this.getLine().startsWith('Seat')) {
      const line = this.getLine();
      const seatMatch = line.match(/Seat (\d+): ([^\s]+) \(\$?([\d.]+) in chips\)/);
      
      if (seatMatch) {
        players.push({
          seat: parseInt(seatMatch[1]),
          name: seatMatch[2],
          chips: parseFloat(seatMatch[3])
        });
      }
      
      this.nextLine();
    }
    
    return players;
  }

  private parseBlindsAndAnte(): { blinds: Action[]; ante: Action[] } {
    const blinds: Action[] = [];
    const ante: Action[] = [];
    
    while (this.hasMoreLines() && this.getLine().includes('posts')) {
      const line = this.getLine();
      const smallBlindMatch = line.match(/([^:]+): posts small blind \$?([\d.]+)/);
      const bigBlindMatch = line.match(/([^:]+): posts big blind \$?([\d.]+)/);
      const anteMatch = line.match(/([^:]+): posts the ante \$?([\d.]+)/);
      
      if (smallBlindMatch) {
        blinds.push(this.createAction('blind', smallBlindMatch[1], parseFloat(smallBlindMatch[2]), 'preflop'));
      } else if (bigBlindMatch) {
        blinds.push(this.createAction('blind', bigBlindMatch[1], parseFloat(bigBlindMatch[2]), 'preflop'));
      } else if (anteMatch) {
        ante.push(this.createAction('ante', anteMatch[1], parseFloat(anteMatch[2]), 'preflop'));
      }
      
      this.nextLine();
    }
    
    return { blinds, ante };
  }

  private parseHoleCards(): Map<string, [string, string]> {
    const holeCards = new Map<string, [string, string]>();
    
    if (this.hasMoreLines() && this.getLine().includes('HOLE CARDS')) {
      this.nextLine();
      
      while (this.hasMoreLines() && this.getLine().startsWith('Dealt to')) {
        const line = this.getLine();
        const match = line.match(/Dealt to ([^\s]+) \[([^\]]+)\]/);
        
        if (match) {
          const cards = match[2].split(' ') as [string, string];
          holeCards.set(match[1], cards);
        }
        
        this.nextLine();
      }
    }
    
    return holeCards;
  }

  private parseStreetActions(street: Street): Action[] {
    const actions: Action[] = [];
    
    while (this.hasMoreLines()) {
      const line = this.getLine();
      
      // Check if we've reached the next street
      if (line.includes('FLOP') || line.includes('TURN') || 
          line.includes('RIVER') || line.includes('SHOW DOWN') || 
          line.includes('SUMMARY')) {
        break;
      }
      
      const action = this.parseAction(line, street);
      if (action) {
        actions.push(action);
        this.nextLine();
      } else {
        break;
      }
    }
    
    return actions;
  }

  private parseAction(line: string, street: Street): Action | null {
    const patterns = [
      { regex: /([^:]+): folds/, type: 'fold' as ActionType },
      { regex: /([^:]+): checks/, type: 'check' as ActionType },
      { regex: /([^:]+): calls \$?([\d.]+)/, type: 'call' as ActionType },
      { regex: /([^:]+): bets \$?([\d.]+)/, type: 'bet' as ActionType },
      { regex: /([^:]+): raises \$?([\d.]+) to \$?([\d.]+)/, type: 'raise' as ActionType },
      { regex: /Uncalled bet \(\$?([\d.]+)\) returned to ([^\s]+)/, type: 'uncalled' as ActionType },
      { regex: /([^:]+) collected \$?([\d.]+) from (?:side |main )?pot/, type: 'collected' as ActionType }
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = pattern.type === 'uncalled' ? match[2] : match[1];
        let amount: number | undefined;
        
        if (pattern.type === 'raise') {
          amount = parseFloat(match[3]);
        } else if (pattern.type === 'call' || pattern.type === 'bet' || pattern.type === 'collected') {
          amount = parseFloat(match[2]);
        } else if (pattern.type === 'uncalled') {
          amount = parseFloat(match[1]);
        }
        
        return this.createAction(pattern.type, player, amount, street);
      }
    }
    
    return null;
  }

  private parseFlop(): string[] {
    if (this.hasMoreLines() && this.getLine().includes('FLOP')) {
      const line = this.getLine();
      const match = line.match(/\[([^\]]+)\]/);
      this.nextLine();
      return match ? match[1].split(' ') : [];
    }
    return [];
  }

  private parseTurn(): string | null {
    if (this.hasMoreLines() && this.getLine().includes('TURN')) {
      const line = this.getLine();
      const match = line.match(/\[([^\]]+)\] \[([^\]]+)\]/);
      this.nextLine();
      return match ? match[2] : null;
    }
    return null;
  }

  private parseRiver(): string | null {
    if (this.hasMoreLines() && this.getLine().includes('RIVER')) {
      const line = this.getLine();
      const match = line.match(/\[([^\]]+)\] \[([^\]]+)\]/);
      this.nextLine();
      return match ? match[2] : null;
    }
    return null;
  }

  private parseShowdown(): Action[] {
    const actions: Action[] = [];
    
    if (this.hasMoreLines() && this.getLine().includes('SHOW DOWN')) {
      this.nextLine();
      
      while (this.hasMoreLines() && !this.getLine().includes('SUMMARY')) {
        const line = this.getLine();
        const showMatch = line.match(/([^:]+): shows \[([^\]]+)\]/);
        
        if (showMatch) {
          const cards = showMatch[2].split(' ');
          actions.push({
            index: this.actionIndex++,
            street: 'showdown',
            type: 'show',
            player: showMatch[1],
            cards
          });
        }
        
        this.nextLine();
      }
    }
    
    return actions;
  }

  private parseSummary(): Pot[] {
    const pots: Pot[] = [];
    
    // Skip to SUMMARY section
    while (this.hasMoreLines() && !this.getLine().includes('SUMMARY')) {
      this.nextLine();
    }
    
    if (this.hasMoreLines()) {
      this.nextLine(); // Skip SUMMARY line
      
      while (this.hasMoreLines()) {
        const line = this.getLine();
        const potMatch = line.match(/Total pot \$?([\d.]+)/);
        
        if (potMatch) {
          pots.push({
            amount: parseFloat(potMatch[1]),
            players: []
          });
        }
        
        this.nextLine();
      }
    }
    
    return pots.length > 0 ? pots : [{ amount: 0, players: [] }];
  }

  private updatePlayersWithHoleCards(players: Player[], holeCards: Map<string, [string, string]>): void {
    for (const player of players) {
      const cards = holeCards.get(player.name);
      if (cards) {
        player.cards = cards;
        player.isHero = true;
      }
    }
  }

  private createAction(type: ActionType, player: string, amount?: number, street: Street = 'preflop'): Action {
    return {
      index: this.actionIndex++,
      street,
      type,
      player,
      amount
    };
  }

  private createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: this.currentLineIndex,
        context: this.currentLineIndex < this.lines.length ? this.lines[this.currentLineIndex] : undefined
      }
    };
  }

  private getLine(): string {
    if (this.currentLineIndex >= this.lines.length) {
      throw new Error('Unexpected end of hand history');
    }
    return this.lines[this.currentLineIndex];
  }

  private nextLine(): void {
    this.currentLineIndex++;
  }

  private hasMoreLines(): boolean {
    return this.currentLineIndex < this.lines.length;
  }
}