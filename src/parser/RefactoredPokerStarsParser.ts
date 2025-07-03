import {
  PokerHand,
  Player,
  Action,
  TableInfo,
  Street,
  ParserResult,
  PlayingCard,
  PLAYING_CARD_REGEX,
} from '../types';
import {
  IPotCalculator,
  IPlayerStateTracker,
  IActionParser,
  IHandHistoryValidator,
  PotCalculator,
  PlayerStateTracker,
  ActionParser,
  HandHistoryValidator,
} from '../services';

/**
 * Validates if a string is a valid playing card and returns it as PlayingCard type
 */
function toPlayingCard(cardString: string): PlayingCard {
  if (!PLAYING_CARD_REGEX.test(cardString)) {
    throw new Error(
      `Invalid card format: ${cardString}. Expected format: rank + suit (e.g., "As", "Kh")`
    );
  }
  return cardString as PlayingCard;
}

/**
 * Safely converts an array of strings to PlayingCard array
 */
function toPlayingCardArray(cardStrings: string[]): PlayingCard[] {
  return cardStrings.map(toPlayingCard);
}

/**
 * Refactored PokerStars parser that follows Single Responsibility Principle
 * by delegating specific concerns to focused service classes
 */
export class RefactoredPokerStarsParser {
  private lines: string[];
  private currentLineIndex: number;
  private totalPotContributions: number;

  constructor(
    private potCalculator: IPotCalculator = new PotCalculator(),
    private playerStateTracker: IPlayerStateTracker = new PlayerStateTracker(),
    private actionParser: IActionParser = new ActionParser(),
    private validator: IHandHistoryValidator = new HandHistoryValidator()
  ) {
    this.lines = [];
    this.currentLineIndex = 0;
    this.totalPotContributions = 0;
  }

  public parse(handHistory: string): ParserResult {
    try {
      this.reset();

      // Handle empty input correctly
      if (!handHistory.trim()) {
        return this.createError('Empty hand history');
      }

      this.lines = handHistory
        .trim()
        .split('\n')
        .map(line => line.trim());

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
    this.totalPotContributions = 0;
    this.playerStateTracker.reset();
    this.actionParser.reset();
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

    // Parse summary using action parser service
    const summaryResult = this.parseSummary();

    // Add any collected actions that weren't captured during action parsing
    const collectedActions = this.createCollectedActions(summaryResult.collectedActions);
    actions.push(...collectedActions);

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
      pots: summaryResult.pots,
      rake: summaryResult.rake,
    };
  }

