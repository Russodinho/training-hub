const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const root = __dirname;
(async () => {
  const files = fs.readdirSync(path.join(root, 'boards')).filter(x => x.endsWith('.svg'));
  const thumbs = [];
  for (const [i, file] of files.entries()) {
    const input = path.join(root, 'boards', file);
    await sharp(input).png().toFile(input.replace('.svg', '.png'));
    thumbs.push({input: await sharp(input).resize({width:790,height:640,fit:'contain',background:'#1b252b'}).png().toBuffer(), left:(i%2)*790, top:Math.floor(i/2)*640});
  }
  await sharp({create:{width:1580,height:Math.ceil(files.length/2)*640,channels:3,background:'#1b252b'}}).composite(thumbs).png().toFile(path.join(root,'all-pages.png'));
  await sharp(path.join(root,'components.svg')).png().toFile(path.join(root,'components.png'));
  const metadata = await sharp(path.resolve(root,'../../public/training-hub-design/body-silhouette.png')).metadata();
  console.log(JSON.stringify({boards:files.length,hasAlpha:metadata.hasAlpha,width:metadata.width,height:metadata.height}));
})().catch(e => { console.error(e); process.exit(1); });
