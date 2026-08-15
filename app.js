const markers = { X: 'X', O: 'O', heart: '♥' };
const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const cells = [...document.querySelectorAll('.cell')];
const playerChoices = document.querySelector('#playerChoices');
const setupPanel = document.querySelector('#setupPanel');
const gamePanel = document.querySelector('#gamePanel');
const turnBanner = document.querySelector('#turnBanner');
const scoreBoard = document.querySelector('#scoreboard');
let playerCount = 2, selectedMarkers = ['X', 'O'], players = [], scores = [], board = [], currentPlayer = 0, gameOver = false;

function markerButton(marker, playerIndex) {
  const taken = selectedMarkers.includes(marker) && selectedMarkers[playerIndex] !== marker;
  const label = marker === 'heart' ? 'heart' : marker;
  return `<button class="marker-choice ${selectedMarkers[playerIndex] === marker ? 'selected' : ''} ${taken ? 'taken' : ''}" data-player="${playerIndex}" data-marker="${marker}" ${taken ? 'disabled title="Already chosen by another player"' : ''} aria-label="Player ${playerIndex + 1}: ${label}${taken ? ', already taken' : ''}">${markers[marker]}</button>`;
}
function renderSetup() {
  playerChoices.innerHTML = Array.from({ length: playerCount }, (_, i) => `<div class="player-card"><span class="player-label">Player ${i + 1}</span><div class="marker-list">${Object.keys(markers).map(m => markerButton(m, i)).join('')}</div></div>`).join('');
  document.querySelectorAll('.count-button').forEach(button => button.classList.toggle('selected', +button.dataset.count === playerCount));
}
function setupPlayers() { players = selectedMarkers.map((marker, index) => ({ marker, name: `Player ${index + 1}` })); scores = players.map(() => 0); startRound(); renderScoreboard(); }
function markerClass(marker) { return `marker-${marker}`; }
function renderScoreboard() { scoreBoard.innerHTML = players.map((player, i) => `<div class="score-row"><span class="score-symbol ${markerClass(player.marker)}">${markers[player.marker]}</span><span class="score-name">${player.name}</span><strong class="score-value">${scores[i]}</strong></div>`).join(''); }
function updateTurn(message) { if (message) { turnBanner.innerHTML = message; return; } const player = players[currentPlayer]; turnBanner.innerHTML = `<strong>${player.name}</strong><span class="turn-marker ${markerClass(player.marker)}">${markers[player.marker]}</span>your turn`; }
function startRound() { board = Array(9).fill(null); currentPlayer = 0; gameOver = false; cells.forEach(cell => { cell.textContent = ''; cell.className = 'cell'; cell.disabled = false; }); updateTurn(); }
function makeMove(index) {
  if (gameOver || board[index] !== null) return;
  board[index] = currentPlayer; const player = players[currentPlayer], cell = cells[index];
  cell.textContent = markers[player.marker]; cell.classList.add(markerClass(player.marker), 'played'); cell.disabled = true;
  const line = winningLines.find(([a,b,c]) => board[a] !== null && board[a] === board[b] && board[a] === board[c]);
  if (line) { gameOver = true; scores[currentPlayer]++; line.forEach(i => cells[i].classList.add('win')); cells.forEach(c => c.disabled = true); renderScoreboard(); updateTurn(`<strong>${player.name}</strong><span class="turn-marker ${markerClass(player.marker)}">${markers[player.marker]}</span>wins this round!`); return; }
  if (board.every(value => value !== null)) { gameOver = true; updateTurn('It’s a draw — try another round!'); return; }
  currentPlayer = (currentPlayer + 1) % players.length; updateTurn();
}

document.querySelectorAll('.count-button').forEach(button => button.addEventListener('click', () => { playerCount = +button.dataset.count; selectedMarkers = playerCount === 2 ? selectedMarkers.slice(0, 2) : [...selectedMarkers, 'heart'].filter((m, i, arr) => arr.indexOf(m) === i).slice(0, 3); while (selectedMarkers.length < playerCount) selectedMarkers.push(Object.keys(markers).find(m => !selectedMarkers.includes(m))); renderSetup(); }));
playerChoices.addEventListener('click', event => { const button = event.target.closest('.marker-choice'); if (!button || button.disabled) return; selectedMarkers[+button.dataset.player] = button.dataset.marker; renderSetup(); });
document.querySelector('#startGame').addEventListener('click', () => { setupPlayers(); setupPanel.classList.add('hidden'); gamePanel.classList.remove('hidden'); });
document.querySelector('#openSetup').addEventListener('click', () => { gamePanel.classList.add('hidden'); setupPanel.classList.remove('hidden'); });
document.querySelector('#restartMatch').addEventListener('click', () => { scores = players.map(() => 0); renderScoreboard(); startRound(); });
document.querySelector('#newRound').addEventListener('click', startRound);
cells.forEach((cell, index) => cell.addEventListener('click', () => makeMove(index)));
renderSetup();
