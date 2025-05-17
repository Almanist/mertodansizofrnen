document.addEventListener('DOMContentLoaded', function() {
    // Admin şifresi
    const ADMIN_PASSWORD = "sizofren123sifre";
    
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
    
    const mediaContainer = document.getElementById('media-container');
    
    // Admin butonuna tıklama
    adminBtn.addEventListener('click', function() {
        adminModal.classList.remove('hidden');
        adminPasswordInput.focus();
    });
    
    // Admin giriş butonu
    adminLoginBtn.addEventListener('click', function() {
        const password = adminPasswordInput.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            // Şifre doğru
            adminModal.classList.add('hidden');
            mediaModal.classList.remove('hidden');
            adminPasswordInput.value = '';
            adminError.classList.add('hidden');
        } else {
            // Şifre yanlış
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
                    
                    // Video ise controls ekle
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
    publishBtn.addEventListener('click', function() {
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
        reader.onload = function(e) {
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
            
            mediaContainer.prepend(mediaItem);
            mediaModal.classList.add('hidden');
            resetForm();
        };
        reader.readAsDataURL(file);
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
