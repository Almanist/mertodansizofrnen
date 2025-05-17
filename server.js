require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sizofrenlendin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Medya modeli
const Media = mongoose.model('Media', {
  title: String,
  description: String,
  filename: String,
  mimetype: String,
  size: Number,
  createdAt: { type: Date, default: Date.now }
});

// Dosya yükleme ayarları
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Endpoint'leri
app.post('/api/media', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const { title, description } = req.body;
    
    const media = new Media({
      title,
      description,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    await media.save();
    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.get('/api/media', async (req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    res.json(mediaList);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.delete('/api/media/:id', async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Medya bulunamadı' });
    }
    
    // Dosyayı da sil
    fs.unlinkSync(path.join(__dirname, 'uploads', media.filename));
    res.json({ message: 'Medya silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
