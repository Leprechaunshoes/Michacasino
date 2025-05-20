// ======= BALANCE & CURRENCY =======
let aminaBalance = 10.0;
let houseBalance = 1000.0;
let useAmina = false;

const aminaBalanceEl = document.getElementById("amina-balance");
const houseBalanceEl = document.getElementById("house-balance");
const currencyModeEl = document.getElementById("currency-mode");
const toggleCurrencyBtn = document.getElementById("toggle-currency");

function getBalance() {
  return useAmina ? aminaBalance : houseBalance;
}
function setBalance(newAmount) {
  if (useAmina) aminaBalance = newAmount;
  else houseBalance = newAmount;
}
function updateBalanceDisplay() {
  aminaBalanceEl.textContent = aminaBalance.toFixed(2);
  houseBalanceEl.textContent = houseBalance.toFixed(1);
  currencyModeEl.textContent = `Current: ${useAmina ? "Amina" : "House Coins"}`;
}
function updateBalance(amount) {
  setBalance(getBalance() + amount);
  updateBalanceDisplay();
}
toggleCurrencyBtn.onclick = function () {
  useAmina = !useAmina;
  toggleCurrencyBtn.textContent = useAmina ? "Switch to House Coins" : "Switch to Amina";
  updateBalanceDisplay();
};
document.getElementById("connect-wallet").onclick = function () {
  alert("Pera Wallet connect coming soon!");
};
updateBalanceDisplay();

// ======= BET SLIDERS =======
function setupBetSlider(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  input.oninput = () => display.textContent = input.value;
  display.textContent = input.value;
}
setupBetSlider("bj-bet", "bj-bet-display");
setupBetSlider("slot-bet", "slot-bet-display");
setupBetSlider("plinko-bet", "plinko-bet-display");

// ======= BLACKJACK =======
let deck = [], playerHand = [], dealerHand = [], bjBet = 0, bjActive = false;
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  deck = [];
  for (let suit of suits)
    for (let value of values)
      deck.push({ value, suit });
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
function renderBJ(hideDealer = false) {
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
  dealerHand.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = (hideDealer && idx === 1 && bjActive) ? "🂠" : `${c.value}${c.suit}`;
    dealerEl.appendChild(div);
  });
}
function startBlackjack() {
  if (bjActive) return;
  bjBet = parseFloat(document.getElementById("bj-bet").value);
  if (bjBet > getBalance()) return alert("Not enough balance!");
  updateBalance(-bjBet);

  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  bjActive = true;
  document.getElementById("bj-hit").disabled = false;
  document.getElementById("bj-stand").disabled = false;
  document.getElementById("bj-result").textContent = "";
  renderBJ(true);

  // Check for blackjack
  if (getBJValue(playerHand) === 21) stand();
}
function hit() {
  if (!bjActive) return;
  playerHand.push(deck.pop());
  renderBJ(true);
  if (getBJValue(playerHand) > 21) {
    document.getElementById("bj-result").textContent = "Bust! You lose.";
    endBlackjack();
  }
}
function stand() {
  if (!bjActive) return;
  while (getBJValue(dealerHand) < 17) dealerHand.push(deck.pop());
  renderBJ(false);
  const playerVal = getBJValue(playerHand);
  const dealerVal = getBJValue(dealerHand);
  let msg = "";
  if (playerVal > 21) {
    msg = "Bust! You lose.";
  } else if (dealerVal > 21 || playerVal > dealerVal) {
    updateBalance(bjBet * 2);
    msg = "You win!";
  } else if (dealerVal === playerVal) {
    updateBalance(bjBet);
    msg = "Push.";
  } else {
    msg = "Dealer wins.";
  }
  document.getElementById("bj-result").textContent = msg;
  endBlackjack();
}
function endBlackjack() {
  bjActive = false;
  document.getElementById("bj-hit").disabled = true;
  document.getElementById("bj-stand").disabled = true;
}
document.getElementById("bj-deal").onclick = startBlackjack;
document.getElementById("bj-hit").onclick = hit;
document.getElementById("bj-stand").onclick = stand;
document.getElementById("bj-hit").disabled = true;
document.getElementById("bj-stand").disabled = true;

// ======= SLOT MACHINE =======
const slotSymbols = ["🌟", "💎", "🔮", "🌌", "🪐", "🍀", "7️⃣"];
const slotRows = 3, slotCols = 3;
let slotSpinning = false;

function renderSlotReels(symbolGrid) {
  for (let col = 0; col < slotCols; col++) {
    const reel = document.getElementById(`slot-reel-${col}`);
    reel.innerHTML = "";
    for (let row = 0; row < slotRows; row++) {
      const div = document.createElement("div");
      div.className = "slot-symbol";
      div.textContent = symbolGrid[col][row];
      reel.appendChild(div);
    }
  }
}

function getRandomSymbol() {
  return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
}

