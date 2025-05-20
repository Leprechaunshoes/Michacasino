// === UTILS ===
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function glowEffect(element, color = '#ff33ff', duration = 800) {
  const originalShadow = element.style.boxShadow;
  element.style.boxShadow = `0 0 12px 6px ${color}`;
  setTimeout(() => element.style.boxShadow = originalShadow, duration);
}

// === SLOT MACHINE ===
const slotSymbols = ['🌟', '🌙', '💫', '✨', '🌌', '🪐', '🌠', '🔮'];
const slotRows = 3, slotCols = 5;
const slotReelsElem = document.getElementById('slot-reels');
const spinBtn = document.getElementById('spin-button');
const slotBetSlider = document.getElementById('slot-bet-slider');
const slotBetValue = document.getElementById('slot-bet-value');

let slotSpinning = false;

function createSlotGrid() {
  slotReelsElem.innerHTML = '';
  for (let i = 0; i < slotRows * slotCols; i++) {
    const cell = document.createElement('div');
    cell.className = 'reel-symbol';
    cell.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    slotReelsElem.appendChild(cell);
  }
}

function setSlotCell(i, symbol) {
  slotReelsElem.children[i].textContent = symbol;
}

function clearSlotHighlights() {
  Array.from(slotReelsElem.children).forEach(cell => {
    cell.style.backgroundColor = '';
    cell.style.boxShadow = '0 0 8px #cc00ff inset';
  });
}

function checkSlotWins(grid) {
  const wins = [];
  // Check horizontal rows for 3+ identical symbols in a row
  for (let r = 0; r < slotRows; r++) {
    let count = 1;
    for (let c = 1; c < slotCols; c++) {
      const idx = r * slotCols + c;
      const prevIdx = r * slotCols + c - 1;
      if (grid[idx] === grid[prevIdx]) {
        count++;
        if (count >= 3 && (c === slotCols - 1 || grid[idx] !== grid[idx + 1])) {
          let startC = c - count + 1;
          const indices = [];
          for (let i = startC; i <= c; i++) {
            indices.push(r * slotCols + i);
          }
          wins.push(indices);
        }
      } else {
        count = 1;
      }
    }
  }
  return wins;
}

async function spinSlot() {
  if (slotSpinning) return;
  slotSpinning = true;
  spinBtn.disabled = true;
  clearSlotHighlights();

  // Spin animation
  for (let cycle = 0; cycle < 15; cycle++) {
    for (let i = 0; i < slotRows * slotCols; i++) {
      setSlotCell(i, slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
    }
    await sleep(70);
  }

  // Final grid
  const finalGrid = [];
  for (let i = 0; i < slotRows * slotCols; i++) {
    finalGrid.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
  }
  finalGrid.forEach((sym, i) => setSlotCell(i, sym));

  // Check wins and highlight
  const wins = checkSlotWins(finalGrid);
  if (wins.length > 0) {
    wins.forEach(line => {
      line.forEach(idx => {
        const cell = slotReelsElem.children[idx];
        cell.style.backgroundColor = '#aa00ff';
        cell.style.boxShadow = '0 0 12px 6px #ff66ff';
      });
    });
    glowEffect(spinBtn, '#ff66ff', 1200);
    alert('Slot Machine: You WIN!');
  } else {
    alert('Slot Machine: No win, try again!');
  }

  spinBtn.disabled = false;
  slotSpinning = false;
}

// Update slot bet display
slotBetValue.textContent = slotBetSlider.value;
slotBetSlider.oninput = () => {
  slotBetValue.textContent = slotBetSlider.value;
};

spinBtn.addEventListener('click', spinSlot);
createSlotGrid();


// === BLACKJACK ===

const blackjack = {
  deck: [],
  playerHand: [],
  dealerHand: [],
  gameActive: false,
  playerStand: false,
  bet: 0,
};

const blackjackCardsElem = document.getElementById('blackjack-cards');
const blackjackStatusElem = document.getElementById('blackjack-status');
const blackjackHitBtn = document.getElementById('blackjack-hit');
const blackjackStandBtn = document.getElementById('blackjack-stand');
const blackjackBetSlider = document.getElementById('blackjack-bet-slider');
const blackjackBetValue = document.getElementById('blackjack-bet-value');

const suits = ['♠', '♥', '♦', '♣'];
const redSuits = new Set(['♥', '♦']);
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return Number(card.rank);
}

