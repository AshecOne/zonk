import { create } from 'zustand';
import { Card, GameState, Player, Play, Suit, Rank } from '../types/game';
import {validateTriple, validateDasar, validateContinueDasar, getRankValue} from '../utils/card-validation'

interface GameStore extends GameState {
    initializeGame: (players: string[]) => void;
    dealCards: () => void;
    playCards: (playerId: string, cards: Card[], playType: 'dasar' | 'triple', targetPlayId?: string) => boolean;
    checkWinCondition: () => boolean;
    calculateScore: (cards: Card[]) => number;
    nextTurn: () => void;
    markPlayerDead: (playerId: string) => void;
    resetGame: () => void;
  }

// Helper function untuk membuat deck
const createDeck = (deckNumber: 1 | 2): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      const value = 
        rank === 'A' ? 15 :
        ['J', 'Q', 'K'].includes(rank) ? 10 :
        parseInt(rank);

      deck.push({
        id: `${suit}-${rank}-${deckNumber}`,
        suit,
        rank,
        deck: deckNumber,
        value
      });
    });
  });

  return deck;
};

// Helper function untuk shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  players: [],
  deck: [],
  currentPlayerIndex: 0,
  playsOnTable: [],
  gameStatus: 'waiting',
  remainingCards: 108,
  currentTurn: 0,

  // Methods
  initializeGame: (playerNames: string[]) => {
    console.log('Initializing game with players:', playerNames);
    // Create deck
    let deck = [
      ...createDeck(1),
      ...createDeck(2),
      // Add 4 jokers
      ...Array(4).fill(null).map((_, i) => ({
        id: `joker-${i}`,
        suit: 'joker' as Suit,
        rank: 'JOKER' as Rank,
        deck: (i < 2 ? 1 : 2) as 1 | 2,
        value: 0
      }))
    ];

    // Shuffle deck
    deck = shuffleArray(deck);

    // Create players
    const players = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      cards: [],
      isAlive: true,
      hasPlayedBase: false,
      turnOrder: index
    }));

    set({
      players,
      deck,
      gameStatus: 'playing',
      currentPlayerIndex: 0,
      playsOnTable: [],
      remainingCards: deck.length,
      currentTurn: 0
    });
  },

  resetGame: () => {
    set({
      players: [],
      deck: [],
      currentPlayerIndex: 0,
      playsOnTable: [],
      gameStatus: 'waiting',
      remainingCards: 0,
      currentTurn: 0,
      winner: undefined,
    });
  },

  dealCards: () => {
    const state = get();
    const newDeck = [...state.deck];
    const newPlayers = state.players.map(player => ({
      ...player,
      cards: newDeck.splice(0, 20).sort((a, b) => {
        // Sort by suit then rank
        if (a.suit === b.suit) {
          const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
          return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
        }
        return a.suit.localeCompare(b.suit);
      })
    }));

    set({
      players: newPlayers,
      deck: newDeck,
      remainingCards: newDeck.length
    });
  },
  calculateScore: (cards: Card[]): number => {
    return cards.reduce((sum, card) => sum + card.value, 0);
  },

  markPlayerDead: (playerId: string) => {
    const state = get();
    const newPlayers = state.players.map(player =>
      player.id === playerId ? { ...player, isAlive: false } : player
    );

    const alivePlayers = newPlayers.filter(p => p.isAlive);
    if (alivePlayers.length <= 1) {
      const scores = newPlayers.map(player => ({
        player,
        score: get().calculateScore(player.cards)
      })).sort((a, b) => a.score - b.score);

      set({ 
        players: newPlayers,
        gameStatus: 'finished',
        winner: scores[0].player
      });
    } else {
      set({ players: newPlayers });
    }
  },

  playCards: (playerId: string, cards: Card[], playType: 'dasar' | 'triple', targetPlayId?: string) => {
    const state = get();
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    // Validasi berdasarkan tipe permainan
    if (playType === 'dasar') {
      if (targetPlayId) {
        // Menyambung ke dasar yang sudah ada
        const targetPlay = state.playsOnTable.find(p => p.id === targetPlayId);
        if (!targetPlay || targetPlay.type !== 'dasar') return false;

        // Tentukan posisi sambungan (before/after) berdasarkan rank kartu
        const position = getRankValue(cards[0].rank) < getRankValue(targetPlay.cards[0].rank) 
          ? 'before' 
          : 'after';

        if (!validateContinueDasar(targetPlay.cards, cards, position)) {
          return false;
        }

        // Update kartu di meja
        const newPlaysOnTable = state.playsOnTable.map(play => {
          if (play.id === targetPlayId) {
            return {
              ...play,
              cards: position === 'before' 
                ? [...cards, ...play.cards]
                : [...play.cards, ...cards]
            };
          }
          return play;
        });

        // Update state
        set(state => ({
          ...state,
          playsOnTable: newPlaysOnTable
        }));
      } else {
        // Membuat dasar baru
        if (!validateDasar(cards)) return false;
        
        const newPlay: Play = {
          id: `play-${Date.now()}`,
          type: 'dasar',
          cards,
          playerId,
          sequence: state.playsOnTable.length
        };

        set(state => ({
          ...state,
          playsOnTable: [...state.playsOnTable, newPlay]
        }));
      }
    } else { // Triple
      if (!validateTriple(cards)) return false;

      const newPlay: Play = {
        id: `play-${Date.now()}`,
        type: 'triple',
        cards,
        playerId,
        sequence: state.playsOnTable.length
      };

      set(state => ({
        ...state,
        playsOnTable: [...state.playsOnTable, newPlay]
      }));
    }

    // Remove played cards from player's hand
    const newPlayers = [...state.players];
    const player = {...newPlayers[playerIndex]};
    player.cards = player.cards.filter(card => 
      !cards.find(playedCard => playedCard.id === card.id)
    );

    if (playType === 'dasar' && !targetPlayId) {
      player.hasPlayedBase = true;
    }

    newPlayers[playerIndex] = player;
    set({ players: newPlayers });

    return true;
  },

  checkWinCondition: () => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];

    // Check for empty cards (zonk)
    if (player.cards.length === 0) {
      set({ winner: player, gameStatus: 'finished' });
      return true;
    }

    // Check for 4 jokers
    const jokerCount = player.cards.filter(card => card.rank === 'JOKER').length;
    if (jokerCount === 4) {
      set({ winner: player, gameStatus: 'finished' });
      return true;
    }

    // Check for 8 same rank cards
    const rankCounts = player.cards.reduce((acc, card) => {
      acc[card.rank] = (acc[card.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.values(rankCounts).some(count => count === 8)) {
      set({ winner: player, gameStatus: 'finished' });
      return true;
    }

    return false;
  },

  nextTurn: () => {
    const state = get();
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

    // Find next alive player
    while (!state.players[nextPlayerIndex].isAlive && nextPlayerIndex !== state.currentPlayerIndex) {
      nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
    }

    set({
      currentPlayerIndex: nextPlayerIndex,
      currentTurn: state.currentTurn + 1
    });
  },
}));

