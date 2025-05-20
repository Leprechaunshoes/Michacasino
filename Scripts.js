// Utility
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ================= SLOT MACHINE =================
const slotSymbols = ["🌟", "👽", "🪐", "🚀", "💫", "🔮"];
const slotReels = document.getElementById("slot-reels");
const spinBtn = document.getElementById("spin-btn");
const slotResult = document.getElementById("slot-result");
const slotBetSlider = document.getElementById("slot-bet");
const slotBetValue = document.getElementById("slot-bet-value");

slotBetSlider.addEventListener("input", () => {
  slotBetValue.textContent = slotBetSlider.value;
});

function generateSlotGrid() {
  slotReels.innerHTML = "";
  for (let row = 0; row < 3; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "slot-row";
    for (let col = 0; col < 5; col++) {
      const symbol = slotSymbols[getRandomInt(0, slotSymbols.length - 1)];
      const span = document.createElement("span");
      span.textContent = symbol;
      span.className = "slot-cell";
      rowDiv.appendChild(span);
    }
    slotReels.appendChild(rowDiv);
  }
}

function checkSlotWin() {
  const rows = slotReels.querySelectorAll(".slot-row");
  let win = false;
  rows.forEach(row => {
    const symbols = Array.from(row.children).map(c => c.textContent);
    const first = symbols[0];
    if (symbols.every(s => s === first)) {
      win = true;
      row.style.animation = "winFlash 1s ease-in-out infinite alternate";
    } else {
      row.style.animation = "none";
    }
  });
  return win;
}

spinBtn.addEventListener("click", () => {
  generateSlotGrid();
  const win = checkSlotWin();
  slotResult.textContent = win ? "🌈 WINNER!" : "Try Again!";
});

// ================= BLACKJACK =================
const dealBtn = document.getElementById("deal-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const dealerHandDiv = document.getElementById("dealer-hand");
const playerHandDiv = document.getElementById("player-hand");
const blackjackResult = document.getElementById("blackjack-result");
const blackjackBet = document.getElementById("blackjack-bet");
const blackjackBetValue = document.getElementById("blackjack-bet-value");

blackjackBet.addEventListener("input", () => {
  blackjackBetValue.textContent = blackjackBet.value;
});

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let deck = [], playerHand = [], dealerHand = [];

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  deck.sort(() => Math.random() - 0.5);
}

function dealCard(hand, div) {
  const card = deck.pop();
  hand.push(card);
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";
  cardDiv.textContent = `${card.value}${card.suit}`;
  div.appendChild(cardDiv);
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (let card of hand) {
    if (["J", "Q", "K"].includes(card.value)) value += 10;
    else if (card.value === "A") {
      value += 11;
      aces++;
    } else {
      value += parseInt(card.value);
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

function endBlackjack() {
  hitBtn.disabled = true;
  standBtn.disabled = true;
  let dealerValue = getHandValue(dealerHand);
  while (dealerValue < 17) {
    dealCard(dealerHand, dealerHandDiv);
    dealerValue = getHandValue(dealerHand);
  }
  const playerValue = getHandValue(playerHand);
  if (playerValue > 21) {
    blackjackResult.textContent = "Bust! Dealer wins!";
  } else if (dealerValue > 21 || playerValue > dealerValue) {
    blackjackResult.textContent = "You win!";
  } else if (dealerValue === playerValue) {
    blackjackResult.textContent = "Push!";
  } else {
    blackjackResult.textContent = "Dealer wins!";
  }
}

dealBtn.addEventListener("click", () => {
  createDeck();
  playerHand = [];
  dealerHand = [];
  playerHandDiv.innerHTML = "";
  dealerHandDiv.innerHTML = "";
  blackjackResult.textContent = "";
  dealCard(playerHand, playerHandDiv);
  dealCard(playerHand, playerHandDiv);
  dealCard(dealerHand, dealerHandDiv);
  hitBtn.disabled = false;
  standBtn.disabled = false;
});

hitBtn.addEventListener("click", () => {
  dealCard(playerHand, playerHandDiv);
  const val = getHandValue(playerHand);
  if (val > 21) {
    blackjackResult.textContent = "Bust!";
    endBlackjack();
  }
});

standBtn.addEventListener("click", () => {
  endBlackjack();
});

// ================= PLINKO =================
const plinkoBoard = document.getElementById("plinko-board");
const dropBallBtn = document.getElementById("drop-ball-btn");
const plinkoResult = document.getElementById("plinko-result");
const plinkoBet = document.getElementById("plinko-bet");
const plinkoBetValue = document.getElementById("plinko-bet-value");

plinkoBet.addEventListener("input", () => {
  plinkoBetValue.textContent = plinkoBet.value;
});

const multipliers = [0.5, 1, 2, 3, 5, 10, 15, 20, 50, 100, 250, 500];

function dropPlinkoBall() {
  plinkoBoard.innerHTML = "";
  const ball = document.createElement("div");
  ball.className = "plinko-ball";
  plinkoBoard.appendChild(ball);

  let column = 6;
  let steps = 12;
  for (let i = 0; i < steps; i++) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    column += dir;
    column = Math.max(0, Math.min(11, column));
  }

  const multiplier = multipliers[column];
  const bet = parseFloat(plinkoBet.value);
  const win = (bet * multiplier).toFixed(2);
  plinkoResult.textContent = `Ball landed in x${multiplier} → You win ${win} HC!`;
}

dropBallBtn.addEventListener("click", dropPlinkoBall);
