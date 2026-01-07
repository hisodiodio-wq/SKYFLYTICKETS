/**
 * SkyHigh Hotels Booking - Ultra Fast Version
 * rewritten from scratch for maximum performance
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STATIC DATA
    // ==========================================
    const CITIES = [
        { name: 'Москва', country: 'Россия', hotels: 450 },
        { name: 'Санкт-Петербург', country: 'Россия', hotels: 280 },
        { name: 'Алматы', country: 'Казахстан', hotels: 120 },
        { name: 'Астана', country: 'Казахстан', hotels: 85 },
        { name: 'Дубай', country: 'ОАЭ', hotels: 520 },
        { name: 'Стамбул', country: 'Турция', hotels: 380 },
        { name: 'Лондон', country: 'Великобритания', hotels: 650 },
        { name: 'Париж', country: 'Франция', hotels: 580 },
        { name: 'Нью-Йорк', country: 'США', hotels: 720 },
        { name: 'Токио', country: 'Япония', hotels: 490 },
        { name: 'Сингапур', country: 'Сингапур', hotels: 310 },
        { name: 'Бангкок', country: 'Таиланд', hotels: 420 },
        { name: 'Барселона', country: 'Испания', hotels: 340 },
        { name: 'Рим', country: 'Италия', hotels: 380 },
        { name: 'Амстердам', country: 'Нидерланды', hotels: 270 },
        { name: 'Берлин', country: 'Германия', hotels: 320 }
    ];

    const HOTEL_NAMES = [
        'Grand Hotel', 'Royal Plaza', 'Luxury Suites', 'City Center Hotel', 'Golden Palace',
        'Sky View', 'Pearl Residence', 'Crown Plaza', 'Diamond Hotel', 'Paradise Resort',
        'Ocean View', 'Mountain Lodge', 'Urban Stay', 'Comfort Inn', 'Elite Hotel'
    ];

    const AMENITIES = [
        { id: 'wifi', icon: 'fa-wifi', label: 'Wi-Fi' },
        { id: 'parking', icon: 'fa-square-parking', label: 'Парковка' },
        { id: 'pool', icon: 'fa-water-ladder', label: 'Бассейн' },
        { id: 'gym', icon: 'fa-dumbbell', label: 'Спортзал' },
        { id: 'restaurant', icon: 'fa-utensils', label: 'Ресторан' }
    ];

    // ==========================================
    // 2. STATE MANAGEMENT
    // ==========================================
    const state = {
        city: null, // { name, country }
        dates: [],
        guests: { adults: 2, children: 0, rooms: 1 },
        hotels: [], // Current search results
        filtered: [], // After filters applied
        filters: { priceMin: 0, priceMax: 2000, ratings: [], types: [], amenities: [] },
        sort: 'recommended',
        page: 1,
        perPage: 10
    };

    // ==========================================
    // 3. DOM ELEMENTS
    // ==========================================
    const el = {
        cityInput: document.getElementById('cityInput'),
        cityDropdown: document.getElementById('cityDropdown'),
        datesInput: document.getElementById('datesInput'),
        searchForm: document.getElementById('searchForm'),
        searchBtn: document.getElementById('searchBtn'),
        loader: document.getElementById('loader'),
        resultsSection: document.getElementById('results'),
        hotelsList: document.getElementById('hotelsList'),
        hotelsCount: document.getElementById('hotelsCount'),

        // Filters
        priceMin: document.getElementById('priceMin'),
        priceMax: document.getElementById('priceMax'),
        applyPrice: document.getElementById('applyPrice'),
        resetFilters: document.getElementById('resetFilters'),
        sortSelect: document.getElementById('sortSelect'),

        // Pagination
        prevPage: document.getElementById('prevPage'),
        nextPage: document.getElementById('nextPage'),
        currentPage: document.getElementById('currentPage'),
        totalPages: document.getElementById('totalPages'),
        pagination: document.getElementById('pagination'),

        // Modal
        bookingModal: document.getElementById('bookingModal'),
        closeModal: document.getElementById('closeModal'),
        bookingForm: document.getElementById('bookingForm'),
        successModal: document.getElementById('successModal')
    };

    // ==========================================
    // 4. INITIALIZATION
    // ==========================================

    // Initialize Flatpickr
    flatpickr(el.datesInput, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd M',
        minDate: 'today',
        locale: 'ru',
        onChange: (selectedDates) => {
            state.dates = selectedDates;
        }
    });

    // ==========================================
    // 5. CITY AUTOCOMPLETE & SELECTION
    // ==========================================
    el.cityInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        state.city = null; // Reset selection on edit

        if (val.length < 1) {
            el.cityDropdown.classList.remove('show');
            return;
        }

        const matches = CITIES.filter(c => c.name.toLowerCase().includes(val));

        if (matches.length === 0) {
            el.cityDropdown.classList.remove('show');
            return;
        }

        el.cityDropdown.innerHTML = matches.map(c => `
            <div class="dropdown-item" onclick="selectCity('${c.name}', '${c.country}')">
                <div class="city">${c.name}</div>
                <div class="country">${c.country}</div>
            </div>
        `).join('');
        el.cityDropdown.classList.add('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!el.cityInput.contains(e.target) && !el.cityDropdown.contains(e.target)) {
            el.cityDropdown.classList.remove('show');
        }
    });

    // Global function for onclick in HTML string
    window.selectCity = (name, country) => {
        el.cityInput.value = name;
        state.city = { name, country };
        el.cityDropdown.classList.remove('show');
    };

    // ==========================================
    // 6. SEARCH LOGIC (INSTANT)
    // ==========================================
    el.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Auto-detect city if typed perfectly
        if (!state.city) {
            const val = el.cityInput.value.toLowerCase().trim();
            const match = CITIES.find(c => c.name.toLowerCase() === val);
            if (match) {
                state.city = match;
            } else {
                alert('Выберите город из списка');
                return;
            }
        }

        if (!state.dates || state.dates.length === 0) {
            alert('Выберите даты');
            return;
        }

        // Show loader briefly
        el.loader.classList.remove('hidden');
        el.resultsSection.classList.add('hidden');

        // Execute "Async" check immediately
        setTimeout(() => {
            performSearch(state.city.name);
            el.loader.classList.add('hidden');
            el.resultsSection.classList.remove('hidden');
            el.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300); // 300ms is a healthy UI interaction time
    });

    function performSearch(cityName) {
        // Generate mock data
        const hotels = [];

        // Hotel-specific image IDs from Unsplash
        const hotelImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1455587734955-081b22074882?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1549294413-26f195200c16?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=220&fit=crop',
            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=300&h=220&fit=crop'
        ];

        for (let i = 0; i < 30; i++) {
            const name = HOTEL_NAMES[Math.floor(Math.random() * HOTEL_NAMES.length)];
            const price = Math.floor(Math.random() * 400) + 50;
            const rating = (Math.random() * 2 + 7).toFixed(1); // 7.0 - 9.9
            const stars = Math.floor(Math.random() * 2) + 3; // 3-5

            hotels.push({
                id: i,
                name: `${name} ${i + 1}`,
                city: cityName,
                price: price,
                rating: rating,
                stars: stars,
                reviewCount: Math.floor(Math.random() * 1000),
                image: hotelImages[i % hotelImages.length], // Cycle through hotel images
                type: 'Отель',
                description: 'Отличный отель в центре города с прекрасным видом и высоким уровнем сервиса. Идеально подходит для отдыха.',
                amenities: AMENITIES.slice(0, 3)
            });
        }

        state.hotels = hotels;
        state.filtered = [...hotels];
        state.page = 1;

        renderHotels();
    }

    // ==========================================
    // 7. RENDERING
    // ==========================================
    function renderHotels() {
        const start = (state.page - 1) * state.perPage;
        const end = start + state.perPage;
        const items = state.filtered.slice(start, end);

        el.hotelsCount.textContent = state.filtered.length;

        el.hotelsList.innerHTML = items.map(h => `
            <div class="hotel-card">
                <img src="${h.image}" class="hotel-image" onerror="this.src='https://placehold.co/300x220/e2e8f0/64748b?text=Hotel'">
                <div class="hotel-info">
                    <div class="hotel-header">
                        <h3 class="hotel-name">${h.name}</h3>
                        <div class="hotel-stars">${'★'.repeat(h.stars)}</div>
                    </div>
                    <p class="hotel-description">${h.description}</p>
                    <div class="hotel-amenities">
                        ${h.amenities.map(a => `<i class="fa-solid ${a.icon}" title="${a.label}"></i>`).join(' ')}
                    </div>
                </div>
                <div class="hotel-price">
                    <div class="rating-badge">${h.rating}</div>
                    <div class="price">$${h.price}</div>
                    <div class="price-per-night">за ночь</div>
                    <button class="book-hotel-btn" onclick="openBooking(${h.id})">Забронировать</button>
                </div>
            </div>
        `).join('');

        updatePagination();
    }

    // ==========================================
    // 8. PAGINATION & SORTING
    // ==========================================
    function updatePagination() {
        const total = Math.ceil(state.filtered.length / state.perPage);
        el.currentPage.textContent = state.page;
        el.totalPages.textContent = total;

        el.prevPage.disabled = state.page === 1;
        el.nextPage.disabled = state.page >= total;

        el.pagination.classList.toggle('hidden', total <= 1);
    }

    el.prevPage.addEventListener('click', () => {
        if (state.page > 1) { state.page--; renderHotels(); }
    });

    el.nextPage.addEventListener('click', () => {
        const total = Math.ceil(state.filtered.length / state.perPage);
        if (state.page < total) { state.page++; renderHotels(); }
    });

    el.sortSelect.addEventListener('change', () => {
        const sort = el.sortSelect.value;
        if (sort === 'price-asc') state.filtered.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') state.filtered.sort((a, b) => b.price - a.price);
        if (sort === 'rating') state.filtered.sort((a, b) => b.rating - a.rating);
        renderHotels();
    });

    // ==========================================
    // 9. FILTERING
    // ==========================================
    el.applyPrice.addEventListener('click', () => {
        const min = parseInt(el.priceMin.value) || 0;
        const max = parseInt(el.priceMax.value) || 10000;

        state.filtered = state.hotels.filter(h => h.price >= min && h.price <= max);
        state.page = 1;
        renderHotels();
    });

    el.resetFilters.addEventListener('click', () => {
        el.priceMin.value = '';
        el.priceMax.value = '';
        state.filtered = [...state.hotels];
        state.page = 1;
        renderHotels();
    });

    // ==========================================
    // 10. BOOKING MODAL
    // ==========================================
    window.openBooking = (id) => {
        const hotel = state.hotels.find(h => h.id === id);
        if (!hotel) return;

        state.selectedHotel = hotel; // Store for booking

        // Populate summary
        document.getElementById('hotelSummary').innerHTML = `
            <h3>${hotel.name}</h3>
            <div>${state.dates[0]?.toLocaleDateString() || ''} — ${state.dates[1]?.toLocaleDateString() || ''}</div>
            <div style="font-size: 24px; color: var(--primary); font-weight: bold; margin-top: 10px;">$${hotel.price} <small>/ ночь</small></div>
        `;

        el.bookingModal.classList.remove('hidden');
    };

    el.closeModal.addEventListener('click', () => {
        el.bookingModal.classList.add('hidden');
    });

    el.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        el.bookingModal.classList.add('hidden');

        // Generate random Booking ID
        const bookingId = 'HTL-' + Math.floor(Math.random() * 900000 + 100000);
        document.getElementById('bookingId').textContent = bookingId;
        document.getElementById('confirmEmail').textContent = document.getElementById('guestEmail').value;

        // Show success
        el.successModal.classList.remove('hidden');

        // Save to localStorage
        if (state.selectedHotel) {
            // Calculate nights
            const start = state.dates[0] || new Date();
            const end = state.dates[1] || new Date(start.getTime() + 86400000);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            const newOrder = {
                id: bookingId,
                type: 'hotel',
                status: 'confirmed',
                date: new Date().toISOString(),
                hotelName: state.selectedHotel.name,
                city: state.selectedHotel.city,
                country: 'Unknown', // Country wasn't explicitly stored in hotel object in previous code, would need lookup if critical.
                checkIn: start.toISOString(),
                checkOut: end.toISOString(),
                nights: nights,
                rooms: state.guests.rooms,
                guests: state.guests.adults + state.guests.children,
                price: state.selectedHotel.price * nights,
                image: state.selectedHotel.image
            };

            // Try to look up country from CITIES if possible
            const cityObj = CITIES.find(c => c.name === state.selectedHotel.city);
            if (cityObj) newOrder.country = cityObj.country;

            const existingOrders = JSON.parse(localStorage.getItem('skyhigh_orders') || '[]');
            existingOrders.unshift(newOrder); // Add to beginning
            localStorage.setItem('skyhigh_orders', JSON.stringify(existingOrders));
        }

        setTimeout(() => {
            // el.successModal.classList.add('hidden'); // Keep it open or let user close
        }, 3000);
    });
});
