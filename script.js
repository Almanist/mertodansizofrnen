// Gizli admin şifresi (kod içinde görünür ama kullanıcıya gösterilmez)
const ADMIN_PASSWORD = "sizofren123sifre";

// DOM elementleri
const adminModal = document.getElementById('admin-modal');
const uploadModal = document.getElementById('upload-modal');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBtn = document.getElementById('admin-login');
const adminError = document.getElementById('admin-error');
const mediaUploadInput = document.getElementById('media-upload');
const mediaPreview = document.getElementById('media-preview');
const previewContainer = document.querySelector('.preview-container');
const removeMediaBtn = document.getElementById('remove-media');
const publishBtn = document.getElementById('publish-btn');
const mediaGallery = document.getElementById('media-gallery');

// Gizli admin girişi için tuş kombinasyonu
let keySequence = [];
const SECRET_KEY_COMBO = ['s', 'i', 'z', 'o', 'f', 'r', 'e', 'n'];

document.addEventListener('keydown', (e) => {
    // Sadece küçük harfleri kontrol et
    const key = e.key.toLowerCase();
    
    // Gizli tuş kombinasyonunu kontrol et
    keySequence.push(key);
    if (keySequence.length > SECRET_KEY_COMBO.length) {
        keySequence.shift();
    }
    
    if (keySequence.join('') === SECRET_KEY_COMBO.join('')) {
        adminModal.classList.remove('hidden');
        adminPasswordInput.focus();
        keySequence = []; // Sıfırla
    }
});

// Admin giriş butonu
adminLoginBtn.addEventListener('click', () => {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        adminModal.classList.add('hidden');
        uploadModal.classList.remove('hidden');
        adminPasswordInput.value = '';
        adminError.classList.add('hidden');
    } else {
        adminError.classList.remove('hidden');
    }
});

// Medya yükleme
mediaUploadInput.addEventListener('change', () => {
    const file = mediaUploadInput.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (validTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaPreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Sadece JPG, PNG, GIF resimleri ve MP4 videoları yükleyebilirsiniz!');
            mediaUploadInput.value = '';
        }
    }
});

// Medya kaldırma
removeMediaBtn.addEventListener('click', () => {
    mediaPreview.src = '#';
    previewContainer.classList.add('hidden');
    mediaUploadInput.value = '';
});

// Medya yayınlama
publishBtn.addEventListener('click', () => {
    const title = document.getElementById('media-title').value.trim();
    const description = document.getElementById('media-desc').value.trim();
    const file = mediaUploadInput.files[0];
    
    if (!title) {
        alert('Lütfen bir başlık girin!');
        return;
    }
    
    if (!file) {
        alert('Lütfen bir medya dosyası seçin!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const isVideo = file.type.includes('video');
        const now = new Date();
        const timeString = now.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.innerHTML = `
            <div class="media-thumbnail">
                ${isVideo ? 
                    `<video src="${e.target.result}" controls></video>` : 
                    `<img src="${e.target.result}" alt="${title}">`
                }
            </div>
            <div class="media-info">
                <h3 class="media-title">${title}</h3>
                <p class="media-desc">${description || 'Açıklama yok'}</p>
                <div class="media-footer">
                    <span>${timeString}</span>
                    <span class="admin-badge">ADMIN</span>
                </div>
            </div>
        `;
        
        mediaGallery.prepend(mediaItem);
        uploadModal.classList.add('hidden');
        resetForm();
    };
    reader.readAsDataURL(file);
});

// Formu sıfırlama
function resetForm() {
    document.getElementById('media-title').value = '';
    document.getElementById('media-desc').value = '';
    mediaUploadInput.value = '';
    previewContainer.classList.add('hidden');
}

// Modal dışına tıklayarak kapatma
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            resetForm();
            adminPasswordInput.value = '';
            adminError.classList.add('hidden');
        }
    });
});

// ESC tuşu ile modal kapatma
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        adminModal.classList.add('hidden');
        uploadModal.classList.add('hidden');
        resetForm();
        adminPasswordInput.value = '';
        adminError.classList.add('hidden');
    }
});