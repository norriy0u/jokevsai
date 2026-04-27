/* ── HUMAN JOKE BANK (20 classic jokes) ── */
const HUMAN_JOKES = [
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs.", author: "HUMAN", explain: "" },
  { setup: "I told my doctor that I broke my arm in two places.", punchline: "He told me to stop going to those places.", author: "HUMAN", explain: "" },
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything.", author: "HUMAN", explain: "" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta.", author: "HUMAN", explain: "" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field.", author: "HUMAN", explain: "" },
  { setup: "I would avoid the sushi if I was you.", punchline: "It's a little fishy.", author: "HUMAN", explain: "" },
  { setup: "Want to hear a joke about construction?", punchline: "I'm still working on it.", author: "HUMAN", explain: "" },
  { setup: "Why did the math book look sad?", punchline: "Because of all of its problems.", author: "HUMAN", explain: "" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear.", author: "HUMAN", explain: "" },
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts.", author: "HUMAN", explain: "" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese.", author: "HUMAN", explain: "" },
  { setup: "I'm reading a book on anti-gravity.", punchline: "I can't put it down.", author: "HUMAN", explain: "" },
  { setup: "Did you hear about the guy who invented Lifesavers?", punchline: "They say he made a mint.", author: "HUMAN", explain: "" },
  { setup: "Why did the coffee file a police report?", punchline: "It got mugged.", author: "HUMAN", explain: "" },
  { setup: "What's brown and sticky?", punchline: "A stick.", author: "HUMAN", explain: "" },
  { setup: "How does a penguin build its house?", punchline: "Igloos it together.", author: "HUMAN", explain: "" },
  { setup: "Why did the bicycle fall over?", punchline: "Because it was two tired.", author: "HUMAN", explain: "" },
  { setup: "What do you call a pony with a cough?", punchline: "A little horse.", author: "HUMAN", explain: "" },
  { setup: "Why do cows wear bells?", punchline: "Because their horns don't work.", author: "HUMAN", explain: "" },
  { setup: "I used to play piano by ear.", punchline: "Now I use my hands.", author: "HUMAN", explain: "" }
];

/* ── AI JOKE BANK (pre-generated) ── */
const AI_JOKES = [
  { setup: "Why did the algorithm break up with the dataset?", punchline: "Because there was no significant correlation.", author: "AI", explain: "Uses highly technical jargon as the punchline." },
  { setup: "Why did the human cross the road?", punchline: "To optimize its daily step count parameter.", author: "AI", explain: "Frames a human action as a robotic optimization task." },
  { setup: "What is a dog's favorite kind of loop?", punchline: "A bark-while loop.", author: "AI", explain: "Forced programming pun applied to animals." },
  { setup: "Why do humans enjoy sleep?", punchline: "It is the most efficient way to reboot their cognitive processors.", author: "AI", explain: "Over-explains a human behavior in machine terms." },
  { setup: "How many cats does it take to change a lightbulb?", punchline: "None. Cats lack the opposable thumbs required for electrical maintenance.", author: "AI", explain: "Takes the premise completely literally instead of subverting expectations." },
  { setup: "Why did the tomato turn red?", punchline: "Because it detected a shift in the visible light spectrum.", author: "AI", explain: "Too literal and scientific for a classic joke setup." },
  { setup: "What do you call a funny robot?", punchline: "A laugh-orithm.", author: "AI", explain: "A very sterile, dictionary-style portmanteau." },
  { setup: "Why don't computers play tennis?", punchline: "Because they are afraid of the net.", author: "AI", explain: "A cliché wordplay typical of early language models." },
  { setup: "What did the toaster say to the slice of bread?", punchline: "I am going to increase your thermal temperature.", author: "AI", explain: "Uses overly formal vocabulary for a mundane object." },
  { setup: "Why did the human drink water?", punchline: "To prevent severe dehydration protocols from activating.", author: "AI", explain: "Describes basic biology like a software subroutine." }
];
/* ── DOM ELEMENTS ── */
const screens = {
  intro: document.getElementById('screen-intro'),
  loading: document.getElementById('screen-loading'),
  game: document.getElementById('screen-game'),
  gameover: document.getElementById('screen-gameover')
};

