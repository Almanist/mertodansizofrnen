document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5000/api'; // Sunucu URL'si
    
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
    
    // Admin şifresi
    const ADMIN_PASSWORD = "sizofren123sifre";
    
    // Medyaları yükle
    async function loadMedia() {
        mediaContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</div>';
        
        try {
            const response = await fetch(`${API_URL}/media`);
            if (!response.ok) throw new Error('Yükleme başarısız');
            
            const mediaItems = await response.json();
            
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
            mediaItems.forEach(item => {
                const date = new Date(item.createdAt);
                const timeString = date.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const dateString = date.toLocaleDateString('tr-TR');
                
                const isVideo = item.mimetype.includes('video');
                const mediaUrl = `${API_URL}/uploads/${item.filename}`;
                
                html += `
                    <div class="media-item">
                        <div class="media-thumbnail">
                            ${isVideo ? 
                                `<video src="${mediaUrl}" controls></video>` : 
                                `<img src="${mediaUrl}" alt="${item.title}">`
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
    
    // Medya yükle
    async function uploadMedia(title, description, file) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('media', file);
        
        try {
            const response = await fetch(`${API_URL}/media`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Yükleme başarısız');
            
            return await response.json();
        } catch (error) {
            throw error;
        }
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
            publishBtn.disabled = true;
            publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
            
            await uploadMedia(title, description, file);
            
            mediaModal.classList.add('hidden');
            resetForm();
            loadMedia();
        } catch (error) {
            showError("Medya paylaşılırken hata oluştu");
            console.error(error);
        } finally {
            publishBtn.disabled = false;
            publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Paylaş';
        }
    });
    
    // Yenile butonu
    refreshBtn.addEventListener('click', loadMedia);
    
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
    
    // Sayfa yüklendiğinde medyaları getir
    loadMedia();
});