function handValue(hand) {
  let val = 0;
  let aces = 0;
  for (const card of hand) {
    val += cardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (val > 21 && aces > 0) {
    val -= 10;
    aces--;
  }
  return val;
}

function createCardElement(card) {
  const div = document.createElement('div');
  div.className = 'card';
  if (redSuits.has(card.suit)) div.classList.add('red');
  div.innerHTML = `<div class="top-left">${card.rank}${card.suit}</div><div class="bottom-right">${card.rank}${card.suit}</div>`;
  return div;
}

function renderHands() {
  blackjackCardsElem.innerHTML = '';

  // Player Hand
  const playerDiv = document.createElement('div');
  playerDiv.className = 'hand';
  const playerTitle = document.createElement('h3');
  playerTitle.textContent = `Player (${handValue(blackjack.playerHand)})`;
  playerDiv.appendChild(playerTitle);
  const playerCardsDiv = document.createElement('div');
  playerCardsDiv.className = 'cards';
  blackjack.playerHand.forEach(card => playerCardsDiv.appendChild(createCardElement(card)));
  playerDiv.appendChild(playerCardsDiv);
  blackjackCardsElem.appendChild(playerDiv);

  // Dealer Hand
  const dealerDiv = document.createElement('div');
  dealerDiv.className = 'hand';
  const dealerTitle = document.createElement('h3');
  let dealerVal = blackjack.playerStand ? handValue(blackjack.dealerHand) : '??';
  dealerTitle.textContent = `Dealer (${dealerVal})`;
  dealerDiv.appendChild(dealerTitle);
  const dealerCardsDiv = document.createElement('div');
  dealerCardsDiv.className = 'cards';

  blackjack.dealerHand.forEach((card, i) => {
    if (!blackjack.playerStand && i === 1) {
      const hiddenCard = document.createElement('div');
      hiddenCard.className = 'card hidden-card';
      dealerCardsDiv.appendChild(hiddenCard);
    } else {
      dealerCardsDiv.appendChild(createCardElement(card));
    }
  });

  dealerDiv.appendChild(dealerCardsDiv);
  blackjackCardsElem.appendChild(dealerDiv);
}

function startBlackjack() {
  blackjack.deck = createDeck();
  shuffleDeck(blackjack.deck);
  blackjack.playerHand = [blackjack.deck.pop(), blackjack.deck.pop()];
  blackjack.dealerHand = [blackjack.deck.pop(), blackjack.deck.pop()];
  blackjack.gameActive = true;
  blackjack.playerStand = false;
  blackjack.bet = parseFloat(blackjackBetSlider.value);
  blackjackStatusElem.textContent = 'Game started! Hit or Stand?';
  blackjackHitBtn.disabled = false;
  blackjackStandBtn.disabled = false;
  renderHands();
}

function checkBlackjackResult() {
  const playerVal = handValue(blackjack.playerHand);
  const dealerVal = handValue(blackjack.dealerHand);

  if (playerVal > 21) {
    blackjackStatusElem.textContent = 'Player busts! Dealer wins.';
    endBlackjack();
  } else if (dealerVal > 21) {
    blackjackStatusElem.textContent = 'Dealer busts! Player wins!';
    endBlackjack(true);
  } else if (blackjack.playerStand) {
    if (dealerVal >= 17) {
      if (playerVal > dealerVal) {
        blackjackStatusElem.textContent = 'Player wins!';
        endBlackjack(true);
      } else if (dealerVal > playerVal) {
        blackjackStatusElem.textContent = 'Dealer wins!';
        endBlackjack();
      } else {
        blackjackStatusElem.textContent = 'Push (tie).';
        endBlackjack(null);
      }
    } else {
      dealerTurn();
    }
  }
}

function dealerTurn() {
  // Dealer hits until 17+
  while (handValue(blackjack.dealerHand) < 17) {
    blackjack.dealerHand.push(blackjack.deck.pop());
  }
  renderHands();
  checkBlackjackResult();
}

function endBlackjack(playerWon = false) {
  blackjack.gameActive = false;
  blackjackHitBtn.disabled = true;
  blackjackStandBtn.disabled = true;
  if (playerWon === true) {
    alert('Blackjack: You WIN!');
  } else if (playerWon === false) {
    alert('Blackjack: You LOSE!');
  } else {
    alert('Blackjack: Push - it\'s a tie.');
  }
}

blackjackHitBtn.addEventListener('click', () => {
  if (!blackjack.gameActive) return;
  blackjack.playerHand.push(blackjack.deck.pop());
  renderHands();
  checkBlackjackResult();
});

blackjackStandBtn.addEventListener('click', () => {
  if (!blackjack.gameActive) return;
  blackjack.playerStand = true;
  renderHands();
  checkBlackjackResult();
});

blackjackBetValue.textContent = blackjackBetSlider.value;
blackjackBetSlider.oninput = () => {
  blackjackBetValue.textContent = blackjackBetSlider.value;
};

document.getElementById('blackjack-start').addEventListener('click', startBlackjack);


// === PLINKO ===
const plinkoRows = 12;
const plinkoBoardElem = document.getElementById('plinko-board');
const plinkoStartBtn = document.getElementById('plinko-start');
const plinkoBetSlider = document.getElementById('plinko-bet-slider');
const plinkoBetValue = document.getElementById('plinko-bet-value');
const plinkoResultElem = document.getElementById('plinko-result');

const plinkoMultipliers = [0, 0, 0.5, 1, 2, 3, 5, 3, 2, 1, 0.5, 0, 0];

// Ball and pegs will be generated dynamically

// Generate pegs & slots
function createPlinkoBoard() {
  plinkoBoardElem.innerHTML = '';
  for (let row = 0; row < plinkoRows; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'plinko-row';
    // offset every other row
    rowDiv.style.marginLeft = (row % 2) * 15 + 'px';

    const pegsCount = row + 1;
    for (let i = 0; i < pegsCount; i++) {
      const peg = document.createElement('div');
      peg.className = 'plinko-peg';
      rowDiv.appendChild(peg);
    }
    plinkoBoardElem.appendChild(rowDiv);
  }

  // Create slots row
  const slotsRow = document.createElement('div');
  slotsRow.className = 'plinko-row plinko-slots';

  for (let i = 0; i <= plinkoRows; i++) {
    const slot = document.createElement('div');
    slot.className = 'plinko-slot';
    slot.textContent = plinkoMultipliers[i] + 'x';
    slotsRow.appendChild(slot);
  }
  plinkoBoardElem.append