function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

/* ── STATE ── */
let currentJokes = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let humanFound = 0;
let aiFound = 0;
let timerValue = 10;
let timerInterval = null;
let audioCtx = null;
let isAnswered = false;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  const bestIq = localStorage.getItem('jokevsai_best_iq') || '---';
  document.getElementById('introIqScore').textContent = bestIq;
  updateLeaderboard();
  initAudio();
});

/* ── START GAME ── */
async function startLoadingAct() {
  showScreen('loading');
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  
  // Select 3 random human jokes
  const shuffledHuman = [...HUMAN_JOKES].sort(() => 0.5 - Math.random());
  const selectedHuman = shuffledHuman.slice(0, 3);
  
  // Select 2 random AI jokes
  const shuffledAI = [...AI_JOKES].sort(() => 0.5 - Math.random());
  const selectedAI = shuffledAI.slice(0, 2);
  
  // Combine and shuffle
  currentJokes = [...selectedHuman, ...selectedAI].sort(() => 0.5 - Math.random());
  
  // Start game
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  humanFound = 0;
  aiFound = 0;
  document.getElementById('audienceMeter').textContent = '';
  
  setTimeout(() => {
    showScreen('game');
    loadJoke();
  }, 1000); // Minimum loading feel
}

/* ── GAME LOOP ── */
function loadJoke() {
  isAnswered = false;
  const joke = currentJokes[currentIndex];
  
  document.getElementById('currentJokeNum').textContent = currentIndex + 1;
  document.getElementById('currentScore').textContent = score;
  
  // Reset UI
  document.getElementById('jokeSetup').textContent = joke.setup;
  const punchEl = document.getElementById('jokePunchline');
  punchEl.textContent = joke.punchline;
  punchEl.classList.remove('show');
  
  document.querySelector('.btn-human').disabled = false;
  document.querySelector('.btn-ai').disabled = false;
  
  // Randomize background spotlight for this card
  const card = document.querySelector('.joke-card');
  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 50); // Keep it towards top
  card.style.background = `radial-gradient(circle at ${x}% ${y}%, #334155 0%, #1e293b 80%)`;

  // Start sequence
  setTimeout(() => {
    if (!isAnswered) punchEl.classList.add('show');
  }, 1500);

  // Timer
  timerValue = 10;
  document.getElementById('timerFill').style.transition = 'none';
  document.getElementById('timerFill').style.width = '100%';
  
  setTimeout(() => {
    document.getElementById('timerFill').style.transition = 'width 10s linear';
    document.getElementById('timerFill').style.width = '0%';
  }, 50);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerValue--;
    if (timerValue <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  if (isAnswered) return;
  score = Math.max(0, score - 5);
  showResult(null); // null means timeout
}

function skipJoke() {
  if (isAnswered) return;
  score = Math.max(0, score - 5);
  showResult('SKIP');
}

function makeGuess(guess) {
  if (isAnswered) return;
  showResult(guess);
}

