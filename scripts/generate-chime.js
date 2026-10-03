const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 3.5;
const totalSamples = Math.floor(sampleRate * durationSeconds);
const numChannels = 1;
const bytesPerSample = 2; // 16-bit PCM

const buffer = Buffer.alloc(44 + totalSamples * bytesPerSample);

// 1. RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + totalSamples * bytesPerSample, 4);
buffer.write('WAVE', 8);

// 2. fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
buffer.writeUInt16LE(numChannels, 22); // num channels
buffer.writeUInt32LE(sampleRate, 24); // sample rate
buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
buffer.writeUInt16LE(bytesPerSample * 8, 34); // bits per sample

// 3. data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(totalSamples * bytesPerSample, 40);

// Chime bursts at 0s, 0.8s, 1.6s
const strikes = [
  { start: 0.0, freqs: [880, 1760, 2640], weights: [0.6, 0.25, 0.15], decay: 0.65 },
  { start: 0.8, freqs: [1046.5, 2093, 3139], weights: [0.6, 0.25, 0.15], decay: 0.65 },
  { start: 1.6, freqs: [1318.5, 2637, 3955], weights: [0.65, 0.25, 0.1], decay: 1.4 },
];

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  let sampleValue = 0;

  for (const strike of strikes) {
    if (t >= strike.start) {
      const dt = t - strike.start;
      const env = Math.exp(-dt / strike.decay);
      if (env > 0.0001) {
        let strikeVal = 0;
        for (let j = 0; j < strike.freqs.length; j++) {
          strikeVal += strike.weights[j] * Math.sin(2 * Math.PI * strike.freqs[j] * dt);
        }
        sampleValue += strikeVal * env;
      }
    }
  }

  // Clip and convert to 16-bit integer
  const clamped = Math.max(-1, Math.min(1, sampleValue * 0.95));
  const intVal = Math.floor(clamped * 32767);
  buffer.writeInt16LE(intVal, 44 + i * 2);
}

const outDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'order-alert.wav');
fs.writeFileSync(outPath, buffer);
console.log('Generated clear alert chime at:', outPath, 'Bytes:', buffer.length);
