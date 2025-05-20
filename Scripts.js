let balance = 1000;
const balanceEl = document.getElementById("balance");

// ✅ Update balance
function updateBalance(amount) {
  balance += amount;
  balanceEl.textContent = balance.toFixed(1);
}

// 🎰 SLOT MACHINE
const symbols = ["🌟", "💎", "🔮", "🌌", "🪐"];
function spinSlot() {
  const bet = parseFloat(document.getElementById("slot-bet").value);
  if (bet > balance) return alert("Not enough balance!");
  updateBalance(-bet);

  let reels = [[], [], [], [], []];
  for (let i = 0; i < 5; i++) {
    const reel = document.getElementById(`reel${i + 1}`);
    reel.innerHTML = "";
    for (let j = 0; j < 3; j++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      reels[i].push(symbol);
      const div = document.createElement("div");
      div.className = "slot-symbol";
      div.textContent = symbol;
      reel.appendChild(div);
    }
  }

  // Win check: center line match
  const middleRow = reels.map(col => col[1]);
  const allSame = middleRow.every(sym => sym === middleRow[0]);
  const resultEl = document.getElementById("slot-result");

  if (allSame) {
    const win = bet * 5;
    updateBalance(win);
    resultEl.textContent = `✨ Jackpot! You won ${win} HC!`;
  } else {
    resultEl.textContent = `No win this time.`;
  }
}

// 🃏 BLACKJACK
let deck = [], playerHand = [], dealerHand = [], bjBet = 0;
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  deck.sort(() => 0.5 - Math.random());
}
function getBJValue(hand) {
  let val = 0, aces = 0;
  for (let card of hand) {
    if (["J", "Q", "K"].includes(card.value)) val += 10;
    else if (card.value === "A") { val += 11; aces++; }
    else val += parseInt(card.value);
  }
  while (val > 21 && aces--) val -= 10;
  return val;
}
function renderBJ() {
  const playerEl = document.getElementById("player-hand");
  const dealerEl = document.getElementById("dealer-hand");
  playerEl.innerHTML = "";
  dealerEl.innerHTML = "";
  for (let c of playerHand) {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${c.value}${c.suit}`;
    playerEl.appendChild(div);
  }
  for (let c of dealerHand) {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${c.value}${c.suit}`;
    dealerEl.appendChild(div);
  }
}
function startBlackjack() {
  bjBet = parseFloat(document.getElementById("bj-bet").value);
  if (bjBet > balance) return alert("Not enough balance!");
  updateBalance(-bjBet);

  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  renderBJ();
  document.getElementById("bj-result").textContent = "";
}
function hit() {
  playerHand.push(deck.pop());
  renderBJ();
  if (getBJValue(playerHand) > 21) {
    document.getElementById("bj-result").textContent = "Bust! You lose.";
  }
}
function stand() {
  while (getBJValue(dealerHand) < 17) dealerHand.push(deck.pop());
  renderBJ();
  const playerVal = getBJValue(playerHand);
  const dealerVal = getBJValue(dealerHand);
  let msg = "";
  if (dealerVal > 21 || playerVal > dealerVal) {
    updateBalance(bjBet * 2);
    msg = "You win!";
  } else if (dealerVal === playerVal) {
    updateBalance(bjBet);
    msg = "Push.";
  } else {
    msg = "Dealer wins.";
  }
  document.getElementById("bj-result").textContent = msg;
}

// 💥 PLINKO
const multipliers = [0, 0.5, 1, 0.2, 2, 0.1, 5, 0.1, 2, 0.2, 1, 0.5, 0];
function dropPlinko() {
  const bet = parseFloat(document.getElementById("plinko-bet").value);
  if (bet > balance) return alert("Not enough balance!");
  updateBalance(-bet);

  const resultEl = document.getElementById("plinko-result");
  let position = 6; // middle
  for (let i = 0; i < 12; i++) {
    position += Math.random() < 0.5 ? -1 : 1;
    if (position < 0) position = 0;
    if (position > 12) position = 12;
  }

  const multiplier = multipliers[position] || 0;
  const winnings = bet * multiplier;
  updateBalance(winnings);
  resultEl.textContent = `Landed in slot ${position} — Multiplier: ${multiplier}x — Won: ${winnings.toFixed(1)} HC`;
}