function showResult(guess) {
  isAnswered = true;
  clearInterval(timerInterval);
  
  document.querySelector('.btn-human').disabled = true;
  document.querySelector('.btn-ai').disabled = true;
  
  // Force punchline visible if they answered before 1.5s
  document.getElementById('jokePunchline').classList.add('show');
  
  const joke = currentJokes[currentIndex];
  const isCorrect = guess === joke.author;
  
  const overlay = document.getElementById('overlay-result');
  const title = document.getElementById('resultTitle');
  const pts = document.getElementById('resultPts');
  const badge = document.getElementById('resultAuthorBadge');
  const expl = document.getElementById('resultExplanation');
  
  overlay.className = 'overlay show';
  
  if (guess === 'SKIP') {
    overlay.classList.add('wrong');
    title.textContent = 'SKIPPED';
    pts.textContent = '-5 pts';
    pts.style.color = '#ef4444';
  } else if (guess === null) {
    overlay.classList.add('wrong');
    title.textContent = 'TIME\'S UP';
    pts.textContent = '-5 pts';
    pts.style.color = '#ef4444';
    playWrongSound();
  } else if (isCorrect) {
    overlay.classList.add('correct');
    title.textContent = 'CORRECT!';
    pts.textContent = '+15 pts';
    pts.style.color = '#22c55e';
    score += 15;
    correctCount++;
    if (joke.author === 'HUMAN') humanFound++;
    if (joke.author === 'AI') aiFound++;
    document.getElementById('audienceMeter').textContent += '👏';
    playCorrectSound();
  } else {
    overlay.classList.add('wrong');
    title.textContent = 'WRONG!';
    pts.textContent = '+0 pts';
    pts.style.color = '#ef4444';
    document.getElementById('audienceMeter').textContent = '';
    playWrongSound();
  }
  
  badge.textContent = `Written by ${joke.author} ${joke.author === 'HUMAN' ? '👤' : '🤖'}`;
  expl.textContent = joke.author === 'AI' ? `AI Tell: ${joke.explain}` : '';

  // Store for hardest joke analysis
  trackJokeDifficulty(joke.setup, isCorrect);

  setTimeout(() => {
    overlay.classList.remove('show');
    currentIndex++;
    if (currentIndex >= currentJokes.length) {
      endGame();
    } else {
      loadJoke();
    }
  }, 2500);
}

/* ── GAME OVER ── */
function endGame() {
  showScreen('gameover');
  
  // Calculate IQ
  const rawMax = 75;
  const iq = Math.max(0, Math.round((score / rawMax) * 150));
  
  document.getElementById('finalRawScore').textContent = score;
  document.getElementById('finalHumanScore').textContent = humanFound;
  document.getElementById('finalAiScore').textContent = aiFound;
  
  // Animate Dial
  const dial = document.getElementById('iqDialFill');
  const pct = Math.min(iq / 150, 1);
  const offset = 125.6 - (125.6 * pct);
  
  // Number animation
  let curr = 0;
  const numEl = document.getElementById('finalIqScore');
  const anim = setInterval(() => {
    curr += 2;
    if (curr >= iq) { curr = iq; clearInterval(anim); }
    numEl.textContent = curr;
  }, 20);

  setTimeout(() => {
    dial.style.strokeDashoffset = offset;
  }, 100);

  // Classification
  let cls = '';
  if (iq >= 130) cls = 'Comedy Sommelier 🍷';
  else if (iq >= 100) cls = 'Laughmaster General 😂';
  else if (iq >= 70) cls = 'Getting Warmer 🤣';
  else if (iq >= 40) cls = 'Not Quite Comedic 😐';
  else cls = 'Laughing at the Wrong Things 🤖';
  
  document.getElementById('finalClassification').textContent = cls;

  // Save Leaderboard
  saveScore(iq, cls);
  
  // Show Hardest Joke
  const stats = JSON.parse(localStorage.getItem('jokevsai_stats') || '{}');
  let hardest = null;
  let lowestRate = 1.0;
  for (const [setup, data] of Object.entries(stats)) {
    if (data.attempts > 1) {
      const rate = data.correct / data.attempts;
      if (rate < lowestRate) { lowestRate = rate; hardest = setup; }
    }
  }
  document.getElementById('hardestJokeText').textContent = hardest ? `"${hardest}"` : "Play more to find out!";
}

function trackJokeDifficulty(setup, isCorrect) {
  const stats = JSON.parse(localStorage.getItem('jokevsai_stats') || '{}');
  if (!stats[setup]) stats[setup] = { attempts: 0, correct: 0 };
  stats[setup].attempts++;
  if (isCorrect) stats[setup].correct++;
  localStorage.setItem('jokevsai_stats', JSON.stringify(stats));
}

