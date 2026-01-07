/**
 * SkyHigh Orders Page
 * Displays user's flight and hotel bookings
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // MOCK DATA - Sample Orders
    // ==========================================
    const mockOrders = [
        {
            id: 'FLT-789456',
            type: 'flight',
            status: 'confirmed',
            date: '2026-01-05',
            from: { code: 'ALA', city: 'Алматы', time: '14:30' },
            to: { code: 'DXB', city: 'Дубай', time: '18:45' },
            duration: '4ч 15м',
            passengers: 2,
            price: 450,
            airline: 'Air Astana',
            flightNumber: 'KC 941'
        },
        {
            id: 'HTL-123789',
            type: 'hotel',
            status: 'confirmed',
            date: '2026-01-03',
            hotelName: 'Grand Hotel Luxury',
            city: 'Дубай',
            country: 'ОАЭ',
            checkIn: '2026-02-15',
            checkOut: '2026-02-20',
            nights: 5,
            rooms: 1,
            guests: 2,
            price: 850,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=90&fit=crop'
        },
        {
            id: 'FLT-456123',
            type: 'flight',
            status: 'pending',
            date: '2026-01-06',
            from: { code: 'MOW', city: 'Москва', time: '09:15' },
            to: { code: 'IST', city: 'Стамбул', time: '12:30' },
            duration: '3ч 15м',
            passengers: 1,
            price: 280,
            airline: 'Turkish Airlines',
            flightNumber: 'TK 414'
        },
        {
            id: 'HTL-987654',
            type: 'hotel',
            status: 'confirmed',
            date: '2025-12-28',
            hotelName: 'Royal Plaza Hotel',
            city: 'Стамбул',
            country: 'Турция',
            checkIn: '2026-01-20',
            checkOut: '2026-01-25',
            nights: 5,
            rooms: 1,
            guests: 2,
            price: 620,
            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=120&h=90&fit=crop'
        },
        {
            id: 'FLT-321654',
            type: 'flight',
            status: 'cancelled',
            date: '2025-12-20',
            from: { code: 'LED', city: 'Санкт-Петербург', time: '16:00' },
            to: { code: 'PAR', city: 'Париж', time: '18:45' },
            duration: '3ч 45м',
            passengers: 2,
            price: 520,
            airline: 'Aeroflot',
            flightNumber: 'SU 2452'
        }
    ];

    // ==========================================
    // STATE
    // ==========================================
    let currentTab = 'all';
    let orders = [...mockOrders];
    let selectedOrderId = null;

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const el = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        ordersContainer: document.getElementById('ordersContainer'),
        emptyState: document.getElementById('emptyState'),
        orderModal: document.getElementById('orderModal'),
        closeModal: document.getElementById('closeModal'),
        modalBody: document.getElementById('modalBody'),
        cancelModal: document.getElementById('cancelModal'),
        closeCancelModal: document.getElementById('closeCancelModal'),
        confirmCancel: document.getElementById('confirmCancel'),
        keepBooking: document.getElementById('keepBooking')
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    // Load orders from localStorage or use mock data as seed
    const storedOrders = localStorage.getItem('skyhigh_orders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    } else {
        // First time load: seed with mock data and save
        orders = [...mockOrders];
        localStorage.setItem('skyhigh_orders', JSON.stringify(orders));
    }

    renderOrders();
    setupEventListeners();

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Tab switching
        el.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                el.tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderOrders();
            });
        });

        // Modal close
        el.closeModal.addEventListener('click', () => {
            el.orderModal.classList.add('hidden');
        });

        el.closeCancelModal.addEventListener('click', () => {
            el.cancelModal.classList.add('hidden');
        });

        el.keepBooking.addEventListener('click', () => {
            el.cancelModal.classList.add('hidden');
        });

        el.confirmCancel.addEventListener('click', () => {
            if (selectedOrderId) {
                const order = orders.find(o => o.id === selectedOrderId);
                if (order) {
                    order.status = 'cancelled';

                    // Update localStorage
                    localStorage.setItem('skyhigh_orders', JSON.stringify(orders));

                    renderOrders();
                }
            }
            el.cancelModal.classList.add('hidden');
        });

        // Close modals on overlay click
        el.orderModal.addEventListener('click', (e) => {
            if (e.target === el.orderModal) {
                el.orderModal.classList.add('hidden');
            }
        });

        el.cancelModal.addEventListener('click', (e) => {
            if (e.target === el.cancelModal) {
                el.cancelModal.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // RENDER ORDERS
    // ==========================================
    function renderOrders() {
        let filteredOrders = [];

        // Filter by tab
        if (currentTab === 'archive') {
            filteredOrders = orders.filter(o => o.status === 'cancelled');
        } else {
            // content for All, Flights, Hotels - exclude cancelled
            let activeOrders = orders.filter(o => o.status !== 'cancelled');

            if (currentTab === 'flights') {
                filteredOrders = activeOrders.filter(o => o.type === 'flight');
            } else if (currentTab === 'hotels') {
                filteredOrders = activeOrders.filter(o => o.type === 'hotel');
            } else {
                // 'all' tab
                filteredOrders = activeOrders;
            }
        }

        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredOrders.length === 0) {
            el.ordersContainer.innerHTML = '';

            // Customize empty state message based on tab
            const emptyTitle = currentTab === 'archive' ? 'Архив пуст' : 'У вас пока нет заказов';
            const emptyText = currentTab === 'archive' ? 'Здесь будут ваши отмененные заказы' : 'Забронируйте авиабилет или отель, чтобы увидеть их здесь';

            el.emptyState.querySelector('h2').textContent = emptyTitle;
            el.emptyState.querySelector('p').textContent = emptyText;

            el.emptyState.classList.remove('hidden');
            return;
        }

        el.emptyState.classList.add('hidden');
        el.ordersContainer.innerHTML = filteredOrders.map(order => {
            if (order.type === 'flight') {
                return renderFlightCard(order);
            } else {
                return renderHotelCard(order);
            }
        }).join('');

        // Attach event listeners to buttons
        attachCardEventListeners();
    }

    // ==========================================
    // RENDER FLIGHT CARD
    // ==========================================
    function renderFlightCard(order) {
        const statusClass = order.status;
        const statusText = {
            confirmed: 'Подтверждено',
            pending: 'В обработке',
            cancelled: 'Отменено'
        }[order.status];

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3><i class="fa-solid fa-plane"></i> Авиабилет</h3>
                        <div class="order-id">Номер заказа: ${order.id}</div>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <div class="order-date">${formatDate(order.date)}</div>
                    </div>
                </div>

                <div class="flight-details">
                    <div class="flight-route">
                        <div class="flight-city">
                            <div class="city-code">${order.from.code}</div>
                            <div class="city-name">${order.from.city}</div>
                            <div class="flight-time">${order.from.time}</div>
                        </div>
                        <div class="flight-arrow">
                            <i class="fa-solid fa-plane"></i>
                            <div class="flight-duration">${order.duration}</div>
                        </div>
                        <div class="flight-city">
                            <div class="city-code">${order.to.code}</div>
                            <div class="city-name">${order.to.city}</div>
                            <div class="flight-time">${order.to.time}</div>
                        </div>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="order-price">
                        <span class="price-label">Итого:</span>
                        <span class="price-amount">$${order.price}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view" data-action="view">Подробнее</button>
                        ${order.status !== 'cancelled' ? '<button class="btn-cancel-order" data-action="cancel">Отменить</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // RENDER HOTEL CARD
    // ==========================================
    function renderHotelCard(order) {
        const statusClass = order.status;
        const statusText = {
            confirmed: 'Подтверждено',
            pending: 'В обработке',
            cancelled: 'Отменено'
        }[order.status];

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3><i class="fa-solid fa-hotel"></i> Бронирование отеля</h3>
                        <div class="order-id">Номер заказа: ${order.id}</div>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <div class="order-date">${formatDate(order.date)}</div>
                    </div>
                </div>

                <div class="hotel-details">
                    <img src="${order.image}" alt="${order.hotelName}" class="hotel-image">
                    <div class="hotel-info-details">
                        <div class="hotel-name">${order.hotelName}</div>
                        <div class="hotel-location">
                            <i class="fa-solid fa-location-dot"></i>
                            ${order.city}, ${order.country}
                        </div>
                        <div class="hotel-dates">
                            <div><strong>Заезд:</strong> ${formatDate(order.checkIn)}</div>
                            <div><strong>Выезд:</strong> ${formatDate(order.checkOut)}</div>
                            <div><strong>Ночей:</strong> ${order.nights}</div>
                        </div>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="order-price">
                        <span class="price-label">Итого:</span>
                        <span class="price-amount">$${order.price}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view" data-action="view">Подробнее</button>
                        ${order.status !== 'cancelled' ? '<button class="btn-cancel-order" data-action="cancel">Отменить</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // ATTACH EVENT LISTENERS TO CARDS
    // ==========================================
    function attachCardEventListeners() {
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.order-card').dataset.orderId;
                showOrderDetails(orderId);
            });
        });

        document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.order-card').dataset.orderId;
                showCancelConfirmation(orderId);
            });
        });
    }

    // ==========================================
    // SHOW ORDER DETAILS
    // ==========================================
    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.type === 'flight') {
            el.modalBody.innerHTML = `
                <h2><i class="fa-solid fa-plane"></i> Детали авиабилета</h2>
                <div style="background: var(--gray-50); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Номер заказа:</strong>
                        <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${order.id}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Авиакомпания:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.airline}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Номер рейса:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.flightNumber}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Маршрут:</strong>
                        <div style="font-size: 18px; font-weight: 600; color: var(--gray-900);">
                            ${order.from.city} (${order.from.code}) → ${order.to.city} (${order.to.code})
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Время вылета:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.from.time}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Время прилета:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.to.time}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Пассажиров:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.passengers}</div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--gray-200);">
                        <strong style="color: var(--gray-700);">Общая стоимость:</strong>
                        <div style="font-size: 32px; font-weight: 800; color: var(--primary);">$${order.price}</div>
                    </div>
                </div>
            `;
        } else {
            el.modalBody.innerHTML = `
                <h2><i class="fa-solid fa-hotel"></i> Детали бронирования</h2>
                <div style="background: var(--gray-50); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Номер заказа:</strong>
                        <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${order.id}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Отель:</strong>
                        <div style="font-size: 18px; font-weight: 600; color: var(--gray-900);">${order.hotelName}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Местоположение:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.city}, ${order.country}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Дата заезда:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${formatDate(order.checkIn)}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Дата выезда:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${formatDate(order.checkOut)}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Количество ночей:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.nights}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Номеров:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.rooms}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--gray-700);">Гостей:</strong>
                        <div style="font-size: 16px; color: var(--gray-900);">${order.guests}</div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--gray-200);">
                        <strong style="color: var(--gray-700);">Общая стоимость:</strong>
                        <div style="font-size: 32px; font-weight: 800; color: var(--primary);">$${order.price}</div>
                    </div>
                </div>
            `;
        }

        el.orderModal.classList.remove('hidden');
    }

    // ==========================================
    // SHOW CANCEL CONFIRMATION
    // ==========================================
    function showCancelConfirmation(orderId) {
        selectedOrderId = orderId;
        el.cancelModal.classList.remove('hidden');
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }
});
