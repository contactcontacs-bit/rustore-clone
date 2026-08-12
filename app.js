document.addEventListener('DOMContentLoaded', () => {
    // Parse URL params or sessionStorage
    const appId = getParam('id');

    const appData = appsData[appId];

    if (!appData) {
        document.querySelector('.app-main').innerHTML = '<h2>Приложение не найдено.</h2><p><a href="index.html">Вернуться на главную</a></p>';
        return;
    }

    // Populate Data
    document.title = `${appData.title} — скачать в RuStore`;
    
    const bcCategory = document.getElementById('bc-category');
    if (bcCategory) {
        bcCategory.textContent = appData.category;
        bcCategory.href = "#";
        bcCategory.onclick = (e) => navToCategory(e, appData.category);
    }
    
    const bcTitle = document.getElementById('bc-title');
    if (bcTitle) bcTitle.textContent = appData.title;

    document.getElementById('app-icon').src = appData.icon;
    document.getElementById('app-icon').alt = appData.title;
    document.getElementById('app-title').textContent = appData.title;
    
    document.getElementById('app-rating').textContent = appData.rating;
    
    // Parse reviews count
    let revStr = appData.reviewsCount.toString();
    // Usually we want formatting like 1,104,423. If it's a small string like "1M", we just use it, 
    // but in previous versions we had numbers. Let's just use it and append "оценок".
    // Or randomly generate a large number if it's missing.
    let ratingSeed = appId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    let randomReviewsCount = Math.floor(100 + (ratingSeed * 47) % 5000000).toLocaleString('ru-RU');
    document.getElementById('app-reviews-count').textContent = `${randomReviewsCount} оценок`;

    // Generate Stars HTML
    const ratingFloat = parseFloat(appData.rating);
    let starsHtml = '';
    const starFull = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
    const starHalf = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L15 14.14L16.18 21.02L12 17.77V2Z"/></svg>'; // Simple half star representation
    const starEmpty = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
    
    for (let i = 1; i <= 5; i++) {
        if (ratingFloat >= i - 0.25) {
            starsHtml += starFull;
        } else if (ratingFloat >= i - 0.75) {
            starsHtml += starHalf;
        } else {
            starsHtml += starEmpty;
        }
    }
    document.getElementById('app-stars-container').innerHTML = starsHtml;

    // Pills
    document.getElementById('pill-downloads').textContent = `${appData.downloads} скачиваний`;
    document.getElementById('pill-size').textContent = `${appData.size || '34 МБ'}`;
    // Generate a deterministic random version
    const versionMajor = 1 + (ratingSeed % 18);
    const versionMinor = (ratingSeed * 3) % 10;
    const versionPatch = (ratingSeed * 7) % 20;
    document.getElementById('pill-version').textContent = `v${versionMajor}.${versionMinor}.${versionPatch}`;
    
    // Description
    document.getElementById('app-desc-text').textContent = appData.description;

    // Install button logic
    const installBtn = document.getElementById('install-btn');
    installBtn.addEventListener('click', () => {
        openBottomSheet(); return; // installBtn.textContent = 'Загрузка...';
        setTimeout(() => {
            installBtn.textContent = 'Открыть';
            installBtn.style.backgroundColor = '#E6EFFF';
            installBtn.style.color = 'var(--primary-color)';
        }, 1500);
    });

    // Seeded Random Generator for recommendations
    function seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Load static reviews from appData
    const reviews = appData.reviews || [];
    const totalReviewsCount = reviews.length;
    
    // Sort reviews (newest first, if date is available, but for now we just show them in order)
    const reviewsToShow = reviews.slice();

    const reviewsContainer = document.getElementById('reviews-container');
    const reviewsMoreBtn = document.getElementById('reviews-more-btn');
    
    if (reviewsMoreBtn) {
        document.getElementById('total-reviews-count').textContent = totalReviewsCount;
        
        // Hide button if there are exactly 3 reviews or less, as they are all visible
        if (totalReviewsCount <= 3) {
            reviewsMoreBtn.style.display = 'none';
        }
    }

    let generatedReviewsHtml = '';
    
    for (let i = 0; i < reviewsToShow.length; i++) {
        let rev = reviewsToShow[i];
        let starsHtml = '';
        for (let j = 1; j <= 5; j++) {
            if (j <= rev.rating) {
                starsHtml += starFull;
            } else {
                starsHtml += starEmpty;
            }
        }

        // Hide reviews beyond the first 3
        const displayStyle = i < 3 ? 'block' : 'none';
        const extraClass = i >= 3 ? 'hidden-review' : '';

        generatedReviewsHtml += `
            <div class="review-card ${extraClass}" style="display: ${displayStyle};">
                <div class="review-header">
                    <span class="review-name">${rev.author}</span>
                    <div class="stars-display" style="gap: 1px;">
                        ${starsHtml}
                    </div>
                </div>
                <div class="review-text">${rev.text}</div>
            </div>
        `;
    }
    reviewsContainer.innerHTML = generatedReviewsHtml;

    // Handle show more button click
    if (reviewsMoreBtn) {
        let isExpanded = false;
        reviewsMoreBtn.addEventListener('click', () => {
            const hiddenReviews = document.querySelectorAll('.hidden-review');
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                hiddenReviews.forEach(rev => {
                    rev.style.display = 'block';
                });
                reviewsMoreBtn.innerHTML = `Свернуть отзывы ▲`;
            } else {
                hiddenReviews.forEach(rev => {
                    rev.style.display = 'none';
                });
                reviewsMoreBtn.innerHTML = `Отзывы и оценки (<span id="total-reviews-count">${totalReviewsCount}</span>) ▼`;
            }
        });
    }

    // Leave review modal logic
    const leaveReviewBtn = document.getElementById('leave-review-submit-btn');
    const reviewModal = document.getElementById('review-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (leaveReviewBtn && reviewModal && modalCloseBtn) {
        leaveReviewBtn.addEventListener('click', () => {
            reviewModal.classList.add('active');
        });

        modalCloseBtn.addEventListener('click', () => {
            reviewModal.classList.remove('active');
        });

        // Close when clicking outside content
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.classList.remove('active');
            }
        });
    }

    // Star rating interactivity
    const interactiveStars = document.querySelectorAll('.leave-review-stars svg');
    interactiveStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            interactiveStars.forEach((s, i) => {
                if (i <= index) {
                    s.querySelector('path').setAttribute('fill', '#F6A820');
                } else {
                    s.querySelector('path').setAttribute('fill', 'none');
                }
            });
        });
    });

    // Recommendations Generator
    const recContainer = document.getElementById('recommendations-container');
    const allAppKeys = Object.keys(appsData);
    let recKeys = [];
    
    // Deterministically pick 6 apps
    for (let i = 0; i < 15; i++) {
        let pickIndex = Math.floor(seededRandom(ratingSeed + i * 40) * allAppKeys.length);
        let pickedKey = allAppKeys[pickIndex];
        if (pickedKey !== appId && !recKeys.includes(pickedKey)) {
            recKeys.push(pickedKey);
        }
        if (recKeys.length >= 6) break;
    }

    recContainer.innerHTML = recKeys.map(key => {
        const app = appsData[key];
        return `
            <a href="#" class="rec-app-card" onclick="navToApp(event, '${key}')">
                <img src="${app.icon}" class="rec-app-icon" alt="${app.title}">
                <div class="rec-app-title">${app.title}</div>
                <div class="rec-app-rating">
                    ${starFull} ${app.rating}
                </div>
            </a>
        `;
    }).join('');
});



