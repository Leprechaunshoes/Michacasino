// COSMIC CASINO SCRIPT

// ==== UTILS ====
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let houseCoins = 1000;
const hcBalance = document.getElementById("hc-balance");
const updateBalance = () => hcBalance.innerText = houseCoins.toFixed(2);
updateBalance();

// ==== SLOT MACHINE ====
const slotSymbols = ['🌌','🌠','🪐','💫','🌙','⭐'];
const slotReels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
    document.getElementById("reel4"),
    document.getElementById("reel5")
];

document.getElementById("spin-btn").addEventListener("click", () => {
    const bet = parseFloat(document.getElementById("bet-amount").value);
    if (houseCoins < bet) return alert("Insufficient balance");
    houseCoins -= bet;

    const result = [];
    slotReels.forEach((reel, i) => {
        reel.innerText = '';
        const symbol = slotSymbols[getRandomInt(0, slotSymbols.length - 1)];
        result.push(symbol);
        reel.innerText = symbol;
    });

    if (result.every(s => s === result[0])) {
        const win = bet * 5;
        alert("JACKPOT! + " + win.toFixed(2));
        houseCoins += win;
    } else {
        alert("No win this time!");
    }

    updateBalance();
});

// ==== BLACKJACK ====
const deck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let playerHand = [], dealerHand = [], playerSum = 0, dealerSum = 0;

function getCardValue(val) {
    if (['J','Q','K'].includes(val)) return 10;
    if (val === 'A') return 11;
    return parseInt(val);
}

function drawCard() {
    const val = values[getRandomInt(0, 12)];
    const suit = suits[getRandomInt(0, 3)];
    return { text: val + suit, value: getCardValue(val) };
}

function renderHand(hand, container) {
    container.innerHTML = '';
    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = "card";
        div.innerText = card.text;
        container.appendChild(div);
    });
}

function calculateSum(hand) {
    let sum = 0, aces = 0;
    hand.forEach(card => {
        sum += card.value;
        if (card.text.startsWith('A')) aces++;
    });
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

function resetBlackjack() {
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard()];
    renderHand(playerHand, document.getElementById("player-cards"));
    renderHand(dealerHand, document.getElementById("dealer-cards"));
    playerSum = calculateSum(playerHand);
    dealerSum = calculateSum(dealerHand);
}

document.getElementById("hit-btn").addEventListener("click", () => {
    playerHand.push(drawCard());
    renderHand(playerHand, document.getElementById("player-cards"));
    playerSum = calculateSum(playerHand);
    if (playerSum > 21) {
        alert("Bust! Dealer wins.");
    }
});

document.getElementById("stand-btn").addEventListener("click", () => {
    while (dealerSum < 17) {
        dealerHand.push(drawCard());
        dealerSum = calculateSum(dealerHand);
    }
    renderHand(dealerHand, document.getElementById("dealer-cards"));
    if (dealerSum > 21 || playerSum > dealerSum) {
        alert("You win!");
        houseCoins += 5;
    } else if (dealerSum === playerSum) {
        alert("Push!");
    } else {
        alert("Dealer wins.");
        houseCoins -= 5;
    }
    updateBalance();
});

document.getElementById("deal-btn").addEventListener("click", () => {
    resetBlackjack();
});

// ==== PLINKO ====
const plinkoContainer = document.getElementById("plinko-container");
const plinkoButton = document.getElementById("drop-ball");

function createPlinkoBoard() {
    plinkoContainer.innerHTML = '';
    for (let r = 0; r < 12; r++) {
        const row = document.createElement("div");
        row.className = "plinko-row";
        for (let c = 0; c <= r; c++) {
            const peg = document.createElement("div");
            peg.className = "plinko-peg";
            row.appendChild(peg);
        }
        plinkoContainer.appendChild(row);
    }
    const multipliers = [0.5, 1, 2, 5, 10, 2, 1, 0.5];
    const payoutRow = document.createElement("div");
    payoutRow.className = "plinko-multipliers";
    multipliers.forEach(m => {
        const mult = document.createElement("div");
        mult.className = "multiplier";
        mult.innerText = `${m}x`;
        payoutRow.appendChild(mult);
    });
    plinkoContainer.appendChild(payoutRow);
}
createPlinkoBoard();

plinkoButton.addEventListener("click", () => {
    const bet = parseFloat(document.getElementById("plinko-bet").value);
    if (houseCoins < bet) return alert("Not enough HC!");
    houseCoins -= bet;

    let position = 4;
    for (let i = 0; i < 12; i++) {
        const move = Math.random() < 0.5 ? -1 : 1;
        position += move;
        position = Math.max(0, Math.min(7, position));
    }

    const multipliers = [0.5, 1, 2, 5, 10, 2, 1, 0.5];
    const payout = bet * multipliers[position];
    alert(`Plinko landed in slot ${position + 1}. You won ${payout.toFixed(2)} HC!`);
    houseCoins += payout;
    updateBalance();
});