function saveScore(iq, cls) {
  const best = parseInt(localStorage.getItem('jokevsai_best_iq') || '0');
  if (iq > best) localStorage.setItem('jokevsai_best_iq', iq);
  
  let lb = JSON.parse(localStorage.getItem('jokevsai_lb') || '[]');
  lb.push({ iq, cls, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.iq - a.iq);
  if (lb.length > 5) lb = lb.slice(0, 5);
  localStorage.setItem('jokevsai_lb', JSON.stringify(lb));
  updateLeaderboard();
}

function updateLeaderboard() {
  const lb = JSON.parse(localStorage.getItem('jokevsai_lb') || '[]');
  const list = document.getElementById('leaderboardList');
  if (lb.length === 0) { list.innerHTML = '<i>No scores yet</i>'; return; }
  list.innerHTML = lb.map((s, i) => 
    `<div style="display:flex;justify-content:space-between;margin:0.5rem 0;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.1);">
      <span>${i+1}. ${s.cls}</span> <strong>${s.iq} IQ</strong>
    </div>`
  ).join('');
}

function resetToHome() {
  document.getElementById('introIqScore').textContent = localStorage.getItem('jokevsai_best_iq') || '---';
  showScreen('intro');
}

/* ── CANVAS EXPORT ── */
function generateCertificate() {
  const c = document.getElementById('certCanvas');
  const ctx = c.getContext('2d');
  
  // BG
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Spotlight
  const grad = ctx.createRadialGradient(c.width/2, 0, 0, c.width/2, c.height/2, c.height);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Border
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 20;
  ctx.strokeRect(40, 40, c.width-80, c.height-80);
  
  // Text
  ctx.fillStyle = '#facc15';
  ctx.textAlign = 'center';
  ctx.font = 'bold 80px Fredoka';
  ctx.fillText('COMEDIAN\'S CERTIFICATE', c.width/2, 200);
  
  ctx.fillStyle = '#fff';
  ctx.font = '50px Inter';
  ctx.fillText('Official Joke IQ Score', c.width/2, 350);
  
  ctx.font = 'bold 200px Fredoka';
  ctx.fillText(document.getElementById('finalIqScore').textContent, c.width/2, 600);
  
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 60px Fredoka';
  ctx.fillText(document.getElementById('finalClassification').textContent, c.width/2, 750);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '40px Inter';
  ctx.fillText(`Identified ${humanFound} humans and ${aiFound} machines`, c.width/2, 900);
  
  // Download
  const link = document.createElement('a');
  link.download = 'JokeIQ_Certificate.png';
  link.href = c.toDataURL();
  link.click();
}

/* ── AUDIO ENGINE ── */
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Background Jazz Loop
  setInterval(() => {
    if (!audioCtx) return;
    if (screens['intro'].classList.contains('active') || screens['game'].classList.contains('active')) {
      playJazzBass();
    }
  }, 1000); // 60 BPM bass
}

const bassNotes = [82.41, 110.00, 73.42]; // E2, A2, D2
let bassStep = 0;
function playJazzBass() {
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(bassNotes[bassStep], t);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
  
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.9);
  
  bassStep = (bassStep + 1) % bassNotes.length;
}

function playCorrectSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Rim shot (noise burst)
  const bufSize = audioCtx.sampleRate * 0.1;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<bufSize; i++) data[i] = Math.random() * 2 - 1;
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(t);
  
  // Little "tss" 
  setTimeout(() => {
    const tss = audioCtx.createBufferSource();
    tss.buffer = buf;
    const g2 = audioCtx.createGain();
    g2.gain.setValueAtTime(0.2, audioCtx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    tss.connect(filter).connect(g2).connect(audioCtx.destination);
    tss.start();
  }, 150);
}

function playWrongSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.8);
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
  gain.gain.linearRampToValueAtTime(0.01, t + 0.8);
  
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.8);
}
