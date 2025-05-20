// --- Casino State ---
let balances = {
  amina: 10.0,
  house: 1000.0
};
let useAmina = true;

// --- Utility Functions ---
function getBalance() {
  return useAmina ? balances.amina : balances.house;
}
function setBalance(val) {
  if (useAmina) {
    balances.amina = val;
    document.getElementById('amina-balance').textContent = balances.amina.toFixed(2);
  } else {
    balances.house = val;
    document.getElementById('house-balance').textContent = balances.house.toFixed(1);
  }
}
function updateBalances() {
  document.getElementById('amina-balance').textContent = balances.amina.toFixed(2);
  document.getElementById('house-balance').textContent = balances.house.toFixed(1);
}
function getBet(id) {
  return parseFloat(document.getElementById(id).value);
}
function setBetDisplay(id, value) {
  document.getElementById(id + '-display').textContent = value;
}

// --- Currency Switcher ---
document.getElementById('toggle-currency').onclick = function() {
  useAmina = !useAmina;
  document.getElementById('currency-mode').textContent = "Current: " + (useAmina ? "Amina" : "House Coins");
  updateBalances();
};

// --- Bet Sliders Display ---
['bj', 'slot', 'plinko'].forEach(prefix => {
  let range = document.getElementById(`${prefix}-bet`);
  range.addEventListener('input', () => setBetDisplay(`${prefix}-bet`, range.value));
  setBetDisplay(`${prefix}-bet`, range.value);
});

// --- Blackjack ---
const suits = ['♠','♥','♦','♣'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function drawCard() {
  let suit = suits[Math.floor(Math.random()*4)];
  let rank = ranks[Math.floor(Math.random()*13)];
  return {suit, rank};
}
function handValue(hand) {
  let val = 0, aces = 0;
  hand.forEach(card => {
    if (card.rank === 'A') { val += 11; aces++; }
    else if (['K','Q','J'].includes(card.rank)) val += 10;
    else val += parseInt(card.rank);
  });
  while (val > 21 && aces > 0) { val -= 10; aces--; }
  return val;
}
function renderHand(div, hand, hideFirst=false) {
  div.innerHTML = '';
  hand.forEach((card, i) => {
    let c = document.createElement('div');
    c.className = 'card';
    c.textContent = (hideFirst && i === 0) ? '🂠' : card.rank + card.suit;
    div.appendChild(c);
  });
}

let bjPlayer = [], bjDealer = [], bjInProgress = false;

function resetBlackjack() {
  bjPlayer = [drawCard(), drawCard()];
  bjDealer = [drawCard(), drawCard()];
  renderHand(document.getElementById('player-hand'), bjPlayer);
  renderHand(document.getElementById('dealer-hand'), bjDealer, true);
  document.getElementById('bj-result').textContent = '';
  document.getElementById('bj-hit').disabled = false;
  document.getElementById('bj-stand').disabled = false;
  bjInProgress = true;
}

document.getElementById('bj-deal').onclick = function() {
  let bet = getBet('bj-bet');
  if (bet > getBalance()) {
    document.getElementById('bj-result').textContent = "Not enough balance!";
    return;
  }
  setBalance(getBalance() - bet);
  resetBlackjack();
};

document.getElementById('bj-hit').onclick = function() {
  bjPlayer.push(drawCard());
  renderHand(document.getElementById('player-hand'), bjPlayer);
  if (handValue(bjPlayer) > 21) {
    endBlackjack("Bust! You lose.");
  }
};

document.getElementById('bj-stand').onclick = function() {
  // Dealer's turn
  while (handValue(bjDealer) < 17) bjDealer.push(drawCard());
  renderHand(document.getElementById('dealer-hand'), bjDealer);
  let playerVal = handValue(bjPlayer), dealerVal = handValue(bjDealer);
  if (dealerVal > 21 || playerVal > dealerVal) {
    endBlackjack("You win!", true);
  } else if (playerVal === dealerVal) {
    endBlackjack("Push (tie).", null, true);
  } else {
    endBlackjack("Dealer wins.");
  }
};

function endBlackjack(msg, win=false, push=false) {
  document.getElementById('bj-hit').disabled = true;
  document.getElementById('bj-stand').disabled = true;
  document.getElementById('bj-result').textContent = msg;
  let bet = getBet('bj-bet');
  if (win) setBalance(getBalance() + bet * 2);
  if (push) setBalance(getBalance() + bet);
  updateBalances();
  bjInProgress = false;
}

// --- Slot Machine ---
const slotSymbols = ['🍒','🍋','🔔','💎','7️⃣','🍀'];
function spinReel() {
  return slotSymbols[Math.floor(Math.random()*slotSymbols.length)];
}
function renderSlot(reels) {
  for (let i=0; i<3; ++i) {
    let reelDiv = document.getElementById(`slot-reel-${i}`);
    reelDiv.innerHTML = '';
    let sym = reels[i];
    let div = document.createElement('div');
    div.className = 'slot-symbol';
    div.textContent = sym;
    reelDiv.appendChild(div);
  }
}

document.getElementById('slot-spin').onclick = function() {
  let bet = getBet('slot-bet');
  if (bet > getBalance()) {
    document.getElementById('slot-result').textContent = "Not enough balance!";
    return;
  }
  setBalance(getBalance() - bet);
  // Simple animation
  let spins = 12, reels = [0,0,0];
  let anim = setInterval(() => {
    reels = [spinReel(), spinReel(), spinReel()];
    renderSlot(reels);
    spins--;
    if (spins === 0) {
      clearInterval(anim);
      let win = 0;
      // Win if all three match
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        win = bet * 8;
        document.getElementById('slot-result').textContent = `JACKPOT! You win ${win.toFixed(2)}!`;
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        win = bet * 2;
        document.getElementById('slot-result').textContent = `Nice! You win ${win.toFixed(2)}!`;
      } else {
        document.getElementById('slot-result').textContent = "No win. Try again!";
      }
      setBalance(getBalance() + win);
      updateBalances();
    }
  }, 80);
};