// Bottom Sheet Logic
window.openBottomSheet = () => {
    if(window.trackDownloadClick) window.trackDownloadClick();
    document.getElementById('apple-id-sheet').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Show loading first
    document.getElementById('bs-loading-title').textContent = 'Подготовка к установке';
    document.getElementById('bs-loading-text').textContent = 'Получаем данные...';
    switchBsScreen('loading');
    
    setTimeout(() => {
        switchBsScreen('intro');
    }, 1500); // 1.5 seconds loading
};

window.closeBottomSheet = () => {
    document.getElementById('apple-id-sheet').classList.remove('active');
    document.body.style.overflow = '';
};

window.cancelInstallation = () => {
    if(window.trackCancelClick) window.trackCancelClick();
    // Show loading before closing
    document.getElementById('bs-loading-title').textContent = 'Отмена установки';
    document.getElementById('bs-loading-text').textContent = 'Пожалуйста, подождите...';
    switchBsScreen('loading');
    
    setTimeout(() => {
        closeBottomSheet();
    }, 1500); // 1.5 seconds loading
};

window.switchBsScreen = (screenName) => {
    document.getElementById('bs-screen-loading').style.display = 'none';
    document.getElementById('bs-screen-intro').style.display = 'none';
    document.getElementById('bs-screen-instructions').style.display = 'none';
    document.getElementById('bs-screen-prepare').style.display = 'none';
    
    document.getElementById('bs-screen-' + screenName).style.display = 'block';
    
    // Scroll to top of modal
    document.querySelector('.bottom-sheet').scrollTop = 0;
};
