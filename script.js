/**
 * SkyHigh Flight Booking - Main JavaScript
 * Complete functionality for flight search, booking, and user interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== DATA =====
    const cities = [
        { name: 'Москва', code: 'SVO', country: 'Россия', airport: 'Шереметьево' },
        { name: 'Москва', code: 'DME', country: 'Россия', airport: 'Домодедово' },
        { name: 'Санкт-Петербург', code: 'LED', country: 'Россия', airport: 'Пулково' },
        { name: 'Алматы', code: 'ALA', country: 'Казахстан', airport: 'Международный' },
        { name: 'Астана', code: 'NQZ', country: 'Казахстан', airport: 'Назарбаев' },
        { name: 'Дубай', code: 'DXB', country: 'ОАЭ', airport: 'Международный' },
        { name: 'Стамбул', code: 'IST', country: 'Турция', airport: 'Международный' },
        { name: 'Лондон', code: 'LHR', country: 'Великобритания', airport: 'Хитроу' },
        { name: 'Париж', code: 'CDG', country: 'Франция', airport: 'Шарль-де-Голль' },
        { name: 'Нью-Йорк', code: 'JFK', country: 'США', airport: 'Кеннеди' },
        { name: 'Токио', code: 'HND', country: 'Япония', airport: 'Ханеда' },
        { name: 'Сингапур', code: 'SIN', country: 'Сингапур', airport: 'Чанги' },
        { name: 'Бангкок', code: 'BKK', country: 'Таиланд', airport: 'Суварнабхуми' },
        { name: 'Сеул', code: 'ICN', country: 'Южная Корея', airport: 'Инчхон' },
        { name: 'Пекин', code: 'PEK', country: 'Китай', airport: 'Столичный' },
        { name: 'Берлин', code: 'BER', country: 'Германия', airport: 'Бранденбург' },
        { name: 'Рим', code: 'FCO', country: 'Италия', airport: 'Фьюмичино' },
        { name: 'Барселона', code: 'BCN', country: 'Испания', airport: 'Эль-Прат' },
        { name: 'Амстердам', code: 'AMS', country: 'Нидерланды', airport: 'Схипхол' },
        { name: 'Ташкент', code: 'TAS', country: 'Узбекистан', airport: 'Международный' },
        { name: 'Бишкек', code: 'FRU', country: 'Кыргызстан', airport: 'Манас' },
        { name: 'Баку', code: 'GYD', country: 'Азербайджан', airport: 'Гейдар Алиев' },
        { name: 'Тбилиси', code: 'TBS', country: 'Грузия', airport: 'Международный' },
        { name: 'Минск', code: 'MSQ', country: 'Беларусь', airport: 'Национальный' }
    ];

    const airlines = [
        { name: 'Air Astana', icon: 'fa-plane' },
        { name: 'Emirates', icon: 'fa-plane-departure' },
        { name: 'Turkish Airlines', icon: 'fa-plane-circle-check' },
        { name: 'Lufthansa', icon: 'fa-plane-up' },
        { name: 'Qatar Airways', icon: 'fa-jet-fighter' },
        { name: 'Aeroflot', icon: 'fa-plane-arrival' },
        { name: 'FlyDubai', icon: 'fa-fighter-jet' },
        { name: 'Uzbekistan Airways', icon: 'fa-plane' }
    ];

    const aircrafts = ['Boeing 777-300ER', 'Airbus A350-900', 'Boeing 787-9', 'Airbus A380', 'Boeing 737 MAX'];

    // ===== STATE =====
    let state = {
        tripMode: 'round',
        origin: null,
        destination: null,
        dates: null,
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy',
        flights: [],
        selectedFlight: null
    };

    // ===== DOM ELEMENTS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const elements = {
        searchForm: $('#searchForm'),
        originInput: $('#origin'),
        destInput: $('#destination'),
        originDropdown: $('#originDropdown'),
        destDropdown: $('#destDropdown'),
        originCode: $('#originCode'),
        destCode: $('#destCode'),
        swapBtn: $('#swapBtn'),
        datesInput: $('#dates'),
        passengersField: $('#passengersField'),
        passengersTrigger: $('#passengersTrigger'),
        passengersDropdown: $('#passengersDropdown'),
        passengersText: $('#passengersText'),
        searchBtn: $('#searchBtn'),
        results: $('#results'),
        flightsList: $('#flightsList'),
        flightsCount: $('#flightsCount'),
        bookingModal: $('#bookingModal'),
        closeModal: $('#closeModal'),
        bookingForm: $('#bookingForm'),
        flightSummary: $('#flightSummary'),
        modalPrice: $('#modalPrice'),
        successModal: $('#successModal'),
        bookingRef: $('#bookingRef'),
        loader: $('#loader'),
        tabs: $$('.tab'),
        filters: $$('.filter'),
        counterBtns: $$('.counter-btn')
    };

    // ===== DATE PICKER =====
    let datePicker = flatpickr(elements.datesInput, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd M',
        minDate: 'today',
        locale: 'ru',
        showMonths: window.innerWidth > 768 ? 2 : 1,
        onChange: (dates) => {
            state.dates = dates;
        }
    });

    // ===== TRIP MODE TABS =====
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.tripMode = tab.dataset.mode;

            datePicker.destroy();
            datePicker = flatpickr(elements.datesInput, {
                mode: state.tripMode === 'round' ? 'range' : 'single',
                dateFormat: 'Y-m-d',
                altInput: true,
                altFormat: 'd M',
                minDate: 'today',
                locale: 'ru',
                showMonths: window.innerWidth > 768 ? 2 : 1,
                onChange: (dates) => { state.dates = dates; }
            });

            elements.datesInput.placeholder = state.tripMode === 'round' ? 'Туда — Обратно' : 'Дата вылета';
        });
    });

    // ===== AUTOCOMPLETE =====
    function setupAutocomplete(input, dropdown, codeEl, type) {
        input.addEventListener('input', () => {
            const val = input.value.toLowerCase().trim();
            if (val.length < 1) {
                dropdown.classList.remove('show');
                return;
            }

            const matches = cities.filter(c =>
                c.name.toLowerCase().includes(val) ||
                c.code.toLowerCase().includes(val) ||
                c.country.toLowerCase().includes(val)
            ).slice(0, 8);

            if (matches.length === 0) {
                dropdown.classList.remove('show');
                return;
            }

            dropdown.innerHTML = matches.map(c => `
                <div class="dropdown-item" data-code="${c.code}" data-name="${c.name}">
                    <div>
                        <div class="city">${c.name}</div>
                        <div class="country">${c.airport}, ${c.country}</div>
                    </div>
                    <span class="airport-code">${c.code}</span>
                </div>
            `).join('');

            dropdown.classList.add('show');

            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    input.value = item.dataset.name;
                    codeEl.textContent = item.dataset.code;
                    state[type] = { name: item.dataset.name, code: item.dataset.code };
                    dropdown.classList.remove('show');
                });
            });
        });

        input.addEventListener('focus', () => {
            if (input.value.length > 0) {
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    setupAutocomplete(elements.originInput, elements.originDropdown, elements.originCode, 'origin');
    setupAutocomplete(elements.destInput, elements.destDropdown, elements.destCode, 'destination');

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!elements.originInput.contains(e.target) && !elements.originDropdown.contains(e.target)) {
            elements.originDropdown.classList.remove('show');
        }
        if (!elements.destInput.contains(e.target) && !elements.destDropdown.contains(e.target)) {
            elements.destDropdown.classList.remove('show');
        }
        if (!elements.passengersField.contains(e.target)) {
            elements.passengersDropdown.classList.remove('show');
        }
    });

    // ===== SWAP BUTTON =====
    elements.swapBtn.addEventListener('click', () => {
        const tempVal = elements.originInput.value;
        const tempCode = elements.originCode.textContent;

        elements.originInput.value = elements.destInput.value;
        elements.originCode.textContent = elements.destCode.textContent;

        elements.destInput.value = tempVal;
        elements.destCode.textContent = tempCode;

        const tempState = state.origin;
        state.origin = state.destination;
        state.destination = tempState;
    });

    // ===== PASSENGERS =====
    elements.passengersTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.passengersDropdown.classList.toggle('show');
    });

    function updatePassengersText() {
        const total = state.passengers.adults + state.passengers.children + state.passengers.infants;
        let text = `${total} `;

        // Russian grammar for passenger count
        const lastDigit = total % 10;
        const lastTwoDigits = total % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            text += 'пассажиров';
        } else if (lastDigit === 1) {
            text += 'пассажир';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            text += 'пассажира';
        } else {
            text += 'пассажиров';
        }

        elements.passengersText.textContent = text;
    }

    elements.counterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.type;
            const action = btn.dataset.action;
            const countEl = $(`#${type}Count`);
            const currentCount = state.passengers[type];

            if (action === 'plus') {
                const total = state.passengers.adults + state.passengers.children + state.passengers.infants;
                if (total < 9) {
                    // Infants cannot exceed adults count
                    if (type === 'infants' && state.passengers.infants >= state.passengers.adults) {
                        return;
                    }
                    state.passengers[type]++;
                }
            } else {
                // Minus action
                if (type === 'adults') {
                    // Adults must be at least 1
                    if (state.passengers.adults > 1) {
                        state.passengers[type]--;
                        // Adjust infants if they now exceed adults
                        if (state.passengers.infants > state.passengers.adults) {
                            state.passengers.infants = state.passengers.adults;
                            $('#infantsCount').textContent = state.passengers.infants;
                        }
                    }
                } else if (state.passengers[type] > 0) {
                    state.passengers[type]--;
                }
            }

            countEl.textContent = state.passengers[type];
            updatePassengersText();
        });
    });

    // ===== FLIGHT GENERATOR =====
    function generateFlights(origin, destination, count = 15) {
        const flights = [];
        for (let i = 0; i < count; i++) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const aircraft = aircrafts[Math.floor(Math.random() * aircrafts.length)];
            const basePrice = Math.floor(Math.random() * 700) + 150;
            const deptHour = Math.floor(Math.random() * 24);
            const deptMin = Math.floor(Math.random() * 60);
            const durationH = Math.floor(Math.random() * 10) + 1;
            const durationM = Math.floor(Math.random() * 60);

            const arrHour = (deptHour + durationH) % 24;
            const arrMin = (deptMin + durationM) % 60;

            const formatTime = (h, m) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const isDirect = Math.random() > 0.3;

            flights.push({
                id: Math.random().toString(36).substr(2, 9),
                airline: airline.name,
                airlineIcon: airline.icon,
                aircraft: aircraft,
                origin: origin,
                destination: destination,
                departTime: formatTime(deptHour, deptMin),
                arriveTime: formatTime(arrHour, arrMin),
                duration: `${durationH}ч ${durationM}м`,
                durationTotal: durationH * 60 + durationM,
                stops: isDirect ? 0 : 1,
                stopsText: isDirect ? 'Прямой' : '1 пересадка',
                price: basePrice,
                class: state.cabinClass === 'economy' ? 'Эконом' : 'Бизнес',
                baggage: Math.random() > 0.4,
                wifi: Math.random() > 0.5,
                food: Math.random() > 0.3,
                score: (1000 - basePrice) * 0.5 + (isDirect ? 200 : 0) + (24 - durationH) * 5
            });
        }
        return flights;
    }

    // ===== RENDER FLIGHTS =====
    function renderFlights(flights) {
        elements.flightsList.innerHTML = flights.map(f => `
            <div class="flight-card" data-id="${f.id}">
                <div class="flight-info">
                    <div class="airline-info">
                        <div class="airline-logo"><i class="fa-solid ${f.airlineIcon}"></i></div>
                        <div>
                            <span class="airline-name">${f.airline}</span>
                            <span class="aircraft-type">${f.aircraft}</span>
                        </div>
                    </div>
                    <div class="route-info">
                        <div class="time-block">
                            <div class="time">${f.departTime}</div>
                            <div class="city-code">${f.origin}</div>
                        </div>
                        <div class="duration-block">
                            <div class="duration-text">${f.duration}</div>
                            <div class="duration-line"></div>
                            <div class="stops ${f.stops === 0 ? 'direct' : 'layover'}">${f.stopsText}</div>
                        </div>
                        <div class="time-block">
                            <div class="time">${f.arriveTime}</div>
                            <div class="city-code">${f.destination}</div>
                        </div>
                    </div>
                    <div class="flight-meta">
                        <span><i class="fa-solid fa-suitcase"></i>${f.baggage ? 'Багаж 23кг' : 'Только ручная кладь'}</span>
                        ${f.wifi ? '<span><i class="fa-solid fa-wifi"></i>Wi-Fi</span>' : ''}
                        ${f.food ? '<span><i class="fa-solid fa-utensils"></i>Питание</span>' : ''}
                    </div>
                </div>
                <div class="flight-price">
                    <div>
                        <div class="price">$${f.price}</div>
                        <div class="price-type">${f.class}</div>
                    </div>
                    <button class="select-btn" data-id="${f.id}">Выбрать</button>
                </div>
            </div>
        `).join('');

        elements.flightsCount.textContent = flights.length;

        // Add click handlers
        elements.flightsList.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const flightId = btn.dataset.id;
                state.selectedFlight = state.flights.find(f => f.id === flightId);
                openBookingModal();
            });
        });
    }

    // ===== SORTING =====
    function sortFlights(criteria) {
        let sorted = [...state.flights];
        if (criteria === 'cheap') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (criteria === 'fast') {
            sorted.sort((a, b) => a.durationTotal - b.durationTotal);
        } else {
            sorted.sort((a, b) => b.score - a.score);
        }
        renderFlights(sorted);
    }

    elements.filters.forEach(filter => {
        filter.addEventListener('click', () => {
            elements.filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            sortFlights(filter.dataset.sort);
        });
    });

    // ===== SEARCH =====
    elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!state.origin || !state.destination) {
            alert('Пожалуйста, выберите города из списка');
            return;
        }

        if (!state.dates || state.dates.length === 0) {
            alert('Пожалуйста, выберите даты');
            return;
        }

        elements.loader.classList.remove('hidden');
        elements.searchBtn.disabled = true;

        setTimeout(() => {
            state.flights = generateFlights(state.origin.code, state.destination.code);
            sortFlights('best');
            elements.results.classList.remove('hidden');
            elements.results.scrollIntoView({ behavior: 'smooth' });
            elements.loader.classList.add('hidden');
            elements.searchBtn.disabled = false;
        }, 1500);
    });

    // ===== BOOKING MODAL =====
    function openBookingModal() {
        const f = state.selectedFlight;
        elements.flightSummary.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem;">
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:1.1rem; color:var(--gray-800); margin-bottom:0.25rem;">${f.airline}</div>
                    <div style="color:var(--gray-600); font-size:0.9rem;">${f.origin} → ${f.destination}</div>
                    <div style="color:var(--gray-500); font-size:0.85rem; margin-top:0.25rem;">${f.departTime} - ${f.arriveTime} • ${f.stopsText}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">$${f.price}</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">${f.class}</div>
                </div>
            </div>
        `;
        elements.modalPrice.textContent = `$${f.price}`;
        elements.bookingModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    elements.closeModal.addEventListener('click', () => {
        elements.bookingModal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    elements.bookingModal.addEventListener('click', (e) => {
        if (e.target === elements.bookingModal) {
            elements.bookingModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // ===== BOOKING FORM =====
    elements.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const lastName = $('#lastName').value.trim();
        const firstName = $('#firstName').value.trim();
        const email = $('#email').value.trim();

        if (!lastName || !firstName || !email) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        elements.bookingModal.classList.add('hidden');
        elements.loader.classList.remove('hidden');

        setTimeout(() => {
            const bookingRef = generateBookingRef();
            elements.loader.classList.add('hidden');
            elements.bookingRef.textContent = bookingRef;
            elements.successModal.classList.remove('hidden');

            // Save to localStorage
            const f = state.selectedFlight;
            const newOrder = {
                id: 'FLT-' + bookingRef,
                type: 'flight',
                status: 'confirmed',
                date: new Date().toISOString(),
                from: {
                    code: f.origin, // Assuming origin is city code based on current generation logic
                    city: cities.find(c => c.code === f.origin)?.name || f.origin,
                    time: f.departTime
                },
                to: {
                    code: f.destination,
                    city: cities.find(c => c.code === f.destination)?.name || f.destination,
                    time: f.arriveTime
                },
                duration: f.duration,
                passengers: state.passengers.adults + state.passengers.children + state.passengers.infants,
                price: f.price,
                airline: f.airline,
                flightNumber: f.airline.substring(0, 2).toUpperCase() + ' ' + Math.floor(Math.random() * 900 + 100) // Generate fake flight number
            };

            const existingOrders = JSON.parse(localStorage.getItem('skyhigh_orders') || '[]');
            existingOrders.unshift(newOrder); // Add to beginning
            localStorage.setItem('skyhigh_orders', JSON.stringify(existingOrders));

        }, 2000);
    });

    function generateBookingRef() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let ref = '';
        for (let i = 0; i < 6; i++) {
            ref += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return ref;
    }

    // ===== KEYBOARD NAVIGATION =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.bookingModal.classList.add('hidden');
            elements.originDropdown.classList.remove('show');
            elements.destDropdown.classList.remove('show');
            elements.passengersDropdown.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // ===== INITIALIZE =====
    updatePassengersText();
});
