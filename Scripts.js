// --- Global State ---
let playMoneyMode = false;
const walletBalances = {
  real: 100,  // placeholder starting balance
  play: 1000, // play money balance
};
let currentBalances = { ...walletBalances };

// Utility for updating balances display (you can hook your UI here)
function updateBalances() {
  // Implement if you want visible balances on UI
}

// --- MODE TOGGLE ---
document.getElementById('modeToggle').addEventListener('change', (e) => {
  playMoneyMode = e.target.checked;
  currentBalances = playMoneyMode ? walletBalances.play : walletBalances.real;
  alert(`Switched to ${playMoneyMode ? 'Play Money' : 'Real Money'} mode`);
});

// --- SLOT MACHINE ---

const slotSymbols = [
  '🍒', '🍋', '🔔', '⭐', '🍀', '💎', '7️⃣'
];

const slotReels = [
  document.getElementById('reel1'),
  document.getElementById('reel2'),
  document.getElementById('reel3'),
  document.getElementById('reel4'),
  document.getElementById('reel5')
];

function spinSlotReels() {
  return slotReels.map(() => {
    const idx = Math.floor(Math.random() * slotSymbols.length);
    return slotSymbols[idx];
  });
}

function evaluateSlotResult(results) {
  // Simple example: payout if 3+ consecutive same symbols anywhere
  let payout = 0;
  let count = 1;
  for (let i = 1; i < results.length; i++) {
    if (results[i] === results[i - 1]) count++;
    else {
      if (count >= 3) payout += 1 * count; // arbitrary multiplier
      count = 1;
    }
  }
  if (count >= 3) payout += 1 * count;

  return payout;
}

document.getElementById('spinBtn').addEventListener('click', () => {
  const betInput = document.getElementById('slotBet');
  let bet = parseFloat(betInput.value);
  if (bet > currentBalances) {
    alert('Insufficient balance!');
    return;
  }
  currentBalances -= bet;
  updateBalances();

  let spins = 20;
  let interval = 75;
  let count = 0;

  const spinInterval = setInterval(() => {
    const results = spinSlotReels();
    results.forEach((sym, i) => slotReels[i].textContent = sym);
    count++;
    if (count >= spins) {
      clearInterval(spinInterval);
      const payout = evaluateSlotResult(results);
      if (payout > 0) {
        const winnings = bet * payout;
        currentBalances += winnings;
        updateBalances();
        document.getElementById('slotResult').textContent = `You won ${winnings.toFixed(2)} Amina!`;
      } else {
        document.getElementById('slotResult').textContent = `No win this time. Try again!`;
      }
    }
  }, interval);
});

document.getElementById('slotBet').addEventListener('input', (e) => {
  document.getElementById('slotBetAmount').textContent = parseFloat(e.target.value).toFixed(2);
});

// --- BLACKJACK ---

class Deck {
  constructor() {
    this.cards = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    suits.forEach(s => {
      ranks.forEach(r => {
        this.cards.push({ suit: s, rank: r });
      });
    });
    this.shuffle();
  }
  shuffle() {
    for(let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  draw() {
    return this.cards.pop();
  }
}

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

function calculateScore(hand) {
  let total = 0;
  let aces = 0;
  hand.forEach(card => {
    total += cardValue(card);
    if (card.rank === 'A') aces++;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderCards(container, hand) {
  container.innerHTML = '';
  hand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.textContent = `${card.rank}${card.suit}`;
    container.appendChild(cardDiv);
  });
}

const dealerCardsEl = document.getElementById('dealerCards');
const playerCardsEl = document.getElementById('playerCards');
const dealerScoreEl = document.getElementById('dealerScore');
const playerScoreEl = document.getElementById('playerScore');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const bjResultEl = document.getElementById('bjResult');
const bjBetInput = document.getElementById('bjBet');
const bjBetAmountLabel = document.getElementById('bjBetAmount');

let deck, dealerHand, playerHand, currentBet;

function resetBlackjack() {
  deck = new Deck();
  dealerHand = [];
  playerHand = [];
  bjResultEl.textContent = '';
  currentBet = parseFloat(bjBetInput.value);
  if (currentBet > currentBalances) {
    alert('Insufficient balance!');
    return false;
  }
  currentBalances -= currentBet;
  updateBalances();
  return true;
}

function startBlackjack() {
  if (!resetBlackjack()) return;
  playerHand.push(deck.draw());
  dealerHand.push(deck.draw());
  playerHand.push(deck.draw());
  dealerHand.push(deck.draw());

  renderCards(playerCardsEl, playerHand);
  renderCards(dealerCardsEl, [dealerHand[0], {rank: '?', suit: '?'}]); // hide dealer second card
  playerScoreEl.textContent = `Score: ${calculateScore(playerHand)}`;
  dealerScoreEl.textContent = `Score: ?`;
  hitBtn.disabled = false;
  standBtn.disabled = false;
}

function dealerPlay() {
  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(deck.draw());
  }
}

function endBlackjack() {
  const playerScore = calculateScore(playerHand);
  dealerPlay();
  const dealerScore = calculateScore(dealerHand);
  renderCards(dealerCardsEl, dealerHand);
  dealerScoreEl.textContent = `Score: ${dealerScore}`;
  playerScoreEl.textContent = `Score: ${playerScore}`;

  let resultText = '';
  let payout = 0;

  if (playerScore > 21) {
    resultText = 'Bust! You lose.';
  } else if (dealerScore > 21) {
    resultText = 'Dealer busts! You win!';
    payout = currentBet * 2;
  } else if (playerScore > dealerScore) {
    resultText = 'You win!';
    payout = currentBet * 2;
  } else if (playerScore === dealerScore) {
    resultText = 'Push. Bet returned.';
    payout = currentBet;
  } else {
    resultText = 'You lose.';
  }

  if (payout > 0) {
    currentBalances += payout;
    updateBalances();
  }

  bjResultEl.textContent = resultText;
  hitBtn.disabled = true;
  standBtn.disabled = true;
}

hitBtn.addEventListener('click', () => {
  playerHand.push(deck.draw());
  renderCards(playerCardsEl, playerHand);
  const score = calculateScore(playerHand);
  playerScoreEl.textContent = `Score: ${score}`;
  if (score > 21) {
    endBlackjack();
  }
});

standBtn.addEventListener('click', () => {
  endBlackjack();
});

bjBetInput.addEventListener('input', (e) => {
  bjBetAmountLabel.textContent = parseFloat(e.target.value).toFixed(2);
});

// Start a new round on load
startBlackjack();


// --- PLINKO ---

const plinkoBoardEl = document.getElementById('plinkoBoard');
const dropBallBtn = document.getElementById('dropBallBtn');
const plinkoBetInput = document.getElementById('plinkoBet');
const plinkoBetAmountLabel = document.getElementById('plinkoBetAmount');
const plinkoResultEl = document.getElementById('plinkoResult');

const plinkoRows = 12;
const plinkoSlots = plinkoRows + 1;

const plinkoMultipliers = [0, 1, 0.5, 0.75, 2, 0.5, 1, 1.5, 3, 0.25, 4, 0.1, 5];

let plinkoGrid = [];

function createPlinkoGrid() {
  plinkoBoardEl.innerHTML = '';
  plinkoGrid = [];
  for (let r = 0; r < plinkoRows; r
