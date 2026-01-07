
/**
 * SkyHigh Authentication System
 * Handles login/logout and UI updates across all pages
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    // Inject Login Modal
    injectLoginModal();

    // Check Auth State
    checkAuthState();

    // Attach Event Listeners
    attachAuthListeners();
}

function injectLoginModal() {
    const modalHtml = `
    <div id="authModal" class="modal hidden">
        <div class="modal-content" style="max-width: 400px;">
            <span class="close-modal" id="closeAuthModal">&times;</span>
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px;">Вход</h2>
                <p style="color: var(--gray-600);">Войдите, чтобы управлять бронированиями</p>
            </div>
            <form id="authForm">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--gray-700);">Email</label>
                    <input type="email" id="authEmail" required placeholder="name@example.com" 
                        style="width: 100%; padding: 12px; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 16px;">
                </div>
                <div class="form-group" style="margin-bottom: 24px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--gray-700);">Пароль</label>
                    <input type="password" id="authPassword" required placeholder="••••••••" 
                        style="width: 100%; padding: 12px; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 16px;">
                </div>
                <button type="submit" class="btn-primary" 
                    style="width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer;">
                    Войти
                </button>
            </form>
        </div>
    </div>
    
    <!-- Logout Confirmation Modal (Optional/Reuse) or just simple logout -->
    `;

    // Check if modal already exists (prevent duplicates if loaded multiple times)
    if (!document.getElementById('authModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('skyhigh_user'));
    const loginBtn = document.querySelector('.btn-login');

    if (!loginBtn) return;

    if (user) {
        // User is logged in
        loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${user.email.split('@')[0]}`;
        loginBtn.classList.add('logged-in');
        loginBtn.setAttribute('title', 'Нажмите, чтобы выйти');

        // Ensure "My Orders" link is visible (it's always visible in design, which is fine)
    } else {
        // User is logged out
        loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> Войти`;
        loginBtn.classList.remove('logged-in');
        loginBtn.removeAttribute('title');
    }
}

function attachAuthListeners() {
    const loginBtn = document.querySelector('.btn-login');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authForm = document.getElementById('authForm');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('skyhigh_user'));

            if (user) {
                // Determine action for logged in user (Logout for simplicity or Profile)
                if (confirm(`Вы хотите выйти из аккаунта ${user.email}?`)) {
                    logout();
                }
            } else {
                // Open Login Modal
                authModal.classList.remove('hidden');
            }
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.add('hidden');
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            // Fake password check

            login(email);
            authModal.classList.add('hidden');
        });
    }
}

function login(email) {
    const user = {
        email: email,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('skyhigh_user', JSON.stringify(user));
    checkAuthState();
    // alert('Вы успешно вошли!');
}

function logout() {
    localStorage.removeItem('skyhigh_user');
    checkAuthState();
    // Redirect to main if on protected page? (Not necessary for now as pages are public)
}
