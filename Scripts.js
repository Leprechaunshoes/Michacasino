// --- Shared Bet Slider Updates ---
document.getElementById("slotBetSlider").oninput = function () {
  document.getElementById("slotBetValue").innerText = this.value + " HC";
};
document.getElementById("bjBetSlider").oninput = function () {
  document.getElementById("bjBetValue").innerText = this.value + " HC";
};
document.getElementById("plinkoBetSlider").oninput = function () {
  document.getElementById("plinkoBetValue").innerText = this.value + " HC";
};

// --- SLOT MACHINE ---
function spinSlot() {
  const emojis = ["🌟", "💫", "🚀", "🪐", "👾", "🔮"];
  const reel1 = document.getElementById("reel1");
  const reel2 = document.getElementById("reel2");
  const reel3 = document.getElementById("reel3");

  const result1 = emojis[Math.floor(Math.random() * emojis.length)];
  const result2 = emojis[Math.floor(Math.random() * emojis.length)];
  const result3 = emojis[Math.floor(Math.random() * emojis.length)];

  reel1.textContent = result1;
  reel2.textContent = result2;
  reel3.textContent = result3;

  const resultText = document.getElementById("slot-result");
  if (result1 === result2 && result2 === result3) {
    resultText.innerText = "🎉 JACKPOT! You win!";
  } else if (result1 === result2 || result2 === result3 || result1 === result3) {
    resultText.innerText = "✨ Partial Win!";
  } else {
    resultText.innerText = "🙃 Try again!";
  }
}

// --- BLACKJACK ---
let player = [], dealer = [], deck = [];

function createDeck() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function getCardHTML(card) {
  return `<div class="card">${card.value}${card.suit}</div>`;
}

function getHandValue(hand) {
  let value = 0, aces = 0;
  hand.forEach(card => {
    if (['J','Q','K'].includes(card.value)) value += 10;
    else if (card.value === 'A') {
      value += 11;
      aces++;
    } else value += parseInt(card.value);
  });
  while (value > 21 && aces) {
    value -= 10;
    aces--;
  }
  return value;
}

function deal() {
  createDeck();
  player = [deck.pop(), deck.pop()];
  dealer = [deck.pop(), deck.pop()];
  updateHands();
  document.getElementById("bj-result").innerText = "";
}

function hit() {
  player.push(deck.pop());
  updateHands();
  if (getHandValue(player) > 21) {
    document.getElementById("bj-result").innerText = "😵 Bust! Dealer wins.";
  }
}

function stand() {
  while (getHandValue(dealer) < 17) dealer.push(deck.pop());
  updateHands();
  const playerScore = getHandValue(player);
  const dealerScore = getHandValue(dealer);
  let result = "";
  if (dealerScore > 21 || playerScore > dealerScore) result = "🤑 You win!";
  else if (playerScore < dealerScore) result = "😓 Dealer wins.";
  else result = "🤝 Push!";
  document.getElementById("bj-result").innerText = result;
}

function updateHands() {
  document.getElementById("player-hand").innerHTML = player.map(getCardHTML).join("");
  document.getElementById("dealer-hand").innerHTML = dealer.map(getCardHTML).join("");
}

// --- PLINKO ---
function createPlinkoBoard() {
  const board = document.getElementById("plinko-board");
  board.innerHTML = "";
  const rows = 12;
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.className = "plinko-row";
    for (let j = 0; j <= i; j++) {
      const peg = document.createElement("div");
      peg.className = "plinko-peg";
      row.appendChild(peg);
    }
    board.appendChild(row);
  }
  const multipliers = [0.5, 0.75, 1, 2, 5, 10, 5, 2, 1, 0.75, 0.5];
  const multRow = document.createElement("div");
  multRow.className = "plinko-multiplier-row";
  multipliers.forEach(m => {
    const mult = document.createElement("div");
    mult.className = "plinko-multiplier";
    mult.innerText = m + "x";
    multRow.appendChild(mult);
  });
  board.appendChild(multRow);
}

function dropPlinkoBall() {
  const multipliers = [0.5, 0.75, 1, 2, 5, 10, 5, 2, 1, 0.75, 0.5];
  const position = Math.floor(multipliers.length / 2) + (Math.floor(Math.random() * 5) - 2);
  const finalIndex = Math.max(0, Math.min(multipliers.length - 1, position));
  const mult = multipliers[finalIndex];
  const bet = parseFloat(document.getElementById("plinkoBetSlider").value);
  const result = bet * mult;

  document.getElementById("plinko-result").innerText = `🎯 You hit ${mult}x! Won ${result.toFixed(2)} HC`;
}

// Initialize board on load
window.onload = createPlinkoBoard;
