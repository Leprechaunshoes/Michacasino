// --- Global Variables ---
let houseBalance = 1000;
let dailyClaimed = false;

// --- Utility Functions ---
function updateBalanceDisplay() {
  document.getElementById('house-balance').innerText = houseBalance.toFixed(2);
}

function claimDailyBonus() {
  if (!dailyClaimed) {
    houseBalance += 1000;
    dailyClaimed = true;
    updateBalanceDisplay();
    alert("You've claimed 1000 HC!");
  } else {
    alert("Daily bonus already claimed.");
  }
}

// --- SLOT MACHINE ---
const symbols = ["🌟", "💫", "🌕", "🪐", "✨", "🔮"];
function spinSlot() {
  const bet = parseFloat(document.getElementById("slot-bet-slider").value);
  if (houseBalance < bet) return alert("Insufficient HC.");
  houseBalance -= bet;
  let reels = [];

  for (let i = 1; i <= 5; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    reels.push(symbol);
    document.getElementById(`reel${i}`).innerText = symbol;
  }

  const result = reels.join('');
  const win = reels.every(s => s === reels[0]); // All match = win
  if (win) {
    const payout = bet * 10;
    houseBalance += payout;
    document.getElementById("slot-result").innerText = `🎉 Jackpot! +${payout.toFixed(2)} HC`;
  } else {
    document.getElementById("slot-result").innerText = `No win. Try again!`;
  }
  updateBalanceDisplay();
}
document.getElementById("slot-bet-slider").addEventListener("input", e => {
  document.getElementById("slot-bet").innerText = parseFloat(e.target.value).toFixed(2);
});

// --- BLACKJACK ---
let playerCards = [], dealerCards = [], bjBet = 0;

function startBlackjack() {
  bjBet = parseFloat(document.getElementById("bj-bet-slider").value);
  if (houseBalance < bjBet) return alert("Not enough HC.");
  houseBalance -= bjBet;
  playerCards = [drawCard(), drawCard()];
  dealerCards = [drawCard()];
  updateBlackjackDisplay();
  document.getElementById("blackjack-result").innerText = "";
}

function drawCard() {
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]; // Face cards and Ace
  return values[Math.floor(Math.random() * values.length)];
}

function getTotal(cards) {
  let total = cards.reduce((a, b) => a + b, 0);
  let aces = cards.filter(c => c === 11).length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

function updateBlackjackDisplay() {
  document.getElementById("player-cards").innerText = playerCards.join(", ");
  document.getElementById("dealer-cards").innerText = dealerCards.join(", ");
}

function hit() {
  if (playerCards.length === 0) return;
  playerCards.push(drawCard());
  updateBlackjackDisplay();
  if (getTotal(playerCards) > 21) {
    document.getElementById("blackjack-result").innerText = "💥 Bust! You lose.";
  }
}

function stand() {
  if (playerCards.length === 0) return;
  while (getTotal(dealerCards) < 17) {
    dealerCards.push(drawCard());
  }
  updateBlackjackDisplay();
  let playerTotal = getTotal(playerCards);
  let dealerTotal = getTotal(dealerCards);

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    houseBalance += bjBet * 2;
    document.getElementById("blackjack-result").innerText = "🎉 You win!";
  } else if (playerTotal === dealerTotal) {
    houseBalance += bjBet; // Push
    document.getElementById("blackjack-result").innerText = "🤝 Push!";
  } else {
    document.getElementById("blackjack-result").innerText = "😢 Dealer wins.";
  }
  playerCards = [];
  dealerCards = [];
  updateBalanceDisplay();
}
document.getElementById("bj-bet-slider").addEventListener("input", e => {
  document.getElementById("bj-bet").innerText = parseFloat(e.target.value).toFixed(2);
});

// --- PLINKO ---
const multipliers = [0.2, 0.5, 1, 2, 5, 10, 5, 2, 1, 0.5, 0.2];
const rows = 12;

function generatePlinkoBoard() {
  const board = document.getElementById("plinko-board");
  board.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    const row = document.createElement("div");
    row.className = "plinko-row";
    for (let c = 0; c <= r; c++) {
      const peg = document.createElement("div");
      peg.className = "peg";
      row.appendChild(peg);
    }
    board.appendChild(row);
  }
}
generatePlinkoBoard();

function dropPlinko() {
  const bet = parseFloat(document.getElementById("plinko-bet-slider").value);
  if (houseBalance < bet) return alert("Not enough HC.");
  houseBalance -= bet;

  let pos = Math.floor(multipliers.length / 2); // Start center
  for (let i = 0; i < rows; i++) {
    pos += Math.random() < 0.5 ? -1 : 1;
    pos = Math.max(0, Math.min(multipliers.length - 1, pos));
  }
  const multi = multipliers[pos];
  const winnings = bet * multi;
  houseBalance += winnings;
  document.getElementById("plinko-result").innerText = `🎯 Landed on ${multi}x! Won ${winnings.toFixed(2)} HC`;
  updateBalanceDisplay();
}
document.getElementById("plinko-bet-slider").addEventListener("input", e => {
  document.getElementById("plinko-bet").innerText = parseFloat(e.target.value).toFixed(2);
});
