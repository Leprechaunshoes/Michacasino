// ===== Shared State =====
let houseBalance = 1000;
let playerBalance = 1000;

// ===== SLOT MACHINE =====
const slotSymbols = ['🌠', '💎', '🔮', '🌌', '⭐', '🪐'];
function spinSlot() {
  const bet = parseFloat(document.getElementById('slot-bet').value);
  if (playerBalance < bet) return alert("Not enough HC!");

  const reels = document.getElementById('slot-reels');
  reels.innerHTML = "";
  let result = [];
  for (let row = 0; row < 3; row++) {
    let line = [];
    for (let col = 0; col < 5; col++) {
      let symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      line.push(symbol);
    }
    result.push(line);
  }

  // Display
  result.forEach(row => {
    let div = document.createElement('div');
    div.classList.add('slot-row');
    div.innerHTML = row.join(" ");
    reels.appendChild(div);
  });

  // Check wins (middle row match)
  const middle = result[1];
  let win = 0;
  if (new Set(middle).size === 1) {
    win = bet * 10;
  } else if (new Set(middle.slice(0, 3)).size === 1) {
    win = bet * 3;
  }

  playerBalance -= bet;
  playerBalance += win;
  document.getElementById('slot-result').textContent = win ? `You won ${win.toFixed(2)} HC!` : "Try again!";
}

// ===== BLACKJACK =====
let player = [], dealer = [];
function drawCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let value = values[Math.floor(Math.random() * values.length)];
  let suit = suits[Math.floor(Math.random() * suits.length)];
  return { value, suit };
}
function cardValue(card) {
  if (['J','Q','K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}
function calcTotal(hand) {
  let total = 0, aces = 0;
  hand.forEach(card => {
    total += cardValue(card);
    if (card.value === 'A') aces++;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}
function displayHands() {
  const dealerDiv = document.getElementById('dealer-cards');
  const playerDiv = document.getElementById('player-cards');
  dealerDiv.innerHTML = dealer.map(c => `<div class="card">${c.value}${c.suit}</div>`).join('');
  playerDiv.innerHTML = player.map(c => `<div class="card">${c.value}${c.suit}</div>`).join('');
}
function deal() {
  const bet = parseFloat(document.getElementById('blackjack-bet').value);
  if (playerBalance < bet) return alert("Not enough HC!");

  playerBalance -= bet;
  player = [drawCard(), drawCard()];
  dealer = [drawCard()];
  displayHands();
  document.getElementById('blackjack-status').textContent = "";
}
function hit() {
  player.push(drawCard());
  displayHands();
  if (calcTotal(player) > 21) {
    document.getElementById('blackjack-status').textContent = "You busted!";
  }
}
function stand() {
  const bet = parseFloat(document.getElementById('blackjack-bet').value);
  while (calcTotal(dealer) < 17) dealer.push(drawCard());
  displayHands();
  let pTotal = calcTotal(player), dTotal = calcTotal(dealer);
  let result = "";

  if (pTotal > 21) result = "You lose!";
  else if (dTotal > 21 || pTotal > dTotal) {
    result = "You win!";
    playerBalance += bet * 2;
  } else if (pTotal === dTotal) {
    result = "Push.";
    playerBalance += bet;
  } else {
    result = "You lose!";
  }

  document.getElementById('blackjack-status').textContent = result;
}

// ===== PLINKO =====
const multipliers = [2, 1.5, 1, 0.5, 2, 0.5, 1, 1.5, 3, 0.5, 1, 5];
function drawPlinkoBoard() {
  const board = document.getElementById('plinko-board');
  board.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    let row = document.createElement('div');
    row.className = 'plinko-row';
    for (let j = 0; j <= i; j++) {
      let peg = document.createElement('div');
      peg.className = 'peg';
      row.appendChild(peg);
    }
    board.appendChild(row);
  }

  const slots = document.getElementById('plinko-slots');
  slots.innerHTML = multipliers.map(m => `<div class='plinko-slot'>x${m}</div>`).join('');
}
function dropPlinko() {
  const bet = parseFloat(document.getElementById('plinko-bet').value);
  if (playerBalance < bet) return alert("Not enough HC!");

  let pos = 6;
  for (let i = 0; i < 12; i++) {
    pos += Math.random() > 0.5 ? 1 : -1;
    if (pos < 0) pos = 0;
    if (pos > multipliers.length - 1) pos = multipliers.length - 1;
  }
  const multiplier = multipliers[pos];
  const win = bet * multiplier;

  playerBalance -= bet;
  playerBalance += win;
  document.getElementById('plinko-result').textContent = `Landed on x${multiplier}. You won ${win.toFixed(2)} HC!`;
}
drawPlinkoBoard();
