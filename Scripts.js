let hcBalance = 1000;
updateBalance();

// Utility
function updateBalance() {
  document.getElementById("hc-balance").innerText = hcBalance.toFixed(2);
}
function getBet(id) {
  return parseFloat(document.getElementById(id).value);
}
function updateSliderDisplay(id, amountId) {
  const amount = getBet(id);
  document.getElementById(amountId).innerText = amount;
}
document.getElementById("slot-bet").addEventListener("input", () => updateSliderDisplay("slot-bet", "slot-bet-amount"));
document.getElementById("bj-bet").addEventListener("input", () => updateSliderDisplay("bj-bet", "bj-bet-amount"));
document.getElementById("plinko-bet").addEventListener("input", () => updateSliderDisplay("plinko-bet", "plinko-bet-amount"));

// SLOT MACHINE
const slotIcons = ["🌟", "💫", "✨", "🌕", "🪐"];
function spinSlots() {
  const bet = getBet("slot-bet");
  if (hcBalance < bet) return alert("Not enough HC!");
  hcBalance -= bet;

  let result = [];
  for (let r = 0; r < 3; r++) {
    result[r] = [];
    for (let c = 0; c < 5; c++) {
      const icon = slotIcons[Math.floor(Math.random() * slotIcons.length)];
      document.getElementById(`slot-${r}-${c}`).innerText = icon;
      result[r][c] = icon;
    }
  }

  // Very simple win check: if middle row has 3+ same icons
  const middleRow = result[1];
  const counts = {};
  for (let icon of middleRow) counts[icon] = (counts[icon] || 0) + 1;
  const highest = Math.max(...Object.values(counts));

  let win = 0;
  if (highest >= 3) win = bet * highest;
  hcBalance += win;

  document.getElementById("slot-result").innerText = win > 0 ? `You won ${win} HC!` : "No win.";
  updateBalance();
}

// BLACKJACK
let bjDeck = [];
let playerCards = [];
let dealerCards = [];
function startBlackjack() {
  const bet = getBet("bj-bet");
  if (hcBalance < bet) return alert("Not enough HC!");
  hcBalance -= bet;

  bjDeck = createDeck();
  playerCards = [drawCard(), drawCard()];
  dealerCards = [drawCard(), drawCard()];

  renderCards("player-cards", playerCards);
  renderCards("dealer-cards", [dealerCards[0], "🂠"]);

  document.getElementById("blackjack-result").innerText = "";
  updateBalance();
}

function hit() {
  playerCards.push(drawCard());
  renderCards("player-cards", playerCards);
  const total = handValue(playerCards);
  if (total > 21) endBlackjack("Bust! Dealer wins.");
}

function stand() {
  renderCards("dealer-cards", dealerCards);
  while (handValue(dealerCards) < 17) {
    dealerCards.push(drawCard());
    renderCards("dealer-cards", dealerCards);
  }

  const playerTotal = handValue(playerCards);
  const dealerTotal = handValue(dealerCards);
  const bet = getBet("bj-bet");

  let result;
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    result = `You win ${bet * 2} HC!`;
    hcBalance += bet * 2;
  } else if (dealerTotal === playerTotal) {
    result = "Push. Bet returned.";
    hcBalance += bet;
  } else {
    result = "Dealer wins.";
  }

  document.getElementById("blackjack-result").innerText = result;
  updateBalance();
}

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];
  for (let suit of suits) {
    for (let val of values) deck.push({ val, suit });
  }
  return deck.sort(() => 0.5 - Math.random());
}

function drawCard() {
  return bjDeck.pop();
}

function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (let card of cards) {
    if (typeof card === "string") continue;
    if (card.val === "A") {
      total += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.val)) {
      total += 10;
    } else {
      total += parseInt(card.val);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function renderCards(containerId, cards) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (let card of cards) {
    const div = document.createElement("div");
    div.classList.add("card");
    if (typeof card === "string") {
      div.innerText = card;
    } else {
      div.innerText = `${card.val}${card.suit}`;
    }
    container.appendChild(div);
  }
}

// PLINKO
const multipliers = [0.5, 1, 1.5, 2, 3, 2, 1.5, 1, 0.5];

function dropPlinkoBall() {
  const bet = getBet("plinko-bet");
  if (hcBalance < bet) return alert("Not enough HC!");
  hcBalance -= bet;

  const column = Math.floor(Math.random() * multipliers.length);
  const payout = bet * multipliers[column];
  hcBalance += payout;

  const board = document.getElementById("plinko-board");
  board.innerHTML = "";
  for (let i = 0; i < multipliers.length; i++) {
    const cell = document.createElement("div");
    cell.className = "plinko-cell";
    cell.innerText = `${multipliers[i]}x`;
    if (i === column) cell.classList.add("plinko-hit");
    board.appendChild(cell);
  }

  document.getElementById("plinko-result").innerText = `Ball landed on ${multipliers[column]}x. You won ${payout.toFixed(2)} HC!`;
  updateBalance();
}
