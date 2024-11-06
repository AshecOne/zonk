import { Card, Suit, Rank } from '../types/game';

// Helper untuk mendapatkan nilai numerik dari rank
export const getRankValue = (rank: Rank): number => {
  const rankOrder = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, 'JOKER': 0
  };
  return rankOrder[rank];
};

// Validasi untuk dasar (kartu berurutan dengan jenis sama)
export const validateDasar = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;

  // Pisahkan joker dan kartu biasa
  const jokers = cards.filter(card => card.suit === 'joker');
  const normalCards = cards.filter(card => card.suit !== 'joker');

  // Jika semua kartu adalah joker, tidak valid
  if (normalCards.length === 0) return false;

  // Cek apakah semua kartu normal memiliki jenis yang sama
  const baseSuit = normalCards[0].suit;
  if (!normalCards.every(card => card.suit === baseSuit)) return false;

  // Urutkan kartu berdasarkan rank
  const sortedCards = [...normalCards].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));

  // Cek urutan dengan mempertimbangkan joker
  let currentRank = getRankValue(sortedCards[0].rank);
  let jokerCount = jokers.length;
  
  for (let i = 1; i < sortedCards.length; i++) {
    const nextRank = getRankValue(sortedCards[i].rank);
    const gap = nextRank - currentRank - 1;
    
    if (gap > 0) {
      if (jokerCount >= gap) {
        jokerCount -= gap;
      } else {
        return false;
      }
    } else if (gap < 0 || gap > 1) {
      return false;
    }
    currentRank = nextRank;
  }

  return true;
};

// Validasi untuk triple (3 kartu dengan rank sama)
export const validateTriple = (cards: Card[]): boolean => {
  if (cards.length !== 3) return false;

  // Pisahkan joker dan kartu biasa
  const jokers = cards.filter(card => card.suit === 'joker');
  const normalCards = cards.filter(card => card.suit !== 'joker');

  // Jika semua kartu adalah joker, tidak valid
  if (normalCards.length === 0) return false;

  // Ambil rank dari kartu pertama yang bukan joker
  const baseRank = normalCards[0].rank;
  
  // Cek apakah semua kartu normal memiliki rank yang sama
  return normalCards.every(card => card.rank === baseRank);
};

// Validasi untuk menyambung ke dasar yang sudah ada
export const validateContinueDasar = (
  existingCards: Card[],
  newCards: Card[],
  position: 'before' | 'after'
): boolean => {
  if (newCards.length === 0) return false;

  // Pisahkan joker dan kartu biasa dari kartu baru
  const jokers = newCards.filter(card => card.suit === 'joker');
  const normalNewCards = newCards.filter(card => card.suit !== 'joker');

  // Jika semua kartu baru adalah joker, tidak valid
  if (normalNewCards.length === 0) return false;

  // Cek kesamaan jenis dengan dasar
  const baseSuit = existingCards[0].suit;
  if (!normalNewCards.every(card => card.suit === baseSuit)) return false;

  if (position === 'after') {
    const lastCard = existingCards[existingCards.length - 1];
    const lastRankValue = getRankValue(lastCard.rank);
    
    // Urutkan kartu baru
    const sortedNewCards = [...normalNewCards].sort((a, b) => 
      getRankValue(a.rank) - getRankValue(b.rank)
    );

    // Cek apakah kartu pertama yang akan disambung sesuai urutan
    const firstNewRankValue = getRankValue(sortedNewCards[0].rank);
    if (firstNewRankValue !== lastRankValue + 1 && jokers.length === 0) {
      return false;
    }

    // Cek urutan kartu baru
    let currentRank = firstNewRankValue;
    let remainingJokers = jokers.length;
    
    for (let i = 1; i < sortedNewCards.length; i++) {
      const nextRank = getRankValue(sortedNewCards[i].rank);
      const gap = nextRank - currentRank - 1;
      
      if (gap > 0) {
        if (remainingJokers >= gap) {
          remainingJokers -= gap;
        } else {
          return false;
        }
      } else if (gap < 0) {
        return false;
      }
      currentRank = nextRank;
    }
  } else { // position === 'before'
    const firstCard = existingCards[0];
    const firstRankValue = getRankValue(firstCard.rank);
    
    // Urutkan kartu baru
    const sortedNewCards = [...normalNewCards].sort((a, b) => 
      getRankValue(b.rank) - getRankValue(a.rank)
    );

    // Cek apakah kartu terakhir yang akan disambung sesuai urutan
    const lastNewRankValue = getRankValue(sortedNewCards[0].rank);
    if (lastNewRankValue !== firstRankValue - 1 && jokers.length === 0) {
      return false;
    }

    // Cek urutan kartu baru (mundur)
    let currentRank = lastNewRankValue;
    let remainingJokers = jokers.length;
    
    for (let i = 1; i < sortedNewCards.length; i++) {
      const prevRank = getRankValue(sortedNewCards[i].rank);
      const gap = currentRank - prevRank - 1;
      
      if (gap > 0) {
        if (remainingJokers >= gap) {
          remainingJokers -= gap;
        } else {
          return false;
        }
      } else if (gap < 0) {
        return false;
      }
      currentRank = prevRank;
    }
  }

  return true;
};