// --- Plinko ---
const plinkoRows = 7;
function buildPlinkoBoard(ballCol=-1, ballRow=-1, slots=[], ballInSlot=-1) {
  const board = document.getElementById('plinko-board');
  board.innerHTML = '';
  // Pins
  for (let r=0; r<plinkoRows; ++r) {
    let row = document.createElement('div');
    row.className = 'plinko-row';
    for (let c=0; c<=r; ++c) {
      let cell = document.createElement('div');
      cell.className = 'plinko-cell plinko-pin';
      cell.textContent = '•';
      if (r === ballRow && c === ballCol) {
        cell.className += ' plinko-ball';
        cell.textContent = '⬤';
      }
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
  // Slots
  let slotRow = document.createElement('div');
  slotRow.className = 'plinko-row';
  for (let s=0; s<=plinkoRows; ++s) {
    let cell = document.createElement('div');
    cell.className = 'plinko-cell plinko-slot';
    cell.textContent = slots && slots[s] ? slots[s] : '';
    if (ballInSlot === s) {
      cell.className += ' plinko-ball';
      cell.textContent = '⬤';
    }
    slotRow.appendChild(cell);
  }
  board.appendChild(slotRow);
}
buildPlinkoBoard();

document.getElementById('plinko-drop').onclick = function() {
  let bet = getBet('plinko-bet');
  if (bet > getBalance()) {
    document.getElementById('plinko-result').textContent = "Not enough balance!";
    return;
  }
  setBalance(getBalance() - bet);
  let col = Math.floor(plinkoRows/2), row = 0;
  let path = [col];
  let animSteps = [];
  // Simulate path
  for (let r=0; r<plinkoRows; ++r) {
    let move = Math.random() < 0.5 ? 0 : 1;
    col = col + move;
    path.push(col);
    animSteps.push({row: r+1, col});
  }
  // Animate
  let i = 0;
  function anim() {
    if (i < animSteps.length) {
      buildPlinkoBoard(animSteps[i].col, animSteps[i].row);
      i++;
      setTimeout(anim, 120);
    } else {
      // Win logic
      let slot = path[path.length-1];
      let payout = [0,0.5,1,2,4,2,1,0.5][slot] || 0;
      let win = bet * payout;
      buildPlinkoBoard(-1, -1, null, slot);
      if (win > 0) {
        document.getElementById('plinko-result').textContent = `You win ${win.toFixed(2)}!`;
      } else {
        document.getElementById('plinko-result').textContent = "No win. Try again!";
      }
      setBalance(getBalance() + win);
      updateBalances();
    }
  }
  anim();
};

// --- Wallet Connect Placeholder ---
document.getElementById('connect-wallet').onclick = function() {
  alert("Wallet connect is not implemented in this demo.");
};

// --- Init ---
updateBalances();