  private parseHeader(): {
    id: string;
    tournamentId?: string;
    stakes: string;
    date: Date;
  } {
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

    const date = new Date(
      `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4].padStart(2, '0')}:${dateMatch[5]}:${dateMatch[6]}`
    );

    this.nextLine();

    return {
      id: handIdMatch[1],
      tournamentId: tournamentMatch?.[1],
      stakes,
      date,
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
      buttonSeat: buttonMatch ? parseInt(buttonMatch[1]) : 1,
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
          isAllIn: false,
        };
        players.push(player);

        // Initialize player in state tracker
        this.playerStateTracker.initializePlayer(player.name, player.chips);
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
        blinds.push(this.actionParser.createAction('blind', smallBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (bigBlindMatch) {
        const amount = parseFloat(bigBlindMatch[2]);
        blinds.push(this.actionParser.createAction('blind', bigBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (anteMatch) {
        const amount = parseFloat(anteMatch[2]);
        ante.push(this.actionParser.createAction('ante', anteMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (combinedBlindMatch) {
        const amount = parseFloat(combinedBlindMatch[2]);
        blinds.push(this.actionParser.createAction('blind', combinedBlindMatch[1], amount, 'preflop'));
        this.totalPotContributions += amount;
      } else if (deadBlindMatch) {
        const amount = parseFloat(deadBlindMatch[2]);
        blinds.push(this.actionParser.createAction('blind', deadBlindMatch[1], amount, 'preflop'));
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
      if (
        line.includes('FLOP') ||
        line.includes('TURN') ||
        line.includes('RIVER') ||
        line.includes('SHOW DOWN') ||
        line.includes('SUMMARY')
      ) {
        break;
      }

      const action = this.actionParser.parseAction(line, street);
      if (action) {
        // Update player state based on action
        this.updatePlayerStateFromAction(action);
        actions.push(action);
        this.nextLine();
      } else {
        break;
      }
    }

    return actions;
  }

  private updatePlayerStateFromAction(action: Action): void {
    if (!action.player) return;

    // Handle state changes based on action type and amount
    if (action.type === 'fold') {
      this.playerStateTracker.removeActivePlayer(action.player);
    } else if (action.isAllIn && action.amount) {
      this.playerStateTracker.markPlayerAllIn(action.player, action.amount);
      this.totalPotContributions += action.amount;
    } else if (action.amount && ['call', 'bet', 'raise', 'blind', 'ante'].includes(action.type)) {
      const currentChips = this.playerStateTracker.getPlayerChips(action.player);
      this.playerStateTracker.trackPlayerChips(action.player, Math.max(0, currentChips - action.amount));
      this.totalPotContributions += action.amount;
    } else if (action.amount && action.type === 'collected') {
      const currentChips = this.playerStateTracker.getPlayerChips(action.player);
      this.playerStateTracker.trackPlayerChips(action.player, currentChips + action.amount);
    } else if (action.amount && action.type === 'uncalled') {
      const currentChips = this.playerStateTracker.getPlayerChips(action.player);
      this.playerStateTracker.trackPlayerChips(action.player, currentChips + action.amount);
    }
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
          const action = this.actionParser.createAction('show', showMatch[1], undefined, 'showdown');
          action.cards = showMatch[2].split(' ');
          actions.push(action);
        }

        this.nextLine();
      }
    }

    return actions;
  }

  private parseSummary(): { pots: any[]; rake?: number; collectedActions: any[] } {
    // Get all collected actions from the hand history using action parser service
    const collectedActions = this.actionParser.extractCollectedActions(this.lines);

    // Calculate pot structure using pot calculator service
    const allInPlayers = this.playerStateTracker.getAllInPlayers();
    const activePlayers = this.playerStateTracker.getActivePlayers();
    const allInAmounts = Array.from(allInPlayers.values());
    
    const potCalculation = this.potCalculator.calculatePotStructure(
      allInAmounts,
      this.totalPotContributions,
      activePlayers,
      allInPlayers
    );

    // Skip to SUMMARY section
    while (this.hasMoreLines() && !this.getLine().includes('SUMMARY')) {
      this.nextLine();
    }

    if (!this.hasMoreLines()) {
      return { pots: [], collectedActions: [] };
    }

    this.nextLine(); // Skip SUMMARY line

    // Parse pot information from summary
    const pots = this.parsePotLines(collectedActions, potCalculation);

    // Parse rake information
    let rake: number | undefined;
    const currentPos = this.currentLineIndex;
    this.currentLineIndex = 0; // Reset to start

    while (this.hasMoreLines()) {
      const line = this.getLine();
      const rakeMatch = line.match(/Total pot \$?[\d.]+\s*\|\s*Rake \$?([\d.]+)/);
      if (rakeMatch) {
        rake = parseFloat(rakeMatch[1]);
        break;
      }
      this.nextLine();
    }

    this.currentLineIndex = currentPos; // Restore position

    // Enhance and validate pot information using services
    this.potCalculator.enhancePots(pots, collectedActions);

    return { pots, rake, collectedActions };
  }

  private parsePotLines(collectedActions: any[], potCalculation: any): any[] {
    const pots: any[] = [];

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
          const allInPlayers = this.playerStateTracker.getAllInPlayers();
          const activePlayers = this.playerStateTracker.getActivePlayers();
          
          const mainPot: any = {
            amount: parseFloat(mainPotMatch[1]),
            players: [],
            isSide: false,
            sidePotLevel: 0,
            eligiblePlayers: this.potCalculator.getEligiblePlayers(0, allInPlayers, activePlayers),
          };
          pots.push(mainPot);

          // Create side pots
          sidePotMatches.forEach((match, index) => {
            const level = match[1] ? parseInt(match[1]) : index + 1;
            const sidePot: any = {
              amount: parseFloat(match[2]),
              players: [],
              isSide: true,
              sidePotLevel: level,
              eligiblePlayers: this.potCalculator.getEligiblePlayers(level, allInPlayers, activePlayers),
            };
            pots.push(sidePot);
          });
        } else {
          // Single pot scenario
          const pot: any = {
            amount: totalAmount,
            players: [],
            eligiblePlayers: Array.from(this.playerStateTracker.getAllInPlayers().keys()).concat(
              Array.from(this.playerStateTracker.getActivePlayers())
            ),
          };
          pots.push(pot);
        }

        break;
      }

      this.nextLine();
    }

    return pots;
  }

  private createCollectedActions(collectedActions: any[]): Action[] {
    const actions: Action[] = [];

    // Create action objects from the extracted collected actions
    for (const collectedAction of collectedActions) {
      const action = this.actionParser.createAction(
        'collected',
        collectedAction.player,
        collectedAction.amount,
        'showdown'
      );
      actions.push(action);
    }

    return actions;
  }

  private updatePlayersWithHoleCards(
    players: Player[],
    holeCards: Map<string, [string, string]>
  ): void {
    for (const player of players) {
      const cards = holeCards.get(player.name);
      if (cards) {
        player.cards = [toPlayingCard(cards[0]), toPlayingCard(cards[1])];
        player.isHero = true;
      }
    }
  }

  private createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: this.currentLineIndex,
        context:
          this.currentLineIndex < this.lines.length ? this.lines[this.currentLineIndex] : undefined,
      },
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