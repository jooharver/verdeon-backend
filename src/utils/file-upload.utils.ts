import { extname } from 'path';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  
  // Generate nama unik: timestamp + angka acak + ekstensi asli
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
    
  // Format: [timestamp]-[random]-[nama-asli].[ext]
  // Nama asli dibersihkan dari spasi agar aman di URL
  const cleanName = name.replace(/\s+/g, '-').toLowerCase();
  
  callback(null, `${Date.now()}-${randomName}-${cleanName}${fileExtName}`);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/)) {
    return callback(new Error('Only image and document files are allowed!'), false);
  }
  callback(null, true);
};