function getRandomGrid() {
  // [col][row]
  let grid = [];
  for (let col = 0; col < slotCols; col++) {
    grid[col] = [];
    for (let row = 0; row < slotRows; row++) {
      grid[col][row] = getRandomSymbol();
    }
  }
  return grid;
}

function animateSlotSpin(finalGrid, callback) {
  slotSpinning = true;
  const spins = [20, 30, 40]; // Each reel spins a different number of times for effect
  let currentSpins = [0, 0, 0];
  let currentGrid = getRandomGrid();

  function spinStep() {
    for (let col = 0; col < slotCols; col++) {
      if (currentSpins[col] < spins[col]) {
        for (let row = 0; row < slotRows; row++) {
          currentGrid[col][row] = getRandomSymbol();
        }
        currentSpins[col]++;
      } else {
        currentGrid[col] = finalGrid[col].slice();
      }
    }
    renderSlotReels(currentGrid);
    if (currentSpins.some((s, i) => s < spins[i])) {
      setTimeout(spinStep, 50);
    } else {
      slotSpinning = false;
      callback();
    }
  }
  spinStep();
}

function slotCheckWin(grid, bet) {
  // Only pay on middle line (row 1)
  const middleRow = [grid[0][1], grid[1][1], grid[2][1]];
  const allSame = middleRow.every(sym => sym === middleRow[0]);
  const resultEl = document.getElementById("slot-result");
  if (allSame) {
    const win = bet * 5;
    updateBalance(win);
    resultEl.textContent = `✨ Jackpot! You won ${win.toFixed(2)} ${useAmina ? "Amina" : "HC"}!`;
  } else {
    resultEl.textContent = `No win this time.`;
  }
}

document.getElementById("slot-spin").onclick = function () {
  if (slotSpinning) return;
  const bet = parseFloat(document.getElementById("slot-bet").value);
  if (bet > getBalance()) return alert("Not enough balance!");
  updateBalance(-bet);

  const finalGrid = getRandomGrid();
  document.getElementById("slot-result").textContent = "Spinning...";
  animateSlotSpin(finalGrid, () => slotCheckWin(finalGrid, bet));
};

// ======= PLINKO =======
const plinkoRows = 12, plinkoCols = 13; // 12 rows, 13 slots
const plinkoMultipliers = [0, 0.5, 1, 0.2, 2, 0.1, 5, 0.1, 2, 0.2, 1, 0.5, 0];
const plinkoBoardEl = document.getElementById("plinko-board");

function renderPlinkoBoard(ballPos = null, ballRow = null) {
  plinkoBoardEl.innerHTML = "";
  for (let row = 0; row < plinkoRows; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "plinko-row";
    for (let col = 0; col < plinkoCols; col++) {
      const cell = document.createElement("div");
      cell.className = "plinko-cell";
      if (row % 2 === 0 && col % 2 === 1) {
        cell.classList.add("plinko-pin");
        cell.textContent = "•";
      }
      if (ballPos !== null && ballRow === row && col === ballPos) {
        cell.classList.add("plinko-ball");
        cell.textContent = "⚪";
      }
      rowDiv.appendChild(cell);
    }
    plinkoBoardEl.appendChild(rowDiv);
  }
  // Draw slots at the bottom
  const slotRow = document.createElement("div");
  slotRow.className = "plinko-row";
  for (let col = 0; col < plinkoCols; col++) {
    const cell = document.createElement("div");
    cell.className = "plinko-cell plinko-slot";
    if (plinkoMultipliers[col]) {
      cell.textContent = plinkoMultipliers[col] + "x";
    }
    slotRow.appendChild(cell);
  }
  plinkoBoardEl.appendChild(slotRow);
}

function animatePlinkoDrop(finalCol, bet, callback) {
  let pos = 6; // Start in the center
  let row = 0;
  function step() {
    renderPlinkoBoard(pos, row);
    if (row < plinkoRows) {
      // Move left or right randomly, but not out of bounds
      if (Math.random() < 0.5) pos--;
      else pos++;
      if (pos < 0) pos = 0;
      if (pos > plinkoCols - 1) pos = plinkoCols - 1;
      row++;
      setTimeout(step, 90);
    } else {
      renderPlinkoBoard(pos, row);
      callback(pos, bet);
    }
  }
  step();
}

function plinkoCheckWin(col, bet) {
  const multiplier = plinkoMultipliers[col] || 0;
  const winnings = bet * multiplier;
  updateBalance(winnings);
  document.getElementById("plinko-result").textContent =
    `Landed in slot ${col} — Multiplier: ${multiplier}x — Won: ${winnings.toFixed(2)} ${useAmina ? "Amina" : "HC"}`;
}

document.getElementById("plinko-drop").onclick = function () {
  const bet = parseFloat(document.getElementById("plinko-bet").value);
  if (bet > getBalance()) return alert("Not enough balance!");
  updateBalance(-bet);
  document.getElementById("plinko-result").textContent = "Dropping...";
  animatePlinkoDrop(6, bet, plinkoCheckWin);
};

renderSlotReels(getRandomGrid());
renderPlinkoBoard();
