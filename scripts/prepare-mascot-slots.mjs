import sharp from 'sharp';
import { resolve } from 'node:path';
const kit = process.argv[2];
if (!kit) throw new Error('Pass the extracted, supplied kit directory');
// Only resize/crop supplied kit pixels; transparent padding keeps swap dimensions stable.
await sharp(resolve(kit, 'cutouts/hexorx-head-surprised.webp'))
  .resize(1200, 1260, { fit: 'contain', kernel: 'nearest', position: 'bottom', background: '#00000000' })
  .webp({ lossless: true }).toFile('public/hexorx/hexorx-S08-404.webp');
await sharp(resolve(kit, 'cutouts/hexorx-full-front.webp'))
  .resize(760, 972, { fit: 'contain', kernel: 'nearest', position: 'bottom', background: '#00000000' })
  .webp({ lossless: true }).toFile('public/hexorx/hexorx-S09-og.webp');
