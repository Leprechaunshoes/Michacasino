// Global Variables
let houseCoins = 1000;
let currentBet = 1;

// Initialize on page load
window.onload = () => {
  updateHouseCoins();
};

// Update House Coins Display
function updateHouseCoins() {
  document.getElementById("houseCoins").innerText = `HC: ${houseCoins}`;
}

// ---------------- SLOT MACHINE ----------------
const slotSymbols = ['🌟', '🌙', '💫', '🪐', '☄️', '🔮'];

function spinSlot() {
  if (houseCoins < currentBet) return alert("Not enough HC.");
  houseCoins -= currentBet;

  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");

  let s1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
  let s2 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
  let s3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];

  slot1.innerText = s1;
  slot2.innerText = s2;
  slot3.innerText = s3;

  let win = 0;
  if (s1 === s2 && s2 === s3) {
    win = currentBet * 10;
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    win = currentBet * 2;
  }

  houseCoins += win;
  updateHouseCoins();
  showResult('slotResult', win);
}

// ---------------- BLACKJACK ----------------
let playerCards = [];
let dealerCards = [];

function dealCard() {
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return { rank, suit };
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return card.rank;
}

function calculateTotal(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderCards(hand, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  hand.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerText = `${card.rank}${card.suit}`;
    container.appendChild(div);
  });
}

function startBlackjack() {
  if (houseCoins < currentBet) return alert("Not enough HC.");
  houseCoins -= currentBet;
  updateHouseCoins();

  playerCards = [dealCard(), dealCard()];
  dealerCards = [dealCard()];
  renderCards(playerCards, 'playerCards');
  renderCards(dealerCards, 'dealerCards');
  document.getElementById('bjResult').innerText = '';
}

function hitCard() {
  playerCards.push(dealCard());
  renderCards(playerCards, 'playerCards');

  const total = calculateTotal(playerCards);
  if (total > 21) {
    showResult('bjResult', 0, "Bust!");
  }
}

function standCards() {
  while (calculateTotal(dealerCards) < 17) {
    dealerCards.push(dealCard());
  }
  renderCards(dealerCards, 'dealerCards');

  const playerTotal = calculateTotal(playerCards);
  const dealerTotal = calculateTotal(dealerCards);

  let win = 0;
  if ((playerTotal <= 21 && playerTotal > dealerTotal) || dealerTotal > 21) {
    win = currentBet * 2;
  } else if (playerTotal === dealerTotal) {
    win = currentBet;
  }

  houseCoins += win;
  updateHouseCoins();
  showResult('bjResult', win);
}

// ---------------- PLINKO ----------------
function playPlinko() {
  if (houseCoins < currentBet) return alert("Not enough HC.");
  houseCoins -= currentBet;

  const ball = document.createElement('div');
  ball.className = 'plinkoBall';
  document.getElementById('plinkoBoard').appendChild(ball);

  const columnCount = 12;
  let pos = 6; // Start in the middle
  let interval = setInterval(() => {
    ball.style.left = `${pos * 30}px`;
    if (Math.random() > 0.5 && pos < columnCount - 1) pos++;
    else if (pos > 0) pos--;
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    let multiplier = [0, 0.5, 0.75, 1, 1.25, 1.5, 2, 1.5, 1.25, 1, 0.75, 0.5][pos];
    let win = Math.round(currentBet * multiplier);
    houseCoins += win;
    updateHouseCoins();
    showResult('plinkoResult', win);
    ball.remove();
  }, 2000);
}

// ---------------- COMMON ----------------
function setBet(val) {
  currentBet = parseFloat(val);
  document.getElementById("betDisplay").innerText = `Bet: ${currentBet} HC`;
}

function showResult(id, amount, message) {
  const el = document.getElementById(id);
  el.innerText = message || (amount > 0 ? `You won ${amount} HC!` : "You lost.");
  el.style.color = amount > 0 ? 'lime' : 'red';
}
