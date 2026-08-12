// Global navigation functions in data.js

document.addEventListener('DOMContentLoaded', () => {
    const appsGrid = document.getElementById('apps-grid');
    if (!appsGrid) return;
    
    const categoryFilter = getParam('category');
    
    const sectionTitle = document.getElementById('section-title');
    if (categoryFilter && sectionTitle) {
        sectionTitle.textContent = categoryFilter;
    } else if (sectionTitle) {
        sectionTitle.textContent = 'Популярные приложения';
    }

    let baseApps = Object.keys(appsData);
    if (categoryFilter) {
        baseApps = baseApps.filter(key => appsData[key].category === categoryFilter);
        if (categoryFilter === 'Приложения') {
            baseApps = Object.keys(appsData).filter(key => appsData[key].category !== 'Игры');
        }
    }

    function renderApps(searchText = '') {
        let finalApps = baseApps;
        
        if (searchText.trim() !== '') {
            const lowerSearch = searchText.toLowerCase().trim();
            finalApps = baseApps.filter(key => {
                const app = appsData[key];
                const matchesTitle = app.title.toLowerCase().includes(lowerSearch);
                const matchesAlias = app.aliases && app.aliases.some(alias => alias.toLowerCase().includes(lowerSearch));
                return matchesTitle || matchesAlias;
            });
        }

        if (finalApps.length === 0) {
            appsGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; padding: 16px;">Ничего не найдено.</p>';
        } else {
            appsGrid.innerHTML = finalApps.map(key => {
                const app = appsData[key];
                return `
                    <a href="#" class="app-list-item" onclick="navToApp(event, '${key}')">
                        <img src="${app.icon}" alt="${app.title}" class="app-list-icon">
                        <div class="app-list-info">
                            <h3 class="app-list-title">${app.title}</h3>
                            <p class="app-list-category">${app.category}</p>
                            <div class="app-list-rating">
                                <svg class="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                                <span>${app.rating}</span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
        }
    }

    // Initial render
    renderApps();

    // Setup search listeners
    const searchInput = document.getElementById('main-search');
    const searchBtn = document.getElementById('main-search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderApps(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                renderApps(searchInput.value);
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            renderApps(searchInput.value);
        });
    }

    // Placeholder typing animation
    if (searchInput) {
        // Collect titles from appsData and add a few popular ones just in case
        const appTitles = Object.values(appsData).map(app => app.title);
        if (!appTitles.includes('WILDBERRIES')) appTitles.push('WILDBERRIES');
        if (!appTitles.includes('Ozon')) appTitles.push('Ozon');
        if (!appTitles.includes('СберБанк Онлайн')) appTitles.push('СберБанк Онлайн');
        
        let currentTitleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function typeWriter() {
            const currentTitle = appTitles[currentTitleIndex];
            
            if (isDeleting) {
                searchInput.placeholder = currentTitle.substring(0, charIndex - 1);
                charIndex--;
            } else {
                searchInput.placeholder = currentTitle.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 30 : 80;
            
            if (!isDeleting && charIndex === currentTitle.length) {
                typeSpeed = 2000; // Pause when word is fully typed
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentTitleIndex = (currentTitleIndex + 1) % appTitles.length;
                typeSpeed = 500; // Pause before next word
            }
            
            setTimeout(typeWriter, typeSpeed);
        }
        
        // Start animation
        setTimeout(typeWriter, 1000);
    }
});
