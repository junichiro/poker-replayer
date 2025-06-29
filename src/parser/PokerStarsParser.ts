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
    
    if (!dateMatch) {
      throw new Error('Invalid header: Date not found or in an invalid format');
    }
    
    const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4].padStart(2, '0')}:${dateMatch[5]}:${dateMatch[6]}`);
    
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
      
      // Standard blind patterns
      const smallBlindMatch = line.match(/([^:]+): posts small blind \$?([\d.]+)/);
      const bigBlindMatch = line.match(/([^:]+): posts big blind \$?([\d.]+)/);
      
      // Ante patterns
      const anteMatch = line.match(/([^:]+): posts the ante \$?([\d.]+)/);
      
      // Tournament-specific patterns
      const combinedBlindMatch = line.match(/([^:]+): posts small & big blinds \$?([\d.]+)/);
      const deadBlindMatch = line.match(/([^:]+): posts dead blind \$?([\d.]+)/);
      
      if (smallBlindMatch) {
        blinds.push(this.createAction('blind', smallBlindMatch[1], parseFloat(smallBlindMatch[2]), 'preflop'));
      } else if (bigBlindMatch) {
        blinds.push(this.createAction('blind', bigBlindMatch[1], parseFloat(bigBlindMatch[2]), 'preflop'));
      } else if (anteMatch) {
        ante.push(this.createAction('ante', anteMatch[1], parseFloat(anteMatch[2]), 'preflop'));
      } else if (combinedBlindMatch) {
        blinds.push(this.createAction('blind', combinedBlindMatch[1], parseFloat(combinedBlindMatch[2]), 'preflop'));
      } else if (deadBlindMatch) {
        blinds.push(this.createAction('blind', deadBlindMatch[1], parseFloat(deadBlindMatch[2]), 'preflop'));
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
          const cards = match[2].split(' ');
          if (cards.length === 2) {
            holeCards.set(match[1], cards as [string, string]);
          }
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
    // All-in action patterns (highest priority)
    const allInPatterns = [
      { regex: /([^:]+): raises \$?([\d.]+) to \$?([\d.]+) and is all-in/, type: 'raise' as ActionType },
      { regex: /([^:]+): calls \$?([\d.]+) and is all-in/, type: 'call' as ActionType },
      { regex: /([^:]+): bets \$?([\d.]+) and is all-in/, type: 'bet' as ActionType }
    ];
    
    // Check for all-in actions first
    for (const pattern of allInPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = match[1];
        let amount: number;
        
        if (pattern.type === 'raise') {
          amount = parseFloat(match[3]);
        } else {
          amount = parseFloat(match[2]);
        }
        
        const action = this.createAction(pattern.type, player, amount, street);
        action.isAllIn = true;
        return action;
      }
    }
    
    // Player state and special action patterns
    const specialPatterns = [
      { regex: /([^:]+): mucks hand/, type: 'muck' as ActionType },
      { regex: /([^:]+) has timed out/, type: 'timeout' as ActionType },
      { regex: /([^:]+) is disconnected/, type: 'disconnect' as ActionType },
      { regex: /([^:]+) is connected/, type: 'reconnect' as ActionType },
      { regex: /([^:]+): sits out/, type: 'sitout' as ActionType },
      { regex: /([^:]+) is sitting out/, type: 'sitout' as ActionType },
      { regex: /([^:]+) has returned/, type: 'return' as ActionType },
      { regex: /([^:]+) will be allowed to play after the button/, type: 'return' as ActionType }
    ];
    
    // Check for special actions
    for (const pattern of specialPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = match[1];
        const action = this.createAction(pattern.type, player, undefined, street);
        
        // Add reason for timeout/disconnect actions
        if (pattern.type === 'timeout') {
          action.reason = 'Player timed out';
        } else if (pattern.type === 'disconnect') {
          action.reason = 'Player disconnected';
        }
        
        return action;
      }
    }
    
    // Standard action patterns
    const standardPatterns = [
      { regex: /([^:]+): folds/, type: 'fold' as ActionType },
      { regex: /([^:]+): checks/, type: 'check' as ActionType },
      { regex: /([^:]+): calls \$?([\d.]+)/, type: 'call' as ActionType },
      { regex: /([^:]+): bets \$?([\d.]+)/, type: 'bet' as ActionType },
      { regex: /([^:]+): raises \$?([\d.]+) to \$?([\d.]+)/, type: 'raise' as ActionType },
      { regex: /Uncalled bet \(\$?([\d.]+)\) returned to ([^\s]+)/, type: 'uncalled' as ActionType },
      { regex: /([^:]+) collected \$?([\d.]+) from (?:side |main )?pot/, type: 'collected' as ActionType }
    ];
    
    // Check for standard actions
    for (const pattern of standardPatterns) {
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
    return this.parseStreetCard('TURN');
  }

  private parseRiver(): string | null {
    return this.parseStreetCard('RIVER');
  }

  private parseStreetCard(street: 'TURN' | 'RIVER'): string | null {
    if (this.hasMoreLines() && this.getLine().includes(street)) {
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
          const action = this.createAction('show', showMatch[1], undefined, 'showdown');
          action.cards = showMatch[2].split(' ');
          actions.push(action);
        }
        
        this.nextLine();
      }
    }
    
    return actions;
  }

  private parseSummary(): Pot[] {
    const pots: Pot[] = [];
    const collectedActions: { player: string; amount: number; type: string }[] = [];
    
    // First, collect all "collected" actions from the hand history
    for (const action of this.lines) {
      const mainPotMatch = action.match(/([^:]+) collected \$?([\d.]+) from main pot/);
      const sidePotMatch = action.match(/([^:]+) collected \$?([\d.]+) from side pot/);
      const potMatch = action.match(/([^:]+) collected \$?([\d.]+) from pot/);
      
      if (mainPotMatch) {
        collectedActions.push({
          player: mainPotMatch[1],
          amount: parseFloat(mainPotMatch[2]),
          type: 'main'
        });
      } else if (sidePotMatch) {
        collectedActions.push({
          player: sidePotMatch[1],
          amount: parseFloat(sidePotMatch[2]),
          type: 'side'
        });
      } else if (potMatch) {
        collectedActions.push({
          player: potMatch[1],
          amount: parseFloat(potMatch[2]),
          type: 'single'
        });
      }
    }
    
    // Skip to SUMMARY section
    while (this.hasMoreLines() && !this.getLine().includes('SUMMARY')) {
      this.nextLine();
    }
    
    if (this.hasMoreLines()) {
      this.nextLine(); // Skip SUMMARY line
      
      // Parse pot information from summary
      while (this.hasMoreLines()) {
        const line = this.getLine();
        
        // Parse total pot and any side pots
        const totalPotMatch = line.match(/Total pot \$?([\d.]+)/);
        
        if (totalPotMatch) {
          // Check if main and side pots are specified
          const mainPotMatch = line.match(/Main pot \$?([\d.]+)/);
          const sidePotMatches = line.matchAll(/Side pot(?:-(\d+))? \$?([\d.]+)/g);
          
          if (mainPotMatch) {
            // Create main pot
            const mainPot: Pot = {
              amount: parseFloat(mainPotMatch[1]),
              players: [],
              isSide: false
            };
            
            // Find winner for main pot
            const mainWinner = collectedActions.find(a => a.type === 'main' && Math.abs(a.amount - mainPot.amount) < 0.01);
            if (mainWinner) {
              mainPot.players.push(mainWinner.player);
            }
            
            pots.push(mainPot);
          }
          
          // Add side pots
          for (const match of sidePotMatches) {
            const sidePot: Pot = {
              amount: parseFloat(match[2]),
              players: [],
              isSide: true
            };
            
            // Find winner for side pot
            const sideWinner = collectedActions.find(a => a.type === 'side' && Math.abs(a.amount - sidePot.amount) < 0.01);
            if (sideWinner) {
              sidePot.players.push(sideWinner.player);
            }
            
            pots.push(sidePot);
          }
          
          // If no main/side pots specified, treat total as the only pot
          if (!mainPotMatch && pots.length === 0) {
            const pot: Pot = {
              amount: parseFloat(totalPotMatch[1]),
              players: []
            };
            
            // Find winner for single pot
            const winner = collectedActions.find(a => Math.abs(a.amount - pot.amount) < 0.01);
            if (winner) {
              pot.players.push(winner.player);
            }
            
            pots.push(pot);
          }
          
          break; // Found the pot line, no need to continue
        }
        
        this.nextLine();
      }
      
      // Also check summary lines for winners (as fallback)
      this.currentLineIndex--; // Go back one line
      while (this.hasMoreLines()) {
        const line = this.getLine();
        
        // Parse winner lines from summary
        const wonMatch = line.match(/Seat \d+: ([^\s]+).*won \((\d+)\)/);
        const collectedMatch = line.match(/Seat \d+: ([^\s]+).*collected \((\d+)\)/);
        const match = wonMatch || collectedMatch;
        
        if (match) {
          const winner = match[1];
          const amount = parseFloat(match[2]);
          
          // Find which pot this collection corresponds to
          for (const pot of pots) {
            if (Math.abs(pot.amount - amount) < 0.01 && !pot.players.includes(winner)) {
              pot.players.push(winner);
              break;
            }
          }
        }
        
        this.nextLine();
      }
    }
    
    return pots;
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