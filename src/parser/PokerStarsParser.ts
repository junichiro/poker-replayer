import {
  PokerHand,
  Player,
  Action,
  TableInfo,
  Pot,
  Street,
  ActionType,
  ParserResult,
  ParserError,
  PlayingCard,
  CollectedAction,
  PotCalculation
} from '../types';

/**
 * Validates if a string is a valid playing card and returns it as PlayingCard type
 */
function toPlayingCard(cardString: string): PlayingCard {
  const validCardPattern = /^[2-9TJQKA][hdcs]$/;
  if (!validCardPattern.test(cardString)) {
    throw new Error(`Invalid card format: ${cardString}. Expected format: rank + suit (e.g., "As", "Kh")`);
  }
  return cardString as PlayingCard;
}

/**
 * Safely converts an array of strings to PlayingCard array
 */
function toPlayingCardArray(cardStrings: string[]): PlayingCard[] {
  return cardStrings.map(toPlayingCard);
}

export class PokerStarsParser {
  private lines: string[];
  private currentLineIndex: number;
  private actionIndex: number;
  private playerChips: Map<string, number>; // Track current chips per player
  private allInPlayers: Map<string, number>; // Track all-in amounts
  private activePlayers: Set<string>; // Track players still in hand (not folded)
  private totalPotContributions: number; // Track total money put into pot

  constructor() {
    this.lines = [];
    this.currentLineIndex = 0;
    this.actionIndex = 0;
    this.playerChips = new Map();
    this.allInPlayers = new Map();
    this.activePlayers = new Set();
    this.totalPotContributions = 0;
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
    this.playerChips.clear();
    this.allInPlayers.clear();
    this.activePlayers.clear();
    this.totalPotContributions = 0;
  }

