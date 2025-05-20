function showGame(gameId) {
  document.querySelectorAll(".game-section").forEach(section => {
    section.style.display = "none";
  });
  document.getElementById(gameId).style.display = "block";
}

/* ---------------- SLOT MACHINE ---------------- */
const symbols = ["💫", "🌟", "🚀", "🌙", "🪐", "🛸"];
function spinSlot() {
  const r1 = symbols[Math.floor(Math.random() * symbols.length)];
  const r2 = symbols[Math.floor(Math.random() * symbols.length)];
  const r3 = symbols[Math.floor(Math.random() * symbols.length)];

  document.getElementById("reel1").textContent = r1;
  document.getElementById("reel2").textContent = r2;
  document.getElementById("reel3").textContent = r3;

  let result = document.getElementById("slot-result");
  if (r1 === r2 && r2 === r3) {
    result.innerHTML = "🎉 <b>JACKPOT!</b> You won!";
    result.className = "slot-win";
  } else if (r1 === r2 || r2 === r3 || r1 === r3) {
    result.innerHTML = "✨ Partial win!";
    result.className = "slot-partial";
  } else {
    result.innerHTML = "😢 No match. Try again!";
    result.className = "slot-lose";
  }
}

/* ---------------- BLACKJACK ---------------- */
let deck = [], playerHand = [], dealerHand = [];

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function dealBlackjack() {
  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  updateBlackjackUI();
  document.getElementById("blackjack-result").textContent = "";
}

function hit() {
  playerHand.push(deck.pop());
  updateBlackjackUI();
  if (getHandValue(playerHand) > 21) {
    document.getElementById("blackjack-result").textContent = "💥 Bust!";
  }
}

function stand() {
  while (getHandValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  updateBlackjackUI();

  const playerTotal = getHandValue(playerHand);
  const dealerTotal = getHandValue(dealerHand);
  let result = "";

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    result = "🪐 You win!";
  } else if (playerTotal < dealerTotal) {
    result = "👾 Dealer wins!";
  } else {
    result = "🤝 Push!";
  }

  document.getElementById("blackjack-result").textContent = result;
}

function updateBlackjackUI() {
  const dealerDiv = document.getElementById("dealer-cards");
  const playerDiv = document.getElementById("player-cards");
  dealerDiv.innerHTML = dealerHand.map(card => renderCard(card)).join("");
  playerDiv.innerHTML = playerHand.map(card => renderCard(card)).join("");
}

function renderCard(card) {
  return `<span class="card cosmic">${card.value}${card.suit}</span>`;
}

function getHandValue(hand) {
  let value = 0, aces = 0;
  for (let card of hand) {
    if (["K", "Q", "J"].includes(card.value)) {
      value += 10;
    } else if (card.value === "A") {
      value += 11;
      aces += 1;
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

/* ---------------- PLINKO ---------------- */
const multipliers = [0, 0.2, 0.5, 1, 2, 5, 10, 2, 1, 0.5, 0.2, 0];
function dropPlinko() {
  const resultIndex = Math.floor(Math.random() * multipliers.length);
  const result = multipliers[resultIndex];
  const board = document.getElementById("plinko-board");
  board.innerHTML = "";

  const row = document.createElement("div");
  row.className = "plinko-row";
  for (let i = 0; i < multipliers.length; i++) {
    const cell = document.createElement("div");
    cell.className = "plinko-cell";
    cell.textContent = multipliers[i] + "x";
    if (i === resultIndex) {
      cell.classList.add("plinko-hit");
    }
    row.appendChild(cell);
  }
  board.appendChild(row);

  const resultText = result > 0 ? `🔥 You won ${result}x!` : "😢 No multiplier!";
  document.getElementById("plinko-result").textContent = resultText;
}
