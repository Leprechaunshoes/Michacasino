// Global game state
let houseCoins = 1000;
let currentBet = 1;
document.getElementById('balance').innerText = houseCoins;

// --- Utility Functions ---
function updateBalance(amount) {
  houseCoins += amount;
  document.getElementById('balance').innerText = houseCoins;
}

function showResult(message, isWin = false) {
  const result = document.getElementById('result');
  result.innerText = message;
  result.style.color = isWin ? 'lime' : 'red';
  result.classList.add('flash');
  setTimeout(() => result.classList.remove('flash'), 1000);
}

// --- Slot Machine ---
document.getElementById('spin-btn').addEventListener('click', () => {
  if (houseCoins < currentBet) return showResult("Not enough coins!");

  const symbols = ['🌌', '🪐', '✨', '👾', '🚀'];
  const reels = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * symbols.length);
    reels.push(symbols[index]);
    document.getElementById(`reel${i}`).innerText = symbols[index];
  }

  updateBalance(-currentBet);
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    let win = currentBet * 10;
    updateBalance(win);
    showResult(`You won ${win} HC! 🚀`, true);
  } else {
    showResult("Try again!");
  }
});

// --- Blackjack ---
let bjDeck = [], bjPlayer = [], bjDealer = [];

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];
  for (let s of suits) {
    for (let v of values) {
      deck.push({ value: v, suit: s });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function calcPoints(hand) {
  let points = 0;
  let aces = 0;
  hand.forEach(card => {
    if (['J', 'Q', 'K'].includes(card.value)) points += 10;
    else if (card.value === 'A') {
      points += 11;
      aces++;
    } else {
      points += parseInt(card.value);
    }
  });
  while (points > 21 && aces) {
    points -= 10;
    aces--;
  }
  return points;
}

function renderBJHands() {
  document.getElementById('player-hand').innerText = bjPlayer.map(c => `${c.value}${c.suit}`).join(' ');
  document.getElementById('dealer-hand').innerText = bjDealer.map(c => `${c.value}${c.suit}`).join(' ');
}

document.getElementById('deal-btn').addEventListener('click', () => {
  if (houseCoins < currentBet) return showResult("Not enough coins!");

  bjDeck = createDeck();
  bjPlayer = [bjDeck.pop(), bjDeck.pop()];
  bjDealer = [bjDeck.pop(), bjDeck.pop()];
  updateBalance(-currentBet);
  renderBJHands();
});

document.getElementById('hit-btn').addEventListener('click', () => {
  bjPlayer.push(bjDeck.pop());
  renderBJHands();
  if (calcPoints(bjPlayer) > 21) {
    showResult("Bust!");
  }
});

document.getElementById('stand-btn').addEventListener('click', () => {
  while (calcPoints(bjDealer) < 17) bjDealer.push(bjDeck.pop());
  renderBJHands();

  const playerPts = calcPoints(bjPlayer);
  const dealerPts = calcPoints(bjDealer);

  if (dealerPts > 21 || playerPts > dealerPts) {
    let win = currentBet * 2;
    updateBalance(win);
    showResult(`Blackjack Win! +${win} HC`, true);
  } else if (playerPts === dealerPts) {
    updateBalance(currentBet);
    showResult("Push");
  } else {
    showResult("Dealer wins!");
  }
});

// --- Plinko ---
document.getElementById('drop-ball-btn').addEventListener('click', () => {
  if (houseCoins < currentBet) return showResult("Not enough coins!");

  const multipliers = [0, 0.5, 1, 2, 5, 10];
  const path = Math.floor(Math.random() * multipliers.length);
  const multiplier = multipliers[path];

  updateBalance(-currentBet);

  let win = currentBet * multiplier;
  if (win > 0) {
    updateBalance(win);
    showResult(`Plinko Win: ${win} HC`, true);
  } else {
    showResult("No luck!");
  }

  const plinkoOutput = document.getElementById('plinko-result');
  plinkoOutput.innerText = `Ball dropped into x${multiplier} slot`;
});

// --- Donation ---
document.getElementById('donate-btn').addEventListener('click', () => {
  const wallet = "6ZL5LU6ZOG5SQLYD2GLBGFZK7TKM2BB7WGFZCRILWPRRHLH3NYVU5BASYI";
  navigator.clipboard.writeText(wallet).then(() => {
    showResult("Donation wallet copied ✅", true);
  });
});
