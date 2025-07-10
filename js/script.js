const API_URL = 'http://localhost:3000/products';

// Get all fields
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const productIdField = document.getElementById('productId');
const nameField = document.getElementById('name');
const priceField = document.getElementById('price');
const stockField = document.getElementById('stock');
const categoryField = document.getElementById('category');
const descriptionField = document.getElementById('description');
const formTitle = document.getElementById('formTitle');
const submitButtonText = document.getElementById('submitButtonText');
const cancelEditButton = document.getElementById('cancelEdit');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
     }`;
    toast.style.transform = 'translateX(0)';

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
    }, 3000);
}


// Fetch and display products
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        const products = await res.json();

         // Update product count in navbar
         updateProductCount(products.length);

        if (products.length === 0) {
            emptyState.classList.remove('hidden');
            productList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            productList.classList.remove('hidden');
            showToast('Products loaded successfully', 'success');
        }

        productList.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-100';
            productCard.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-800 truncate">${product.name}</h3>
                        <span class="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                        $${parseFloat(product.price).toFixed(2)}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">${product.description}</p>
                    <div class="flex gap-2">
                        <button class="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit mr-2"></i>Edit
                        </button>
                        <button class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);

        });

    } catch (error) {
        console.log("Failed to fetch products", error);
        showToast('Failed to fetch products', 'error');
    }
}

// Create or Update product
productForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const product = {
        name: nameField.value,
        price: parseFloat(priceField.value),
        description: descriptionField.value,
        stock: parseInt(stockField.value),
        category: categoryField.value,
    }

    try {
        const id = productIdField.value;
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            showToast('Product updated successfully!');
        } else {
            // create a new
            const res = await fetch(API_URL);
            const products = await res.json();
            const lastProduct = products[products.length - 1];
            product.id = parseInt(lastProduct.id) + 1;
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            showToast('Product created successfully!');
        }

        resetToAddMode();
        fetchProducts();
    } catch (error) {
        console.log(error);

        showToast('Failed to save product', 'error');
    }
});

// Reset form to add mode
function resetToAddMode() {
    productForm.reset();
    productIdField.value = '';
    formTitle.textContent = 'Add New Product';
    submitButtonText.textContent = 'Save Product';
    cancelEditButton.classList.add('hidden');
}

// Patch Edit form
async function editProduct(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const product = await res.json();

        productIdField.value = product.id;
        nameField.value = product.name;
        priceField.value = product.price;
        stockField.value = product.stock;
        categoryField.value = product.category;
        descriptionField.value = product.description;

        formTitle.textContent = 'Edit Product';
        submitButtonText.textContent = 'Update Product';
        cancelEditButton.classList.remove('hidden');

        // Scroll to form
        productForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showToast('Failed to load product for editing', 'error');
    }
}

// Delete product
async function deleteProduct(id) {
  console.log("Delete product "+id);
  
  if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      showToast('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  }
}

// intialize
fetchProducts();


// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const productCount = document.getElementById('productCount');

mobileMenuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  const icon = mobileMenuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

// Update product count in navbar
function updateProductCount(count) {
  productCount.textContent = count;
}

// Smooth scroll for navigation links
document.addEventListener('click', (e) => {
  if (e.target.closest('a[href^="#"]')) {
    e.preventDefault();
    const targetId = e.target.closest('a').getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});