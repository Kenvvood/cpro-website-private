// 压缩 5 张产品图到 240x240 (4x for retina 60x60 box, 适配 2K 屏幕)
// 原图 1200x1200 = 300-800KB, 压缩后应该 30-60KB
const fs = require('fs');
const path = require('path');

async function main() {
  const sharp = require('sharp');
  const dir = 'G:\\CodeBase\\cpro-website\\public\\products';
  const files = fs.readdirSync(dir).filter(f => f.startsWith('gold-') && f.endsWith('.png'));
  for (const f of files) {
    const input = path.join(dir, f);
    const out = path.join(dir, f.replace('.png', '.jpg'));
    await sharp(input).resize(240, 240).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    fs.unlinkSync(input);
    const stat = fs.statSync(out);
    console.log(`compressed ${f} -> ${path.basename(out)}: ${(stat.size / 1024).toFixed(1)}KB`);
  }
}

main().catch(console.error);