  private parseHand(): PokerHand {
    const header = this.parseHeader();
    const table = this.parseTable();
    const players = this.parsePlayers();
    const { blinds, ante } = this.parseBlindsAndAnte();
    const holeCards = this.parseHoleCards();
    const actions: Action[] = [];
    const board: PlayingCard[] = [];
    
    // Add blinds and ante as actions
    actions.push(...blinds);
    if (ante) actions.push(...ante);
    
    // Parse preflop actions
    const preflopActions = this.parseStreetActions('preflop');
    actions.push(...preflopActions);
    
    // Parse flop
    const flopCards = this.parseFlop();
    if (flopCards.length > 0) {
      board.push(...toPlayingCardArray(flopCards));
      const flopActions = this.parseStreetActions('flop');
      actions.push(...flopActions);
    }
    
    // Parse turn
    const turnCard = this.parseTurn();
    if (turnCard) {
      board.push(toPlayingCard(turnCard));
      const turnActions = this.parseStreetActions('turn');
      actions.push(...turnActions);
    }
    
    // Parse river
    const riverCard = this.parseRiver();
    if (riverCard) {
      board.push(toPlayingCard(riverCard));
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
        const player = {
          seat: parseInt(seatMatch[1]),
          name: seatMatch[2],
          chips: parseFloat(seatMatch[3]),
          currentChips: parseFloat(seatMatch[3]),
          isAllIn: false
        };
        players.push(player);
        
        // Initialize chip tracking and active status
        this.playerChips.set(player.name, player.chips);
        this.activePlayers.add(player.name);
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
        const amount = parseFloat(smallBlindMatch[2]);
        blinds.push(this.createAction('blind', smallBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (bigBlindMatch) {
        const amount = parseFloat(bigBlindMatch[2]);
        blinds.push(this.createAction('blind', bigBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (anteMatch) {
        const amount = parseFloat(anteMatch[2]);
        ante.push(this.createAction('ante', anteMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (combinedBlindMatch) {
        const amount = parseFloat(combinedBlindMatch[2]);
        blinds.push(this.createAction('blind', combinedBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (deadBlindMatch) {
        const amount = parseFloat(deadBlindMatch[2]);
        blinds.push(this.createAction('blind', deadBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
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
        
        // Track all-in amount and update chip count
        this.allInPlayers.set(player, amount);
        const currentChips = this.playerChips.get(player) || 0;
        this.playerChips.set(player, Math.max(0, currentChips - amount));
        this.totalPotContributions += amount;
        
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
        
        // Handle player state changes and chip tracking
        if (pattern.type === 'fold') {
          this.activePlayers.delete(player);
        } else if (amount && (pattern.type === 'call' || pattern.type === 'bet' || pattern.type === 'raise')) {
          const currentChips = this.playerChips.get(player) || 0;
          this.playerChips.set(player, Math.max(0, currentChips - amount));
          this.totalPotContributions += amount;
        } else if (amount && pattern.type === 'collected') {
          const currentChips = this.playerChips.get(player) || 0;
          this.playerChips.set(player, currentChips + amount);
        } else if (amount && pattern.type === 'uncalled') {
          const currentChips = this.playerChips.get(player) || 0;
          this.playerChips.set(player, currentChips + amount);
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
    // Get all collected actions from the hand history
    const collectedActions = this.extractCollectedActions();
    
    // Calculate pot structure based on all-in scenarios
    const potCalculation = this.calculatePotStructure();
    
    // Skip to SUMMARY section
    while (this.hasMoreLines() && !this.getLine().includes('SUMMARY')) {
      this.nextLine();
    }
    
    if (!this.hasMoreLines()) {
      return [];
    }
    
    this.nextLine(); // Skip SUMMARY line
    
    // Parse pot information from summary
    const pots = this.parsePotLines(collectedActions, potCalculation);
    
    // Validate and enhance pot information
    this.validateAndEnhancePots(pots, collectedActions);
    
    return pots;
  }

  private extractCollectedActions(): CollectedAction[] {
    const collectedActions: CollectedAction[] = [];
    
    for (const line of this.lines) {
      // Parse various collection patterns
      const patterns = [
        { regex: /([^:]+) collected \$?([\d.]+) from main pot/, type: 'main' as const },
        { regex: /([^:]+) collected \$?([\d.]+) from side pot(?:-(\d+))?/, type: 'side' as const },
        { regex: /([^:]+) collected \$?([\d.]+) from pot/, type: 'single' as const }
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const action: CollectedAction = {
            player: match[1],
            amount: parseFloat(match[2]),
            type: pattern.type
          };
          
          // Extract side pot level if present
          if (pattern.type === 'side' && match[3]) {
            action.sidePotLevel = parseInt(match[3]);
          }
          
          collectedActions.push(action);
          break;
        }
      }
    }
    
    return collectedActions;
  }

  private calculatePotStructure(): PotCalculation {
    const allInAmounts = Array.from(this.allInPlayers.values()).sort((a, b) => a - b);
    
    const calculation: PotCalculation = {
      totalPot: this.totalPotContributions,
      sidePots: [],
      distributions: []
    };
    
    // Calculate side pot structure based on all-in amounts and active players
    if (allInAmounts.length > 0) {
      let prevAmount = 0;
      const totalActivePlayers = this.activePlayers.size + this.allInPlayers.size;
      
      allInAmounts.forEach((amount, index) => {
        // Include both remaining all-in players and active non-all-in players
        const contributingPlayers = (allInAmounts.length - index) + 
          (this.activePlayers.size > 0 ? 1 : 0); // Simplified - active players contribute to all levels
        
        const potAmount = (amount - prevAmount) * contributingPlayers;
        
        if (index === 0) {
          calculation.mainPot = potAmount;
        } else {
          calculation.sidePots.push({
            level: index,
            amount: potAmount
          });
        }
        
        prevAmount = amount;
      });
    }
    
    return calculation;
  }

  private parsePotLines(collectedActions: CollectedAction[], potCalculation: PotCalculation): Pot[] {
    const pots: Pot[] = [];
    
    while (this.hasMoreLines()) {
      const line = this.getLine();
      const totalPotMatch = line.match(/Total pot \$?([\d.]+)/);
      
      if (totalPotMatch) {
        const totalAmount = parseFloat(totalPotMatch[1]);
        
        // Parse main and side pots from the line
        const mainPotMatch = line.match(/Main pot \$?([\d.]+)/);
        const sidePotMatches = Array.from(line.matchAll(/Side pot(?:-(\d+))? \$?([\d.]+)/g));
        
        if (mainPotMatch) {
          // Create main pot
          const mainPot: Pot = {
            amount: parseFloat(mainPotMatch[1]),
            players: [],
            isSide: false,
            sidePotLevel: 0,
            eligiblePlayers: this.getEligiblePlayers(0)
          };
          pots.push(mainPot);
          
          // Create side pots
          sidePotMatches.forEach((match, index) => {
            const level = match[1] ? parseInt(match[1]) : index + 1;
            const sidePot: Pot = {
              amount: parseFloat(match[2]),
              players: [],
              isSide: true,
              sidePotLevel: level,
              eligiblePlayers: this.getEligiblePlayers(level)
            };
            pots.push(sidePot);
          });
        } else {
          // Single pot scenario
          const pot: Pot = {
            amount: totalAmount,
            players: [],
            eligiblePlayers: Array.from(this.playerChips.keys())
          };
          pots.push(pot);
        }
        
        break;
      }
      
      this.nextLine();
    }
    
    return pots;
  }

  private getEligiblePlayers(sidePotLevel: number): string[] {
    // For main pot (level 0), include all active players and all-in players
    if (sidePotLevel === 0) {
      const eligible = new Set<string>();
      // Add active players (not folded)
      this.activePlayers.forEach(player => eligible.add(player));
      // Add all-in players
      this.allInPlayers.forEach((_, player) => eligible.add(player));
      return Array.from(eligible);
    }
    
    // For side pots, only players who contributed enough are eligible
    const allInAmounts = Array.from(this.allInPlayers.entries())
      .sort(([_, a], [__, b]) => a - b);
    
    if (sidePotLevel <= allInAmounts.length) {
      const eligible = new Set<string>();
      // Add remaining all-in players who contributed enough
      allInAmounts.slice(sidePotLevel - 1).forEach(([player, _]) => eligible.add(player));
      // Add active players who can contest higher side pots
      if (this.activePlayers.size > 0) {
        this.activePlayers.forEach(player => eligible.add(player));
      }
      return Array.from(eligible);
    }
    
    return [];
  }

  private validateAndEnhancePots(pots: Pot[], collectedActions: CollectedAction[]): void {
    // Match collected actions to pots
    for (const pot of pots) {
      const relevantActions = collectedActions.filter(action => {
        if (pot.isSide && action.type === 'side') {
          return !action.sidePotLevel || action.sidePotLevel === pot.sidePotLevel;
        } else if (!pot.isSide && (action.type === 'main' || action.type === 'single')) {
          return true;
        }
        return false;
      });
      
      // Check for split pots
      const totalCollected = relevantActions.reduce((sum, action) => sum + action.amount, 0);
      
      if (relevantActions.length > 1) {
        pot.isSplit = true;
        
        // Check for odd chip scenarios
        const evenSplit = pot.amount / relevantActions.length;
        const hasOddChip = pot.amount % relevantActions.length !== 0;
        
        if (hasOddChip) {
          // Find who gets the odd chip (usually determined by position)
          const sortedActions = relevantActions.sort((a, b) => a.amount - b.amount);
          const maxAmount = Math.max(...sortedActions.map(a => a.amount));
          const oddChipWinner = sortedActions.find(a => a.amount === maxAmount);
          
          if (oddChipWinner) {
            pot.oddChipWinner = oddChipWinner.player;
          }
        }
      }
      
      // Add all winners to the pot
      pot.players = relevantActions.map(action => action.player);
      
      // Validate pot math
      if (Math.abs(totalCollected - pot.amount) > 0.01) {
        console.warn(`Pot amount mismatch: expected ${pot.amount}, collected ${totalCollected}`);
      }
    }
    
    // Also check summary lines for additional winners
    this.parseSummaryWinners(pots);
  }

  private parseSummaryWinners(pots: Pot[]): void {
    const currentLine = this.currentLineIndex;
    
    // Reset to after SUMMARY line and look for winner information
    while (this.hasMoreLines()) {
      const line = this.getLine();
      
      const wonMatch = line.match(/Seat \d+: ([^\s]+).*won \((\d+)\)/);
      const collectedMatch = line.match(/Seat \d+: ([^\s]+).*collected \((\d+)\)/);
      const match = wonMatch || collectedMatch;
      
      if (match) {
        const winner = match[1];
        const amount = parseFloat(match[2]);
        
        // Find appropriate pot for this winner
        for (const pot of pots) {
          if (Math.abs(pot.amount - amount) < 0.01 && !pot.players.includes(winner)) {
            pot.players.push(winner);
            break;
          }
        }
      }
      
      this.nextLine();
    }
    
    // Restore line position
    this.currentLineIndex = currentLine;
  }

  private updatePlayersWithHoleCards(players: Player[], holeCards: Map<string, [string, string]>): void {
    for (const player of players) {
      const cards = holeCards.get(player.name);
      if (cards) {
        player.cards = [toPlayingCard(cards[0]), toPlayingCard(cards[1])];
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