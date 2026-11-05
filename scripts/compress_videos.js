const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, '..', 'public', 'videos');

for (let i = 1; i <= 7; i++) {
  const inFile = path.join(videoDir, `video_${i}.mp4`);
  const optFile = path.join(videoDir, `video_${i}_opt.mp4`);

  if (!fs.existsSync(inFile)) continue;

  console.log(`Processing video_${i}.mp4...`);
  const cmd = `"${ffmpeg}" -y -i "${inFile}" -t 6 -vf "scale=432:768:force_original_aspect_ratio=decrease,pad=432:768:(ow-iw)/2:(oh-ih)/2" -an -c:v libx264 -crf 27 -preset fast -movflags +faststart "${optFile}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
    const oldMb = (fs.statSync(inFile).size / (1024 * 1024)).toFixed(2);
    const newMb = (fs.statSync(optFile).size / (1024 * 1024)).toFixed(2);
    console.log(`video_${i}: ${oldMb} MB -> ${newMb} MB`);

    // Replace original with optimized
    fs.renameSync(optFile, inFile);
    console.log(`Replaced video_${i}.mp4 with lightweight optimized version!`);
  } catch (err) {
    console.error(`Error compressing video_${i}:`, err.message);
  }
}

console.log('All videos compressed successfully!');
