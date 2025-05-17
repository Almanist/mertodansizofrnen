document.addEventListener('DOMContentLoaded', async function() {
    // Admin şifresi
    const ADMIN_PASSWORD = "sizofren123sifre";
    
    // Veritabanı bağlantısı
    let db;
    const DB_NAME = "SizofrenlendinDB";
    const DB_VERSION = 1;
    const STORE_NAME = "media";
    
    // IndexedDB başlatma
    const initDB = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error("Veritabanı hatası:", event.target.error);
            reject("Veritabanı hatası");
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });

    // DOM elementleri
    const adminBtn = document.getElementById('admin-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminError = document.getElementById('admin-error');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    
    const mediaModal = document.getElementById('media-modal');
    const mediaUploadInput = document.getElementById('media-upload');
    const mediaPreview = document.getElementById('media-preview');
    const mediaPreviewContainer = document.querySelector('.media-preview');
    const removeMediaBtn = document.getElementById('remove-media');
    const publishBtn = document.getElementById('publish-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    
    const mediaContainer = document.getElementById('media-container');
    
    // Veritabanı bağlantısını bekle
    try {
        await initDB;
        loadMedia();
    } catch (error) {
        showError("Veritabanı bağlantı hatası. Sayfayı yenileyin.");
    }

    // Medyaları yükle
    async function loadMedia() {
        mediaContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
        
        try {
            const mediaItems = await getAllMedia();
            
            if (mediaItems.length === 0) {
                mediaContainer.innerHTML = `
                    <div class="media-empty">
                        <i class="fas fa-images"></i>
                        <h3>Henüz medya paylaşılmadı</h3>
                        <p>Admin girişi yaparak ilk medyayı paylaşabilirsiniz</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            mediaItems.sort((a, b) => b.timestamp - a.timestamp).forEach(item => {
                const date = new Date(item.timestamp);
                const timeString = date.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const dateString = date.toLocaleDateString('tr-TR');
                
                html += `
                    <div class="media-item">
                        <div class="media-thumbnail">
                            ${item.type === 'video' ? 
                                `<video src="${item.data}" controls></video>` : 
                                `<img src="${item.data}" alt="${item.title}">`
                            }
                        </div>
                        <div class="media-info">
                            <h3 class="media-title">${item.title}</h3>
                            <p class="media-desc">${item.description || 'Açıklama yok'}</p>
                            <div class="media-footer">
                                <span>${dateString} ${timeString}</span>
                                <span class="admin-badge">ADMIN</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            mediaContainer.innerHTML = html;
        } catch (error) {
            showError("Medyalar yüklenirken hata oluştu");
            console.error(error);
        }
    }
    
    // Tüm medyaları getir
    function getAllMedia() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Yeni medya ekle
    function addMedia(media) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(media);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Hata göster
    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> ${message}
        `;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
    }

    // Admin butonuna tıklama
    adminBtn.addEventListener('click', function() {
        adminModal.classList.remove('hidden');
        adminPasswordInput.focus();
    });
    
    // Admin giriş butonu
    adminLoginBtn.addEventListener('click', function() {
        const password = adminPasswordInput.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            adminModal.classList.add('hidden');
            mediaModal.classList.remove('hidden');
            adminPasswordInput.value = '';
            adminError.classList.add('hidden');
        } else {
            adminError.classList.remove('hidden');
        }
    });
    
    // Medya yükleme
    mediaUploadInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
            
            if (validTypes.includes(file.type)) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    mediaPreview.src = e.target.result;
                    mediaPreviewContainer.classList.remove('hidden');
                    
                    if (file.type.includes('video')) {
                        mediaPreview.controls = true;
                    } else {
                        mediaPreview.controls = false;
                    }
                }
                
                reader.readAsDataURL(file);
            } else {
                alert('Sadece JPG, PNG, GIF resimleri ve MP4 videoları yükleyebilirsiniz!');
                this.value = '';
            }
        }
    });
    
    // Medya kaldırma
    removeMediaBtn.addEventListener('click', function() {
        mediaPreviewContainer.classList.add('hidden');
        mediaUploadInput.value = '';
    });
    
    // Medya paylaşma
    publishBtn.addEventListener('click', async function() {
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
        
        try {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const mediaData = {
                    title: title,
                    description: description,
                    data: e.target.result,
                    type: file.type.includes('video') ? 'video' : 'image',
                    timestamp: Date.now()
                };
                
                await addMedia(mediaData);
                mediaModal.classList.add('hidden');
                resetForm();
                loadMedia();
                
                // LocalStorage'e de kaydet (basit senkronizasyon için)
                localStorage.setItem('lastMediaUpdate', Date.now().toString());
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showError("Medya paylaşılırken hata oluştu");
            console.error(error);
        }
    });
    
    // Yenile butonu
    refreshBtn.addEventListener('click', loadMedia);
    
    // Diğer cihazlardan güncellemeleri kontrol et
    window.addEventListener('storage', (event) => {
        if (event.key === 'lastMediaUpdate') {
            loadMedia();
        }
    });
    
    // Formu sıfırlama
    function resetForm() {
        document.getElementById('media-title').value = '';
        document.getElementById('media-desc').value = '';
        mediaUploadInput.value = '';
        mediaPreviewContainer.classList.add('hidden');
    }
    
    // Modal dışına tıklayarak kapatma
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
                
                if (modal === adminModal) {
                    adminPasswordInput.value = '';
                    adminError.classList.add('hidden');
                } else if (modal === mediaModal) {
                    resetForm();
                }
            }
        });
    });
    
    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            adminModal.classList.add('hidden');
            mediaModal.classList.add('hidden');
            adminPasswordInput.value = '';
            adminError.classList.add('hidden');
            resetForm();
        }
    });
});
