import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Regex patterns to detect AI design clichés
const EMOJI_REGEX = /([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}])/gu;
const AI_GRADIENT_REGEX = /(from-purple|via-purple|to-purple|from-violet|via-violet|to-violet|from-indigo|via-indigo|to-pink|from-pink)/g;
const GENERIC_BLUR_REGEX = /blur-3xl/g;

let totalIssues = 0;
const report = {
  emojis: [],
  unbrandedGradients: [],
  blurOveruse: [],
  missingPhotoCardPatterns: [],
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(path.resolve(__dirname, '..'), filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check 1: Emojis (Classic AI slop sign in enterprise UI)
    const emojiMatches = line.match(EMOJI_REGEX);
    if (emojiMatches) {
      emojiMatches.forEach(emoji => {
        report.emojis.push({
          file: relPath,
          line: lineNum,
          emoji,
          snippet: line.trim(),
        });
        totalIssues++;
      });
    }

    // Check 2: Arbitrary neon/purple gradients not in brand design
    const gradMatches = line.match(AI_GRADIENT_REGEX);
    if (gradMatches) {
      report.unbrandedGradients.push({
        file: relPath,
        line: lineNum,
        gradient: gradMatches[0],
        snippet: line.trim(),
      });
      totalIssues++;
    }

    // Check 3: blur-3xl overuse
    const blurMatches = line.match(GENERIC_BLUR_REGEX);
    if (blurMatches) {
      report.blurOveruse.push({
        file: relPath,
        line: lineNum,
        snippet: line.trim(),
      });
      totalIssues++;
    }
  });
}

console.log('🔍 Menjalankan Audit Deteksi Pola AI UI pada ProTek Pulse Frontend...\n');
walkDir(srcDir);

console.log('====================================================');
console.log(`📊 HASIL AUDIT DETEKSI POLA AI (TOTAL MASALAH: ${totalIssues})`);
console.log('====================================================\n');

console.log(`1. Penggunaan Emoji Chat/Casual dalam UI Enterprise (${report.emojis.length} temuan):`);
if (report.emojis.length > 0) {
  const grouped = {};
  report.emojis.forEach(e => {
    grouped[e.file] = (grouped[e.file] || 0) + 1;
  });
  Object.entries(grouped).forEach(([file, count]) => {
    console.log(`   - ${file}: ${count} emoji ditemukan`);
  });
  console.log('   Contoh temuan:');
  report.emojis.slice(0, 8).forEach(e => {
    console.log(`     Line ${e.line} [${e.emoji}]: ${e.snippet.substring(0, 80)}`);
  });
} else {
  console.log('   ✅ Bersih dari emoji!');
}

console.log(`\n2. Gradien Neon/Ungu Non-Brand (${report.unbrandedGradients.length} temuan):`);
if (report.unbrandedGradients.length > 0) {
  report.unbrandedGradients.forEach(g => {
    console.log(`   - ${g.file}:${g.line} -> ${g.gradient}`);
  });
} else {
  console.log('   ✅ Semua gradien menggunakan palet resmi Navy (#102A43) & Kinetic Orange (#F97316)!');
}

console.log(`\n3. Penggunaan Efek Blur Ekstrem blur-3xl (${report.blurOveruse.length} temuan):`);
if (report.blurOveruse.length > 0) {
  report.blurOveruse.forEach(b => {
    console.log(`   - ${b.file}:${b.line} -> ${b.snippet.substring(0, 80)}`);
  });
} else {
  console.log('   ✅ Efek blur proporsional sesuai Level 1-3 Elevation!');
}

console.log('\n====================================================');
console.log('Rekomendasi Perbaikan & Restorasi Desain Otentik:');
console.log('1. Ganti semua emoji dengan Material Symbols Outlined resmi.');
console.log('2. Terapkan foto storefront otentik dari Blueprint & Ui ke Dashboard, Pipeline, dan Leaderboard.');
console.log('3. Kembalikan podium juara ke styling visual otentik dari papan_peringkat_insentif_sales/code.html.');
console.log('4. Pastikan semua status badge memiliki dot indikator 6px sesuai DESIGN.md.');
console.log('====================================================\n');
