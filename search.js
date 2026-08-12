document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.search-bar input');
    
    searchInputs.forEach(input => {
        const searchBar = input.closest('.search-bar');
        
        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.display = 'none';
        
        // Position it relative to the search bar container itself
        searchBar.style.position = 'relative';
        searchBar.appendChild(dropdown);

        function renderFrequentlySearched() {
            // Get all apps, maybe limit to top ones
            const topApps = Object.keys(appsData).slice(0, 15);
            let html = '<div class="search-frequent-header">Часто ищут</div>';
            html += topApps.map(key => `
                <div class="search-item frequent-item" onclick="navToApp(event, '${key}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-item-icon-svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <div class="search-item-title-frequent">${appsData[key].title}</div>
                </div>
            `).join('');
            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                renderFrequentlySearched();
                return;
            }

            // Phonetic transliteration map
            const ru2en = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 
                'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 
                'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 
                'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
            };
            const toEn = (str) => str.toLowerCase().split('').map(c => ru2en[c] || c).join('');
            const queryEn = toEn(query);

            // Search logic
            const results = Object.keys(appsData).filter(key => {
                const app = appsData[key];
                const matchesTitle = app.title.toLowerCase().includes(query) || toEn(app.title).includes(queryEn);
                const matchesAlias = app.aliases && app.aliases.some(alias => alias.toLowerCase().includes(query) || toEn(alias).includes(queryEn));
                return matchesTitle || matchesAlias;
            });

            if (results.length > 0) {
                dropdown.innerHTML = results.map(key => `
                    <div class="search-item" onclick="navToApp(event, '${key}')">
                        <img src="${appsData[key].icon}" alt="icon" class="search-item-icon">
                        <div class="search-item-info">
                            <div class="search-item-title">${appsData[key].title}</div>
                            <div class="search-item-category">${appsData[key].category}</div>
                        </div>
                    </div>
                `).join('');
                dropdown.style.display = 'block';
            } else {
                dropdown.innerHTML = '<div class="search-item-empty">Ничего не найдено</div>';
                dropdown.style.display = 'block';
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Show again when focused if has query or empty
        input.addEventListener('focus', () => {
            if (input.value.trim().length > 0) {
                // Dispatch input event to trigger search
                input.dispatchEvent(new Event('input'));
            } else {
                renderFrequentlySearched();
            }
        });
    });
});
