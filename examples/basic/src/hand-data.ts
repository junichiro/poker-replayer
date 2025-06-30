/**
 * Sample hand history data for the basic example
 */

export const sampleHandHistory = `PokerStars Hand #243490149326: Tournament #3476545632, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:30:00 ET
Table '3476545632 1' 9-max Seat #1 is the button
Seat 1: HeroPlayer ($1500 in chips)
Seat 2: Villain1 ($1500 in chips)
Seat 3: Player3 ($1500 in chips)
Seat 4: Player4 ($1500 in chips)
Seat 5: Player5 ($1500 in chips)
HeroPlayer: posts small blind 10
Villain1: posts big blind 20
*** HOLE CARDS ***
Dealt to HeroPlayer [As Kh]
Player3: folds
Player4: folds
Player5: raises 40 to 60
HeroPlayer: raises 140 to 200
Villain1: folds
Player5: calls 140
*** FLOP *** [Ah 7c 2d]
HeroPlayer: bets 250
Player5: calls 250
*** TURN *** [Ah 7c 2d] [Kd]
HeroPlayer: bets 500
Player5: folds
Uncalled bet (500) returned to HeroPlayer
HeroPlayer collected 920 from pot
HeroPlayer: doesn't show hand
*** SUMMARY ***
Total pot 920 | Rake 0
Board [Ah 7c 2d Kd]
Seat 1: HeroPlayer (button) (small blind) collected (920)
Seat 2: Villain1 (big blind) folded before Flop
Seat 3: Player3 folded before Flop (didn't bet)
Seat 4: Player4 folded before Flop (didn't bet)
Seat 5: Player5 folded on the Turn`;

export const allInHandHistory = `PokerStars Hand #456789123: Hold'em No Limit ($2/$5 USD) - 2024/01/15 22:00:00 ET
Table 'AllInTable' 6-max Seat #3 is the button
Seat 1: ShortStack ($45 in chips)
Seat 2: MediumStack ($120 in chips)
Seat 3: BigStack ($300 in chips)
ShortStack: posts small blind 2
MediumStack: posts big blind 5
*** HOLE CARDS ***
Dealt to ShortStack [Ac Ah]
BigStack: raises 10 to 15
ShortStack: raises 30 to 45 and is all-in
MediumStack: calls 40
BigStack: calls 30
*** FLOP *** [Kh 9s 2c]
MediumStack: checks
BigStack: bets 75
MediumStack: calls 75 and is all-in
*** TURN *** [Kh 9s 2c] [7d]
*** RIVER *** [Kh 9s 2c 7d] [3h]
*** SHOW DOWN ***
ShortStack: shows [Ac Ah] (a pair of Aces)
MediumStack: shows [Kc Qd] (a pair of Kings)
BigStack: shows [9h 9c] (three of a kind, Nines)
ShortStack collected 135 from main pot
BigStack collected 150 from side pot
*** SUMMARY ***
Total pot 285 Main pot 135. Side pot 150. | Rake 0
Board [Kh 9s 2c 7d 3h]
Seat 1: ShortStack (small blind) showed [Ac Ah] and won (135) with a pair of Aces
Seat 2: MediumStack (big blind) showed [Kc Qd] and lost with a pair of Kings
Seat 3: BigStack (button) showed [9h 9c] and won (150) with three of a kind, Nines`;

export const invalidHandHistory = `This is not a valid hand history format`;

export const handHistories = {
  sample: sampleHandHistory,
  allIn: allInHandHistory,
  invalid: invalidHandHistory,
};