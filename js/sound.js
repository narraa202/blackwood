// Procedural ambience with WebAudio: rain loop, thunder, small UI cues.
// The AudioContext is created lazily on the first toggle (a user gesture).

const KEY = 'blackwood.sound';
let ctx = null;
let master = null;
let rain = null;
let on = false;

try { on = localStorage.getItem(KEY) === '1'; } catch (_) { on = false; }

function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  return true;
}

function startRain() {
  if (rain || !ensure()) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(3);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1400;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.value = 0.07;
  src.connect(filter).connect(gain).connect(master);
  src.start();
  rain = { src, gain };
}

function stopRain() {
  if (!rain) return;
  rain.src.stop();
  rain = null;
}

export const isSoundOn = () => on;

export function toggleSound() {
  on = !on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) { /* ignore */ }
  if (on) {
    if (ensure()) {
      ctx.resume();
      startRain();
    }
  } else {
    stopRain();
  }
  return on;
}

// Call once from any user gesture so a saved "on" setting starts playing.
export function resumeSound() {
  if (on && ensure()) {
    ctx.resume();
    startRain();
  }
}

export function playThunder() {
  if (!on || !ensure()) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(3);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.exponentialRampToValueAtTime(80, t + 2.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
  src.stop(t + 3);
}

function tone(freq, start, dur, type = 'sine', vol = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function playFound() {
  if (!on || !ensure()) return;
  const t = ctx.currentTime;
  tone(784, t, 0.35);
  tone(1175, t + 0.09, 0.5);
}

export function playWrong() {
  if (!on || !ensure()) return;
  tone(140, ctx.currentTime, 0.3, 'triangle', 0.2);
}
