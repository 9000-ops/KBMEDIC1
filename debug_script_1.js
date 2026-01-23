
        // Global variables
        var currentAdmin = null;
        currentLang = 'ar';

        // API Helper Object - Handles all API calls with authentication
        var API = {
            token: null,

            init: function () {
                this.token = localStorage.getItem('token');
                return this;
            },

            getHeaders: function () {
                var headers = {
                    'Content-Type': 'application/json'
                };
                if (this.token) {
                    headers['Authorization'] = 'Bearer ' + this.token;
                }
                return headers;
            },

            // Generic fetch method
            fetch: async function (url, options = {}) {
                try {
                    var response = await fetch(url, {
                        ...options,
                        headers: { ...this.getHeaders(), ...options.headers }
                    });

                    if (!response.ok) {
                        if (response.status === 403 || response.status === 401) {
                            console.error('Authentication failed - redirecting to login');
                            // Don't throw here, let the caller handle it
                        }
                        throw new Error('Request failed: ' + response.status);
                    }

                    return await response.json();
                } catch (error) {
                    console.error('API Error:', url, error);
                    throw error;
                }
            },

            // Users API
            users: {
                getUsers: function () {
                    return API.fetch('/api/users');
                },
                getUser: function (id) {
                    return API.fetch('/api/users/' + id);
                },
                updateUser: function (id, data) {
                    return API.fetch('/api/users/' + id, {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                },
                deleteUser: function (id) {
                    return API.fetch('/api/users/' + id, {
                        method: 'DELETE'
                    });
                }
            },

            // Orders API
            orders: {
                getOrders: function () {
                    return API.fetch('/api/orders');
                },
                getOrder: function (id) {
                    return API.fetch('/api/orders/' + id);
                },
                updateOrder: function (id, data) {
                    return API.fetch('/api/orders/' + id, {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                },
                deleteOrder: function (id) {
                    return API.fetch('/api/orders/' + id, {
                        method: 'DELETE'
                    });
                }
            },

            // Products API
            products: {
                getProducts: function () {
                    return API.fetch('/api/products');
                },
                getProduct: function (id) {
                    return API.fetch('/api/products/' + id);
                },
                createProduct: function (data) {
                    return API.fetch('/api/products', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                },
                updateProduct: function (id, data) {
                    return API.fetch('/api/products/' + id, {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                },
                deleteProduct: function (id) {
                    return API.fetch('/api/products/' + id, {
                        method: 'DELETE'
                    });
                }
            },

            // Categories API
            categories: {
                getCategories: function () {
                    return API.fetch('/api/categories');
                },
                createCategory: function (data) {
                    return API.fetch('/api/categories', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                },
                updateCategory: function (id, data) {
                    return API.fetch('/api/categories/' + id, {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                },
                deleteCategory: function (id) {
                    return API.fetch('/api/categories/' + id, {
                        method: 'DELETE'
                    });
                }
            },

            // Settings API
            settings: {
                getSettings: function () {
                    return API.fetch('/api/settings');
                },
                updateSettings: function (data) {
                    return API.fetch('/api/settings', {
                        method: 'PUT',
                        body: JSON.stringify(data)
                    });
                }
            },

            // Auth API
            auth: {
                login: function (email, password) {
                    return API.fetch('/api/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password })
                    });
                },
                register: function (data) {
                    return API.fetch('/api/auth/register', {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                },
                me: function () {
                    return API.fetch('/api/auth/me');
                }
            }
        };

        // Initialize API
        API.init();

        // Safe JSON parse function
        function safeParse(key, defaultValue) {
            try {
                var item = localStorage.getItem(key);
                if (item === null || item === undefined) return defaultValue;
                return JSON.parse(item);
            } catch (e) {
                console.error('Parse error for ' + key + ':', e);
                return defaultValue;
            }
        }

        // Get products from API (Neon Database)
        async function getProducts() {
            try {
                API.init();
                const products = await API.products.getProducts();

                // Ensure products is an array
                if (!Array.isArray(products)) {
                    console.warn('Products data is not an array:', products);
                    return [];
                }

                // Format products
                const formattedProducts = products.map(p => ({
                    id: p.id,
                    name: { ar: p.name, fr: p.name },
                    price: parseFloat(p.price),
                    oldPrice: p.old_price ? parseFloat(p.old_price) : null,
                    category: p.category_id,
                    category_id: p.category_id,
                    image: p.image || '/images/product-placeholder.png',
                    description: p.description || '',
                    stock: 50,
                    rating: 4.5
                }));

                return formattedProducts;
            } catch (e) {
                console.error('API error loading products:', e);
                return [];
            }
        }

        // Load products - Fixed to properly handle async getProducts
        async function loadProducts() {
            try {
                var tbody = document.getElementById('products-table-body');
                if (!tbody) return;

                // Initialize API with current token
                API.init();

                // Fetch products from API - properly awaiting the async function
                var products = await getProducts();

                // Handle API response - ensure we have an array
                if (!products) {
                    products = [];
                }

                // If products is an object with a data property (common API pattern), use that
                if (!Array.isArray(products) && products.data) {
                    products = products.data;
                }

                // If still not an array, try to convert or use empty array
                if (!Array.isArray(products)) {
                    console.warn('Products data is not an array:', products);
                    // Try to get products from localStorage as fallback
                    var cachedProducts = localStorage.getItem('kb_medic_products');
                    if (cachedProducts) {
                        try {
                            products = JSON.parse(cachedProducts);
                        } catch (e) {
                            products = [];
                        }
                    } else {
                        products = [];
                    }
                }

                if (products.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Aucun produitات</td></tr>';
                    return;
                }

                tbody.innerHTML = products.map(function (p, i) {
                    var productName = p.name || (p.name_ar ? p.name_ar : 'produit');
                    return '<tr class="table-row"><td class="px-6 py-4">' + (i + 1) + '</td><td class="px-6 py-4"><img src="' + (p.image || '') + '" class="w-12 h-12 rounded-lg object-cover" alt=""></td><td class="px-6 py-4 font-medium">' + productName + '</td><td class="px-6 py-4">' + getCategoryName(p.category_id) + '</td><td class="px-6 py-4"><span class="font-bold">' + formatPrice(p.price) + '</span></td><td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs ' + ((p.stock || 50) > 20 ? 'bg-green-100 text-green-700' : (p.stock || 50) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') + '">' + (p.stock || 50) + '</span></td><td class="px-6 py-4"><div class="flex items-center justify-center gap-2"><button onclick="editProduct(' + p.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-edit"></i></button><button onclick="deleteProduct(' + p.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button></div></td></tr>';
                }).join('');
            } catch (error) {
                console.error('Error loading products:', error);
                var tbody = document.getElementById('products-table-body');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Une erreur est survenue في تحميل الproduitات</td></tr>';
                }
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function () {
            console.log('Admin page initializing...');

            localStorage.removeItem('kb_medic_products');
            localStorage.removeItem('users');
            localStorage.removeItem('orders');
            console.log('Cache cleared - fetching fresh data from database');

            // Load initial data
            loadCategories();

            // Setup login form
            var loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    performLogin();
                });
                console.log('Login form initialized');
            } else {
                console.error('Login form not found!');
            }

            // Listen for localStorage changes from other tabs (sync orders)
            window.addEventListener('storage', function (e) {
                if (e.key === 'orders' || e.key === 'users') {
                    // Refresh data when orders or users are updated
                    var currentTab = document.querySelector('.admin-nav-link.active');
                    if (currentTab && currentTab.textContent.includes('Commandes')) {
                        loadOrders();
                    } else if (currentTab && currentTab.textContent.includes('Clients')) {
                        loadCustomers();
                    }
                    // Always refresh dashboard stats
                    loadDashboard();
                }
            });

            // Initialize UI
            updateDate();

            // Check auth after a small delay to ensure DOM is ready
            setTimeout(function () {
                console.log('Checking admin authentication...');
                checkAdminAuth();
            }, 100);
        });

        // Check admin authentication
        function checkAdminAuth() {
            var adminData = localStorage.getItem('currentAdmin');
            if (adminData) {
                try {
                    currentAdmin = JSON.parse(adminData);
                    showAdminLayout();
                } catch (e) {
                    currentAdmin = null;
                    document.getElementById('login-modal').classList.add('active');
                }
            } else {
                document.getElementById('login-modal').classList.add('active');
            }
        }

        // Perform login via API
        async function performLogin() {
            var email = document.getElementById('admin-email').value.trim();
            var password = document.getElementById('admin-password').value.trim();

            console.log('Login attempt - Email:', email);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    currentAdmin = {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role
                    };
                    localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
                    localStorage.setItem('token', data.token);
                    document.getElementById('login-modal').classList.remove('active');
                    showAdminLayout();
                    showToast('مرحباً بك أيها المسؤول!', 'success');
                } else {
                    showToast(data.error || 'بيانات الدخول غير صحيحة', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Une erreur est survenue في الاتصال', 'error');
            }
        }

        // Logout
        function adminLogout() {
            currentAdmin = null;
            localStorage.removeItem('currentAdmin');
            document.getElementById('admin-layout').classList.add('hidden');
            document.getElementById('login-modal').classList.add('active');
            showToast('تم تسجيل الخروج بنجاح', 'info');
        }

        // Show admin layout
        function showAdminLayout() {
            document.getElementById('login-modal').classList.remove('active');
            document.getElementById('admin-layout').classList.remove('hidden');
            document.getElementById('admin-name').textContent = currentAdmin.name;
            loadDashboard();
        }

        // Show admin tab
        function showAdminTab(tab) {
            // Update navigation
            var navLinks = document.querySelectorAll('.admin-nav-link');
            navLinks.forEach(function (link) {
                link.classList.remove('active');
            });

            var tabMapping = {
                'dashboard': 0,
                'orders': 1,
                'products': 2,
                'categories': 3,
                'customers': 4,
                'messages': 5,
                'settings': 6
            };
            if (navLinks[tabMapping[tab]]) {
                navLinks[tabMapping[tab]].classList.add('active');
            }

            // Hide all tabs
            var allTabs = document.querySelectorAll('[id^="tab-"]');
            allTabs.forEach(function (t) {
                t.classList.add('hidden');
            });

            // Show selected tab
            var tabElement = document.getElementById('tab-' + tab);
            if (tabElement) {
                tabElement.classList.remove('hidden');
            }

            // Update page title
            var titles = {
                dashboard: 'Tableau de bord',
                orders: 'Gestion des commandes',
                products: 'إدارة الproduitات',
                categories: 'Gestion des catégories',
                customers: 'Clients',
                messages: 'الرسائل',
                settings: 'Paramètres'
            };

            document.getElementById('page-title').textContent = titles[tab] || tab;
            document.getElementById('page-subtitle').textContent = titles[tab] || tab;

            // Load tab content
            switch (tab) {
                case 'dashboard': loadDashboard(); break;
                case 'orders':
                    loadOrders();
                    loadDashboard(); // Update dashboard stats when viewing orders
                    break;
                case 'products': loadProducts(); break;
                case 'categories': loadCategories(); break;
                case 'customers': loadCustomers(); break;
                case 'messages': loadMessages(); break;
                case 'settings': loadSettings(); break;
            }
        }

        // Update date
        function updateDate() {
            var now = new Date();
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            var dateEl = document.getElementById('current-date');
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('ar-EG', options);
            }
        }

        // Clear cache and refresh all data from database
        function clearCache() {
            localStorage.removeItem('kb_medic_products');
            localStorage.removeItem('users');
            localStorage.removeItem('orders');
            localStorage.removeItem('categories');
            localStorage.removeItem('settings');

            showToast('تم Supprimer الكاش بنجاح - جارٍ إعادة تحميل البيانات...', 'success');

            // Reload page after short delay to fetch fresh data
            setTimeout(function () {
                window.location.reload();
            }, 1000);
        }

        // Load dashboard with API data
        async function loadDashboard() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch orders and users from API
                const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
                    fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const orders = ordersResponse.ok ? await ordersResponse.json() : [];
                const users = usersResponse.ok ? await usersResponse.json() : [];
                const products = productsResponse.ok ? await productsResponse.json() : [];

                // Calculate total sales from delivered orders
                var totalSales = orders
                    .filter(function (o) { return o.status === 'delivered'; })
                    .reduce(function (sum, o) { return sum + (parseFloat(o.total) || 0); }, 0);

                // Update stat elements
                var statOrders = document.getElementById('stat-orders');
                var statSales = document.getElementById('stat-sales');
                var statCustomers = document.getElementById('stat-customers');
                var statProducts = document.getElementById('stat-products');

                if (statOrders) statOrders.textContent = orders.length;
                if (statSales) statSales.textContent = formatPrice(totalSales);
                if (statCustomers) statCustomers.textContent = users.length;
                if (statProducts) statProducts.textContent = products.length;

                // Status chart
                var statusCounts = {
                    pending: orders.filter(function (o) { return o.status === 'pending'; }).length,
                    processing: orders.filter(function (o) { return o.status === 'processing'; }).length,
                    shipping: orders.filter(function (o) { return o.status === 'shipping'; }).length,
                    delivered: orders.filter(function (o) { return o.status === 'delivered'; }).length
                };

                var totalStatus = orders.length || 1;
                var statusChart = document.getElementById('status-chart');
                if (statusChart) {
                    var statusHtml = '';
                    Object.keys(statusCounts).forEach(function (status) {
                        var statusClass = '';
                        var statusColors = {
                            'pending': 'yellow',
                            'processing': 'blue',
                            'shipping': 'purple',
                            'delivered': 'green'
                        };
                        statusClass = statusColors[status] || 'gray';

                        statusHtml += '<div class="flex items-center gap-4">';
                        statusHtml += '<span class="w-32 text-sm text-gray-600">' + getStatusText(status) + '</span>';
                        statusHtml += '<div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">';
                        statusHtml += '<div class="bg-' + statusClass + ' h-full rounded-full" style="width:' + ((statusCounts[status] / totalStatus) * 100) + '%"></div>';
                        statusHtml += '</div><span class="w-8 text-sm font-medium">' + statusCounts[status] + '</span></div>';
                    });
                    if (orders.length === 0) {
                        statusHtml = '<p class="text-gray-500 text-center py-4">Aucun بيانات</p>';
                    }
                    statusChart.innerHTML = statusHtml;
                }

                // Top products
                var topProductsEl = document.getElementById('top-products');
                if (topProductsEl) {
                    if (products.length > 0) {
                        topProductsEl.innerHTML = products.slice(0, 5).map(function (p, i) {
                            return '<div class="flex items-center gap-3"><span class="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">' + (i + 1) + '</span><div class="flex-1"><p class="font-medium text-gray-800">' + (p.name || 'produit') + '</p><p class="text-sm text-gray-500">' + (p.stock || 0) + ' في Stock</p></div></div>';
                        }).join('');
                    } else {
                        topProductsEl.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun بيانات</p>';
                    }
                }

                // Load recent orders
                loadRecentOrders(orders);
            } catch (e) {
                console.error('Error loading dashboard:', e);
            }
        }

        // Load recent orders for dashboard
        function loadRecentOrders(orders) {
            var recentOrdersList = document.getElementById('recent-orders-list');
            if (!recentOrdersList) return;

            var recentOrders = orders.slice(0, 5);

            if (recentOrders.length === 0) {
                recentOrdersList.innerHTML = '<div class="p-8 text-center"><i class="fas fa-shopping-bag text-4xl text-gray-300 mb-2"></i><p class="text-gray-500">Aucun طلبات حديثة</p></div>';
                return;
            }

            recentOrdersList.innerHTML = recentOrders.map(function (order) {
                var statusClass = '';
                var statusColors = {
                    'pending': 'yellow',
                    'processing': 'blue',
                    'shipping': 'purple',
                    'delivered': 'green'
                };
                statusClass = statusColors[order.status] || 'gray';

                return '<div class="p-4 flex items-center justify-between hover:bg-gray-50 transition">' +
                    '<div class="flex items-center gap-3">' +
                    '<div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">' +
                    '<i class="fas fa-shopping-bag text-cyan-600"></i>' +
                    '</div>' +
                    '<div>' +
                    '<p class="font-medium text-gray-800">#' + order.id + ' - ' + (order.customer_name || 'Client') + '</p>' +
                    '<p class="text-sm text-gray-500">' + new Date(order.created_at).toLocaleDateString() + '</p>' +
                    '</div>' +
                    '</div>' +
                    '<div class="text-left">' +
                    '<p class="font-bold text-cyan-600">' + formatPrice(order.total) + '</p>' +
                    '<span class="px-2 py-1 rounded-full text-xs bg-' + statusClass + '-100 text-' + statusClass + '-700">' + getStatusText(order.status) + '</span>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }

        // Load orders from API
        async function loadOrders() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    renderOrdersTable([]);
                    return;
                }

                const response = await fetch('/api/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const orders = await response.json();
                renderOrdersTable(orders);
                loadDashboard();
            } catch (error) {
                console.error('Error loading orders:', error);
                renderOrdersTable([]);
            }
        }

        function renderOrdersTable(orders) {
            var tbody = document.getElementById('orders-table-body');
            var noOrders = document.getElementById('no-orders-message');

            if (!tbody) return;

            if (!orders || orders.length === 0) {
                tbody.innerHTML = '';
                if (noOrders) noOrders.classList.remove('hidden');
            } else {
                if (noOrders) noOrders.classList.add('hidden');
                tbody.innerHTML = orders.map(function (order) {
                    var statusClass = '';
                    var statusColors = {
                        'pending': 'yellow',
                        'processing': 'blue',
                        'shipping': 'purple',
                        'delivered': 'green'
                    };
                    statusClass = statusColors[order.status] || 'gray';

                    return '<tr class="table-row">' +
                        '<td class="px-6 py-4 font-medium">#' + order.id + '</td>' +
                        '<td class="px-6 py-4">' + (order.customer_name || 'Client') + '</td>' +
                        '<td class="px-6 py-4 font-bold text-cyan-600">' + formatPrice(order.total) + '</td>' +
                        '<td class="px-6 py-4">' +
                        '<select onchange="updateOrderStatus(' + order.id + ', this.value)" class="bg-' + statusClass + '-100 text-' + statusClass + '-700 px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer">' +
                        '<option value="pending" ' + (order.status === 'pending' ? 'selected' : '') + '>En attente</option>' +
                        '<option value="processing" ' + (order.status === 'processing' ? 'selected' : '') + '>En préparation</option>' +
                        '<option value="shipping" ' + (order.status === 'shipping' ? 'selected' : '') + '>En livraison</option>' +
                        '<option value="delivered" ' + (order.status === 'delivered' ? 'selected' : '') + '>Livré</option>' +
                        '</select>' +
                        '</td>' +
                        '<td class="px-6 py-4 text-gray-500">' + new Date(order.created_at).toLocaleDateString() + '</td>' +
                        '<td class="px-6 py-4">' +
                        '<div class="flex items-center justify-center gap-2">' +
                        '<button onclick="viewOrderDetails(' + order.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-eye"></i></button>' +
                        '<button onclick="deleteOrder(' + order.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button>' +
                        '</div>' +
                        '</td>' +
                        '</tr>';
                }).join('');
            }

            // Update dashboard stats after loading orders
            loadDashboard();
        }

        // Update order status via API
        async function updateOrderStatus(orderId, newStatus) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) throw new Error('Failed to update order');

                showToast('تم Actualiser État de la commande بنجاح', 'success');
                await loadOrders();
            } catch (error) {
                console.error('Error updating order status:', error);
                showToast('Une erreur est survenue: ' + error.message, 'error');
            }
        }

        // View order details from API - Enhanced to show products
        async function viewOrderDetails(orderId) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch order');

                const order = await response.json();

                // Build order details HTML with products
                let itemsHtml = '';

                if (order.items && order.items.length > 0) {
                    itemsHtml = order.items.map(item => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-pills text-cyan-600"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-800">${item.product_name || 'produit'}</p>
                                    <p class="text-sm text-gray-500">${formatPrice(item.price)} × ${item.quantity}</p>
                                </div>
                            </div>
                            <p class="font-bold text-cyan-600">${formatPrice(item.price * item.quantity)}</p>
                        </div>
                    `).join('');
                } else {
                    itemsHtml = '<p class="text-gray-500 text-center py-4">Aucun produitات في هذا الطلب</p>';
                }

                const orderDetailHtml = `
                    <!-- Order Info -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">N° commande</p>
                            <p class="font-bold text-lg">#${order.id}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">Statut</p>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipping' ? 'bg-purple-100 text-purple-700' : order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}">${getStatusText(order.status)}</span>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">Client</p>
                            <p class="font-medium">${order.customer_name || 'Client'}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">Date</p>
                            <p class="font-medium">${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">Téléphone</p>
                            <p class="font-medium">${order.customer_phone || '-'}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-sm text-gray-500">Adresse</p>
                            <p class="font-medium">${order.customer_address || '-'}</p>
                        </div>
                    </div>
                    
                    <!-- Products List -->
                    <div>
                        <h4 class="font-bold text-gray-800 mb-4">الproduitات</h4>
                        <div class="space-y-3">
                            ${itemsHtml}
                        </div>
                    </div>
                    
                    <!-- Total -->
                    <div class="border-t pt-4">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-lg">Total الكلي</span>
                            <span class="font-bold text-2xl text-cyan-600">${formatPrice(order.total)}</span>
                        </div>
                    </div>
                `;

                document.getElementById('order-detail-content').innerHTML = orderDetailHtml;
                document.getElementById('order-detail-modal').classList.add('active');

            } catch (error) {
                console.error('Error fetching order details:', error);
                showToast('Une erreur est survenue في جلب Détails de la commande', 'error');
            }
        }

        function closeOrderDetailModal() {
            document.getElementById('order-detail-modal').classList.remove('active');
        }

        // Filter orders from API
        async function filterOrders() {
            var search = document.getElementById('order-search').value.toLowerCase();
            var status = document.getElementById('order-status-filter').value;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch orders');

                var orders = await response.json();

                if (search) {
                    orders = orders.filter(function (o) {
                        return o.id.toString().includes(search) || (o.customer_name && o.customer_name.toLowerCase().includes(search));
                    });
                }

                if (status !== 'all') {
                    orders = orders.filter(function (o) { return o.status === status; });
                }

                renderOrdersTable(orders);
            } catch (error) {
                console.error('Error filtering orders:', error);
                renderOrdersTable([]);
            }
        }

        function resetOrderFilters() {
            document.getElementById('order-search').value = '';
            document.getElementById('order-status-filter').value = 'all';
            loadOrders();
        }

        // Refresh orders from API
        async function refreshOrders() {
            await loadOrders();
            showToast('تم Actualiser البيانات', 'success');
        }

        // Delete order via API
        async function deleteOrder(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/orders/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to delete order');

                showToast('تم Supprimer الطلب بنجاح', 'success');
                await loadOrders();
            } catch (error) {
                console.error('Error deleting order:', error);
                showToast('Une erreur est survenue: ' + error.message, 'error');
            }
        }

        // Load products - Fixed version that properly awaits async getProducts
        function loadProducts() {
            var tbody = document.getElementById('products-table-body');
            if (!tbody) return;

            // Call the async function and handle the result
            getProducts().then(function (products) {
                if (!Array.isArray(products)) {
                    products = [];
                }

                if (products.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Aucun produitات</td></tr>';
                    return;
                }

                tbody.innerHTML = products.map(function (p, i) {
                    return '<tr class="table-row"><td class="px-6 py-4">' + (i + 1) + '</td><td class="px-6 py-4"><img src="' + p.image + '" class="w-12 h-12 rounded-lg object-cover" alt=""></td><td class="px-6 py-4 font-medium">' + (p.name?.ar || p.name?.fr || '') + '</td><td class="px-6 py-4">' + getCategoryName(p.category) + '</td><td class="px-6 py-4"><span class="font-bold">' + formatPrice(p.price) + '</span></td><td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs ' + (p.stock > 20 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') + '">' + p.stock + '</span></td><td class="px-6 py-4"><div class="flex items-center justify-center gap-2"><button onclick="editProduct(' + p.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-edit"></i></button><button onclick="deleteProduct(' + p.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button></div></td></tr>';
                }).join('');
            }).catch(function (error) {
                console.error('Error loading products:', error);
                tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Une erreur est survenue في تحميل الproduitات</td></tr>';
            });
        }

        function filterProducts() {
            var search = document.getElementById('product-search').value.toLowerCase();
            var products = getProducts();

            var filtered = products;
            if (search) {
                filtered = products.filter(function (p) {
                    return (p.name?.ar && p.name.ar.toLowerCase().includes(search)) ||
                        (p.name?.fr && p.name.fr.toLowerCase().includes(search)) ||
                        (p.brand && p.brand.toLowerCase().includes(search));
                });
            }

            var tbody = document.getElementById('products-table-body');
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Aucun produitات</td></tr>';
            } else {
                tbody.innerHTML = filtered.map(function (p, i) {
                    return '<tr class="table-row"><td class="px-6 py-4">' + (i + 1) + '</td><td class="px-6 py-4"><img src="' + p.image + '" class="w-12 h-12 rounded-lg object-cover" alt=""></td><td class="px-6 py-4 font-medium">' + (p.name?.ar || p.name?.fr || '') + '</td><td class="px-6 py-4">' + getCategoryName(p.category) + '</td><td class="px-6 py-4">' + formatPrice(p.price) + '</td><td class="px-6 py-4">' + p.stock + '</td><td class="px-6 py-4"><div class="flex items-center justify-center gap-2"><button onclick="editProduct(' + p.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-edit"></i></button><button onclick="deleteProduct(' + p.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button></div></td></tr>';
                }).join('');
            }
        }

        function openProductModal(product) {
            document.getElementById('product-modal-title').textContent = product ? 'Modifier الproduit' : 'Ajouter produit جديد';
            document.getElementById('product-id').value = product?.id || '';
            document.getElementById('product-name-ar').value = product?.name?.ar || '';
            document.getElementById('product-name-fr').value = product?.name?.fr || '';
            document.getElementById('product-price').value = product?.price || '';
            document.getElementById('product-stock').value = product?.stock || '';
            document.getElementById('product-category').value = product?.category || 'medicines';
            document.getElementById('product-brand').value = product?.brand || '';
            document.getElementById('product-image').value = product?.image || '';
            document.getElementById('product-modal').classList.add('active');
        }

        function closeProductModal() {
            document.getElementById('product-modal').classList.remove('active');
            document.getElementById('product-form').reset();
        }

        // Save product - syncs with API
        async function saveProduct(e) {
            e.preventDefault();

            const name = document.getElementById('product-name-ar').value;
            const price = document.getElementById('product-price').value;
            const category_id = document.getElementById('product-category').value;
            const image = document.getElementById('product-image').value || '/images/product-placeholder.png';
            const description = document.getElementById('product-description')?.value || '';
            const id = document.getElementById('product-id').value;

            try {
                // Get fresh token directly from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    showToast('Veuillez تسجيل الدخول أولاً', 'error');
                    document.getElementById('login-modal').classList.add('active');
                    return;
                }

                let response;
                if (id) {
                    // Update existing product
                    response = await fetch(`/api/products/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            price: parseFloat(price),
                            category_id: parseInt(category_id),
                            image: image,
                            description: description
                        })
                    });
                } else {
                    // Create new product
                    response = await fetch('/api/products', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            price: parseFloat(price),
                            category_id: parseInt(category_id),
                            image: image,
                            description: description
                        })
                    });
                }

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        showToast("Vous n'avez pas la permission d'enregistrer", 'error');
                        return;
                    }
                    throw new Error('Request failed: ' + response.status);
                }

                // Clear local cache and reload
                localStorage.removeItem('kb_medic_products');
                await loadProducts();

                closeProductModal();
                showToast(id ? 'Produit mis à jour avec succès' : 'Produit ajouté avec succès', 'success');
            } catch (error) {
                showToast('Une erreur est survenue: ' + error.message, 'error');
            }
        }

        // Edit product - load data from API
        async function editProduct(id) {
            try {
                API.init();
                var products = await API.products.getProducts();
                if (!Array.isArray(products)) {
                    showToast('Une erreur est survenue في تحميل بيانات الproduit', 'error');
                    return;
                }

                var product = products.find(function (p) { return p.id === id; });
                if (product) {
                    document.getElementById('product-modal-title').textContent = 'Modifier الproduit';
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name-ar').value = product.name || '';
                    document.getElementById('product-name-fr').value = product.name || '';
                    document.getElementById('product-price').value = product.price || '';
                    document.getElementById('product-stock').value = product.stock || 50;
                    document.getElementById('product-category').value = product.category_id || '1';
                    document.getElementById('product-brand').value = product.brand || '';
                    document.getElementById('product-image').value = product.image || '';
                    document.getElementById('product-modal').classList.add('active');
                }
            } catch (error) {
                console.error('Error loading product:', error);
                showToast('Une erreur est survenue في تحميل بيانات الproduit', 'error');
            }
        }

        // Delete product - syncs with API
        async function deleteProduct(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

            try {
                // Initialize API with current token - read fresh from localStorage
                var token = localStorage.getItem('token');
                if (!token) {
                    showToast('Veuillez تسجيل الدخول أولاً', 'error');
                    document.getElementById('login-modal').classList.add('active');
                    return;
                }

                // Direct API call with fresh token
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        showToast('ليس لديك صلاحية للSupprimer', 'error');
                        return;
                    }
                    throw new Error('Request failed: ' + response.status);
                }

                // Clear local cache and reload
                localStorage.removeItem('kb_medic_products');
                await loadProducts();

                showToast('تم Supprimer الproduit بنجاح', 'success');
            } catch (error) {
                console.error('Delete product error:', error);
                showToast('Une erreur est survenue: ' + error.message, 'error');
            }
        }

        // Load categories from API (Neon Database)
        async function loadCategories() {
            try {
                API.init();
                var categories = await API.categories.getCategories();

                // Ensure categories is an array
                if (!Array.isArray(categories)) {
                    categories = [];
                }

                // Map API data to expected format
                var iconMap = {
                    'أدوية الألم': 'fa-pills',
                    'Vitamines': 'fa-capsules',
                    'Soins de la peau': 'fa-spa',
                    'أجهزة طبية': 'fa-heartbeat',
                    'مستلزمات الأطفال': 'fa-baby',
                    'العناية الشخصية': 'fa-hand-sparkles'
                };
                var colorMap = {
                    'أدوية الألم': '#0e7490',
                    'Vitamines': '#f59e0b',
                    'Soins de la peau': '#ec4899',
                    'أجهزة طبية': '#10b981',
                    'مستلزمات الأطفال': '#3b82f6',
                    'العناية الشخصية': '#8b5cf6'
                };

                var formattedCategories = categories.map(function (cat) {
                    var iconName = cat.icon || iconMap[cat.name] || 'fa-pills';
                    var color = colorMap[cat.name] || '#0e7490';

                    // If icon is an emoji, convert to font-awesome class
                    if (iconName && iconName.length === 2) {
                        iconName = 'fa-pills'; // Default icon
                    }

                    return {
                        id: cat.id,
                        name: cat.name,
                        icon: iconName,
                        color: color
                    };
                });

                var grid = document.getElementById('categories-grid');
                if (!grid) return;

                if (formattedCategories.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Aucun فئات</div>';
                    return;
                }

                grid.innerHTML = formattedCategories.map(function (cat) {
                    return '<div class="bg-white rounded-2xl shadow-sm p-6">' +
                        '<div class="flex items-start justify-between mb-4">' +
                        '<div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:' + cat.color + '20">' +
                        '<i class="fas ' + cat.icon + ' text-xl" style="color:' + cat.color + '"></i>' +
                        '</div>' +
                        '<div class="flex gap-2">' +
                        '<button onclick="editCategory(' + cat.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="deleteCategory(' + cat.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button>' +
                        '</div>' +
                        '</div>' +
                        '<h4 class="font-bold text-gray-800 mb-1">' + cat.name + '</h4>' +
                        '<p class="text-sm text-gray-500">فئة متجر</p>' +
                        '</div>';
                }).join('');
            } catch (error) {
                console.error('Error loading categories:', error);
                var grid = document.getElementById('categories-grid');
                if (grid) {
                    grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Une erreur est survenue في تحميل Catégories</div>';
                }
            }
        }

        // Edit category
        async function editCategory(id) {
            try {
                API.init();
                var categories = await API.categories.getCategories();
                if (!Array.isArray(categories)) return;

                var cat = categories.find(function (c) { return c.id === id; });
                if (!cat) return;

                var newName = prompt('أدخل Nom الجديد للفئة:', cat.name);
                if (newName && newName.trim()) {
                    await API.categories.updateCategory(id, { name: newName.trim() });
                    await loadCategories();
                    showToast('تم Modifier Catégorie بنجاح', 'success');
                }
            } catch (error) {
                console.error('Error editing category:', error);
                showToast('Une erreur est survenue في Modifier Catégorie', 'error');
            }
        }

        // Delete category
        async function deleteCategory(id) {
            if (!confirm('Êtes-vous sûr من Supprimer هذه Catégorie؟')) return;

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    showToast('Veuillez تسجيل الدخول أولاً', 'error');
                    return;
                }

                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        showToast('ليس لديك صلاحية للSupprimer', 'error');
                        return;
                    }
                    throw new Error('Request failed');
                }

                await loadCategories();
                showToast('تم Supprimer Catégorie بنجاح', 'success');
            } catch (error) {
                console.error('Error deleting category:', error);
                showToast('Une erreur est survenue في Supprimer Catégorie', 'error');
            }
        }

        // Add new category
        async function addCategory() {
            var name = prompt('أدخل اسم Catégorie الجديدة:');
            if (name && name.trim()) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        showToast('Veuillez تسجيل الدخول أولاً', 'error');
                        return;
                    }

                    const response = await fetch('/api/categories', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: name.trim() })
                    });

                    if (!response.ok) {
                        if (response.status === 403) {
                            showToast('ليس لديك صلاحية للAjouter', 'error');
                            return;
                        }
                        throw new Error('Request failed');
                    }

                    await loadCategories();
                    showToast('تم Ajouter Catégorie بنجاح', 'success');
                } catch (error) {
                    console.error('Error adding category:', error);
                    showToast('Une erreur est survenue في Ajouter Catégorie', 'error');
                }
            }
        }

        // Load customers from API
        async function loadCustomers() {
            try {
                // Initialize API with current token
                API.init();

                var users = await API.users.getUsers();
                var orders = await API.orders.getOrders();

                // Ensure arrays
                if (!Array.isArray(users)) users = [];
                if (!Array.isArray(orders)) orders = [];

                var tbody = document.getElementById('customers-table-body');
                if (!tbody) return;

                tbody.innerHTML = users.map(function (u, i) {
                    // Calculate total sales for this customer
                    var userOrders = orders.filter(function (o) { return o.user_id === u.id; });
                    var totalSales = userOrders.reduce(function (sum, o) { return sum + (parseFloat(o.total) || 0); }, 0);

                    return '<tr class="table-row">' +
                        '<td class="px-6 py-4">' + (i + 1) + '</td>' +
                        '<td class="px-6 py-4 font-medium">' + u.name + '</td>' +
                        '<td class="px-6 py-4">' + u.email + '</td>' +
                        '<td class="px-6 py-4">' + (u.phone || '-') + '</td>' +
                        '<td class="px-6 py-4 font-bold text-cyan-600">' + formatPrice(totalSales) + '</td>' +
                        '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-medium">' + (u.role === 'admin' ? 'أدمن' : 'Client') + '</span></td>' +
                        '<td class="px-6 py-4">' +
                        '<div class="flex items-center justify-center gap-2">' +
                        '<button onclick="viewCustomer(' + u.id + ')" class="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center hover:bg-cyan-200 transition"><i class="fas fa-eye"></i></button>' +
                        (u.role !== 'admin' ? '<button onclick="deleteCustomer(' + u.id + ')" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition"><i class="fas fa-trash"></i></button>' : '') +
                        '</div>' +
                        '</td>' +
                        '</tr>';
                }).join('');
            } catch (error) {
                console.warn('Error loading customers from API, showing empty state:', error.message);
                var tbody = document.getElementById('customers-table-body');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Veuillez تسجيل الدخول لVoir Clients</td></tr>';
                }
            }
        }

        // View customer details
        async function viewCustomer(id) {
            try {
                const users = await API.users.getUsers();
                const orders = await API.orders.getOrders();
                var user = users.find(function (u) { return u.id === id; });

                if (!user) {
                    showToast('Client introuvable', 'error');
                    return;
                }

                var userOrders = orders.filter(function (o) { return o.user_id === id; });
                var totalSales = userOrders.reduce(function (sum, o) { return sum + (parseFloat(o.total) || 0); }, 0);

                // Show in modal instead of alert
                document.getElementById('customer-detail-name').textContent = user.name;
                document.getElementById('customer-detail-email').textContent = user.email;
                document.getElementById('customer-detail-phone').textContent = user.phone || '-';
                document.getElementById('customer-detail-orders').textContent = userOrders.length;
                document.getElementById('customer-detail-total').textContent = formatPrice(totalSales);
                document.getElementById('customer-detail-role').textContent = user.role === 'admin' ? 'مسؤول' : 'Client';

                document.getElementById('customer-modal').classList.add('active');
            } catch (error) {
                showToast('Une erreur est survenue', 'error');
            }
        }

        // Delete customer
        async function deleteCustomer(id) {
            if (!confirm('Êtes-vous sûr من Supprimer هذا Client؟')) return;

            try {
                await API.users.deleteUser(id);
                await loadCustomers();
                showToast('تم Supprimer Client بنجاح', 'success');
            } catch (error) {
                showToast('Une erreur est survenue: ' + error.message, 'error');
            }
        }

        // Load messages
        function loadMessages() {
            var messages = safeParse('messages', [
                { id: 1, name: 'أحمد محمد', email: 'ahmed@test.com', message: 'السلام عليكم، أريد الاستفسار عن توصيل الproduitات', date: new Date().toISOString(), read: false },
                { id: 2, name: 'سارة علي', email: 'sara@test.com', message: 'ما هي أوقات العمل لديكم؟', date: new Date().toISOString(), read: true }
            ]);

            var list = document.getElementById('messages-list');
            list.innerHTML = messages.map(function (msg) {
                return '<div onclick="showMessage(' + msg.id + ')" class="p-4 hover:bg-gray-50 cursor-pointer transition ' + (!msg.read ? 'bg-blue-50' : '') + '"><div class="flex items-start gap-3"><div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-user text-cyan-600"></i></div><div class="flex-1 min-w-0"><div class="flex items-center justify-between"><p class="font-medium text-gray-800">' + msg.name + '</p><span class="text-xs text-gray-400">' + new Date(msg.date).toLocaleDateString() + '</span></div><p class="text-sm text-gray-600 truncate">' + msg.message + '</p></div></div></div>';
            }).join('');
        }

        function showMessage(id) {
            var messages = safeParse('messages', []);
            var msg = messages.find(function (m) { return m.id === id; });
            if (!msg) return;

            msg.read = true;
            localStorage.setItem('messages', JSON.stringify(messages));

            document.getElementById('message-sender').textContent = msg.name;
            document.getElementById('message-email').textContent = msg.email;
            document.getElementById('message-date').textContent = new Date(msg.date).toLocaleDateString();
            document.getElementById('message-content').textContent = msg.message;

            document.getElementById('no-message-selected').classList.add('hidden');
            document.getElementById('message-detail').classList.remove('hidden');

            loadMessages();
        }

        function replyToMessage(e) {
            e.preventDefault();
            var reply = document.getElementById('reply-content').value;
            if (reply.trim()) {
                showToast('تم إرسال الرد بنجاح', 'success');
                document.getElementById('reply-content').value = '';
            }
        }

        function deleteMessage() {
            showToast('تم Supprimer الرسالة', 'success');
            document.getElementById('message-detail').classList.add('hidden');
            document.getElementById('no-message-selected').classList.remove('hidden');
        }

        // Load settings
        function loadSettings() {
            var settings = safeParse('settings', {
                storeName: 'KB-Medic',
                email: 'admin@kb-medic.com',
                phone: '+213 555 123 456',
                codEnabled: true,
                deliveryFee: 300
            });

            // Update form fields
            var storeName = document.getElementById('setting-store-name');
            var email = document.getElementById('setting-email');
            var phone = document.getElementById('setting-phone');
            var cod = document.getElementById('setting-cod');
            var deliveryFee = document.getElementById('setting-delivery-fee');

            if (storeName) storeName.value = settings.storeName || '';
            if (email) email.value = settings.email || '';
            if (phone) phone.value = settings.phone || '';
            if (cod) cod.checked = settings.codEnabled !== false;
            if (deliveryFee) deliveryFee.value = settings.deliveryFee || 0;
        }

        function saveSettings(e) {
            e.preventDefault();

            var settings = {
                storeName: document.getElementById('setting-store-name').value,
                email: document.getElementById('setting-email').value,
                phone: document.getElementById('setting-phone').value,
                codEnabled: document.getElementById('setting-cod').checked,
                deliveryFee: parseInt(document.getElementById('setting-delivery-fee').value) || 0
            };

            localStorage.setItem('settings', JSON.stringify(settings));
            showToast('تم Enregistrer Paramètres بنجاح', 'success');
        }

        // Utility functions
        function formatPrice(price) {
            return (price || 0).toLocaleString() + ' دج';
        }

        function getStatusColor(status) {
            var colors = {
                pending: 'yellow',
                processing: 'blue',
                shipping: 'purple',
                delivered: 'green'
            };
            return colors[status] || 'gray';
        }

        function getStatusText(status) {
            var texts = {
                pending: 'En attente',
                processing: 'En préparation',
                shipping: 'En livraison',
                delivered: 'Livré'
            };
            return texts[status] || status;
        }

        function getCategoryName(category) {
            var names = {
                medicines: 'Médicaments',
                vitamins: 'Vitamines',
                skincare: 'Soins de la peau',
                baby: 'Produits bébé',
                equipment: 'Équipements médicaux',
                hygiene: 'Hygiène'
            };
            return names[category] || category;
        }

        function exportData() {
            var data = {
                orders: safeParse('orders', []),
                products: getProducts(),
                users: safeParse('users', [])
            };

            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'kb-medic-export-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('تم Exporter البيانات بنجاح', 'success');
        }

        function showToast(message, type) {
            var container = document.getElementById('toast-container');
            var colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500'
            };

            var toast = document.createElement('div');
            toast.className = 'toast ' + colors[type] + ' text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3';
            var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
            toast.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span>';
            container.appendChild(toast);
            setTimeout(function () { toast.remove(); }, 3000);
        }
    