import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import categoryElectronics from "./assets/category-electronics.svg";
import categoryFashion from "./assets/category-fashion.svg";
import categoryMobile from "./assets/category-mobile.svg";
import categoryMore from "./assets/category-more.svg";
import heroGadgets from "./assets/hero-gadgets.svg";
import fallbackProducts from "./data/products";
import "./App.css";

const defaultApiBaseUrl = import.meta.env.PROD
  ? "https://codealphatask1-ecommerce--website-store-1.onrender.com/api"
  : "http://localhost:5000/api";

const normalizeApiBaseUrl = (url) => {
  const cleanedUrl = String(url || defaultApiBaseUrl).replace(/\/+$/, "");

  return cleanedUrl.endsWith("/api") ? cleanedUrl : `${cleanedUrl}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const categories = [
  {
    id: "Mobiles",
    label: "Mobiles",
    offer: "Up to 40% Off",
    image: categoryMobile,
  },
  {
    id: "Fashion",
    label: "Fashion",
    offer: "Up to 60% Off",
    image: categoryFashion,
  },
  {
    id: "Electronics",
    label: "Electronics",
    offer: "Up to 49% Off",
    image: categoryElectronics,
  },
  {
    id: "All",
    label: "More Products",
    offer: "Explore more",
    image: categoryMore,
  },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

const initialAuth = {
  name: "",
  email: "",
  password: "",
};

const initialPasswordResetForm = {
  email: "",
  resetCode: "",
  password: "",
};

const initialCheckoutForm = {
  fullName: "",
  phone: "",
  pincode: "",
  address: "",
  city: "",
  state: "",
  paymentMethod: "Cash on Delivery",
};

const ONLINE_PAYMENT_METHODS = ["Online Payment", "UPI", "Card", "Netbanking", "Wallet"];

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PRODUCT_CACHE_KEY = "easymart-products-cache";

function getSavedUser() {
  const raw = localStorage.getItem("easymart-user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getSavedToken() {
  return localStorage.getItem("easymart-token");
}

function getInitialProducts() {
  const raw = localStorage.getItem(PRODUCT_CACHE_KEY);

  if (!raw) return fallbackProducts;

  try {
    const savedProducts = JSON.parse(raw);
    return Array.isArray(savedProducts) && savedProducts.length
      ? savedProducts
      : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDisplayOrderStatus(order) {
  if (order?.displayStatus) {
    return order.displayStatus;
  }

  if (!order?.estimatedDelivery) {
    return order?.orderStatus || "Processing";
  }

  const deliveryDate = new Date(order.estimatedDelivery);

  if (Number.isNaN(deliveryDate.getTime())) {
    return order?.orderStatus || "Processing";
  }

  if (deliveryDate <= new Date()) {
    return "Delivered";
  }

  return order?.orderStatus || "Processing";
}

function getOrderProgress(order) {
  const createdAt = new Date(order?.createdAt);
  const deliveredAt = new Date(order?.estimatedDelivery);

  if (Number.isNaN(createdAt.getTime()) || Number.isNaN(deliveredAt.getTime())) {
    return 1;
  }

  if (deliveredAt <= createdAt) {
    return getDisplayOrderStatus(order) === "Delivered" ? 5 : 1;
  }

  const progress = (Date.now() - createdAt.getTime()) / (deliveredAt.getTime() - createdAt.getTime());
  return Math.min(5, Math.max(1, Math.floor(progress * 5) + 1));
}

const deliverySteps = [
  "Order placed",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "alokuc123@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const socialLinks = [
  { label: "Website", icon: "W", url: "https://www.alokucmart.store" },
  { label: "Facebook", icon: "F", url: "https://www.facebook.com" },
  { label: "Instagram", icon: "I", url: "https://www.instagram.com" },
  { label: "LinkedIn", icon: "L", url: "https://www.linkedin.com/feed/" },
  { label: "X", icon: "X", url: "https://x.com" },
  { label: "YouTube", icon: "Y", url: "https://www.youtube.com" },
];

export default function App() {
  const [products, setProducts] = useState(() => getInitialProducts());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState(initialAuth);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState(initialPasswordResetForm);
  const [visibleResetCode, setVisibleResetCode] = useState("");
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [checkoutContext, setCheckoutContext] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());
  const [token, setToken] = useState(() => getSavedToken());
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [canManageOrders, setCanManageOrders] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [recentOrder, setRecentOrder] = useState(null);
  const [activeFooterTab, setActiveFooterTab] = useState("about");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [showAdminMessagesModal, setShowAdminMessagesModal] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactStats, setContactStats] = useState({
    totalMessages: 0,
    todayMessages: 0,
    emailMessages: 0,
  });
  const [contactMessagesLoading, setContactMessagesLoading] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setCheckoutForm((current) => ({
      ...current,
      fullName: current.fullName || currentUser?.name || "",
    }));
  }, [currentUser]);

  useEffect(() => {
    const existingScript = document.getElementById("razorpay-checkout-script");

    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(products.length === 0);
        const response = await api.get("/products");
        const nextProducts = response.data.products || [];

        if (nextProducts.length) {
          setProducts(nextProducts);
          localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(nextProducts));
        }
      } catch (error) {
        if (!products.length) {
          setToast(
            error.response?.data?.message ||
              "Products load nahi hue. Backend server check karo.",
          );
        }
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!token) {
      setCartItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        setCartLoading(true);
        const response = await api.get("/cart", {
          headers: getAuthHeaders(token),
        });
        setCartItems(response.data.cart?.products || []);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("easymart-token");
          localStorage.removeItem("easymart-user");
          setToken("");
          setCurrentUser(null);
        }
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const filteredProducts = useMemo(() => {
    if (!token) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nextProducts = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.category, product.tagline]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    const sortedProducts = [...nextProducts];

    if (sortBy === "price-low") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    return sortedProducts;
  }, [activeCategory, products, searchTerm, sortBy, token]);

  const featuredProduct = token ? filteredProducts[0] ?? products[0] : null;
  const totalSavings = filteredProducts.reduce(
    (sum, product) => sum + ((product.originalPrice || product.price) - product.price),
    0,
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const isAdminUser = adminEmails.includes(String(currentUser?.email || "").toLowerCase());

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handlePasswordResetFieldChange = (field, value) => {
    setPasswordResetForm((current) => ({ ...current, [field]: value }));
  };

  const openAuthModal = (mode) => {
    setIsRegistering(mode === "register");
    setShowForgotPassword(false);
    setPasswordResetForm(initialPasswordResetForm);
    setVisibleResetCode("");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthForm(initialAuth);
    setShowForgotPassword(false);
    setPasswordResetForm(initialPasswordResetForm);
    setVisibleResetCode("");
  };

  const closeAccountModal = () => {
    setShowAccountModal(false);
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCheckoutContext(null);
  };

  const closeOrderSuccessModal = () => {
    setShowOrderSuccessModal(false);
    setRecentOrder(null);
  };

  const showOrderSuccess = (order) => {
    setRecentOrder(order || null);

    // Open the success modal on the next tick so it doesn't get swallowed
    // by the same click cycle that closes the checkout modal.
    window.setTimeout(() => {
      setShowOrderSuccessModal(true);
    }, 0);
  };

  const requireLogin = () => {
    if (token) return true;
    openAuthModal("login");
    setToast("Pehle login karo.");
    return false;
  };

  const persistSession = (user, nextToken) => {
    localStorage.setItem("easymart-user", JSON.stringify(user));
    localStorage.setItem("easymart-token", nextToken);
    setCurrentUser(user);
    setToken(nextToken);
  };

  const handleRegister = async () => {
    const { name, email, password } = authForm;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setToast("Fill all registration fields.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      persistSession(response.data.user, response.data.token);
      closeAuthModal();
      setToast("Account created successfully.");
    } catch (error) {
      setToast(error.response?.data?.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;

    if (!email || !password) {
      setToast("Email and password are required.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await api.post("/auth/login", { email, password });

      persistSession(response.data.user, response.data.token);
      closeAuthModal();
      setToast(`Welcome back, ${response.data.user.name}.`);
      await refreshOrders(response.data.token);
    } catch (error) {
      setToast(error.response?.data?.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("easymart-user");
    localStorage.removeItem("easymart-token");
    setCurrentUser(null);
    setToken("");
    setCartItems([]);
    setShowCartModal(false);
    setShowAccountModal(false);
    closeCheckoutModal();
    setToast("Signed out.");
  };

  const handleForgotPassword = async () => {
    const email = passwordResetForm.email.trim().toLowerCase();

    if (!email) {
      setToast("Reset ke liye email address daalo.");
      return;
    }

    try {
      setAuthLoading(true);
      const response = await api.post("/auth/forgot-password", { email });
      const resetCode = response.data.resetCode || "";

      setVisibleResetCode(resetCode);
      setPasswordResetForm((current) => ({
        ...current,
        email,
        resetCode,
      }));
      setToast("Reset code generate ho gaya.");
    } catch (error) {
      setToast(error.response?.data?.message || "Reset code generate nahi hua.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = passwordResetForm.email.trim().toLowerCase();
    const resetCode = passwordResetForm.resetCode.trim();
    const password = passwordResetForm.password;

    if (!email || !resetCode || !password) {
      setToast("Email, reset code aur new password fill karo.");
      return;
    }

    try {
      setAuthLoading(true);
      await api.post("/auth/reset-password", {
        email,
        resetCode,
        password,
      });

      setShowForgotPassword(false);
      setIsRegistering(false);
      setAuthForm({ ...initialAuth, email });
      setPasswordResetForm(initialPasswordResetForm);
      setVisibleResetCode("");
      setToast("Password reset ho gaya. Ab login karo.");
    } catch (error) {
      setToast(error.response?.data?.message || "Password reset nahi hua.");
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshCart = async (nextToken = token) => {
    if (!nextToken) return;

    const response = await api.get("/cart", {
      headers: getAuthHeaders(nextToken),
    });
    setCartItems(response.data.cart?.products || []);
  };

  const refreshOrders = async (nextToken = token) => {
    if (!nextToken) {
      setOrders([]);
      return;
    }

    try {
      setOrdersLoading(true);
      const response = await api.get("/orders", {
        headers: getAuthHeaders(nextToken),
      });
      setOrders(response.data.orders || []);
      setCanManageOrders(Boolean(response.data.canManageOrders));
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("easymart-token");
        localStorage.removeItem("easymart-user");
        setToken("");
        setCurrentUser(null);
        setOrders([]);
        return;
      }

      setToast(error.response?.data?.message || "Orders load nahi hue.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleRemoveDeliveredOrder = async (orderId) => {
    try {
      setOrdersLoading(true);
      const response = await api.delete(`/orders/${orderId}`, {
        headers: getAuthHeaders(token),
      });

      setOrders(response.data.orders || []);
      setCanManageOrders(Boolean(response.data.canManageOrders));
      setToast("Delivered order remove ho gaya.");
    } catch (error) {
      setToast(error.response?.data?.message || "Delivered order remove nahi hua.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleContactMessageSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phone: String(formData.get("phone") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.subject || !payload.message) {
      setToast("Contact form ke sab fields fill karo.");
      return;
    }

    try {
      setContactSubmitting(true);
      await api.post("/contact", payload);
      form.reset();
      setToast("Message admin ke paas pahunch gaya.");
    } catch (error) {
      setToast(error.response?.data?.message || "Message send nahi hua.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const refreshContactMessages = async (nextToken = token) => {
    if (!nextToken || !isAdminUser) return;

    try {
      setContactMessagesLoading(true);
      const response = await api.get("/contact/messages", {
        headers: getAuthHeaders(nextToken),
      });
      setContactMessages(response.data.messages || []);
      setContactStats(
        response.data.stats || {
          totalMessages: 0,
          todayMessages: 0,
          emailMessages: 0,
        },
      );
    } catch (error) {
      setToast(error.response?.data?.message || "Contact messages load nahi hue.");
    } finally {
      setContactMessagesLoading(false);
    }
  };

  const handleRemoveContactMessage = async (messageId) => {
    try {
      setContactMessagesLoading(true);
      const response = await api.delete(`/contact/messages/${messageId}`, {
        headers: getAuthHeaders(token),
      });
      setContactMessages(response.data.messages || []);
      setContactStats(
        response.data.stats || {
          totalMessages: 0,
          todayMessages: 0,
          emailMessages: 0,
        },
      );
      setToast("Problem solved message remove ho gaya.");
    } catch (error) {
      setToast(error.response?.data?.message || "Message remove nahi hua.");
    } finally {
      setContactMessagesLoading(false);
    }
  };

  const openAdminMessages = async () => {
    if (!requireLogin()) return;

    if (!isAdminUser) {
      setToast("Admin panel sirf admin ke liye hai.");
      return;
    }

    setShowAdminMessagesModal(true);
    await refreshContactMessages();
  };

  const handleAddToCart = async (product) => {
    if (!requireLogin()) return;

    try {
      setCartLoading(true);
      const response = await api.post(
        "/cart/add",
        { productId: product._id, quantity: 1 },
        { headers: getAuthHeaders(token) },
      );
      setCartItems(response.data.cart?.products || []);
      setToast(`${product.name} added to cart.`);
    } catch (error) {
      setToast(error.response?.data?.message || "Cart update failed.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      setCartLoading(true);
      const response = await api.post(
        "/cart/remove",
        { productId },
        { headers: getAuthHeaders(token) },
      );
      setCartItems(response.data.cart?.products || []);
    } catch (error) {
      setToast(error.response?.data?.message || "Product remove nahi hua.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setCartLoading(true);
      const response = await api.put(
        "/cart/quantity",
        { productId, quantity },
        { headers: getAuthHeaders(token) },
      );
      setCartItems(response.data.cart?.products || []);
    } catch (error) {
      setToast(error.response?.data?.message || "Quantity update nahi hua.");
    } finally {
      setCartLoading(false);
    }
  };

  const openCheckout = (context) => {
    if (!requireLogin()) return;
    setCheckoutContext(context);
    setShowCheckoutModal(true);
  };

  const handleCheckoutFieldChange = (field, value) => {
    setCheckoutForm((current) => ({ ...current, [field]: value }));
  };

  const validateCheckoutForm = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "pincode",
      "address",
      "city",
      "state",
      "paymentMethod",
    ];

    for (const field of requiredFields) {
      if (!String(checkoutForm[field] || "").trim()) {
        return `${field} is required`;
      }
    }

    if (!/^\d{10}$/.test(String(checkoutForm.phone).trim())) {
      return "Phone must be 10 digits";
    }

    if (!/^\d{6}$/.test(String(checkoutForm.pincode).trim())) {
      return "Pincode must be 6 digits";
    }

    return "";
  };

  const placeCartOrder = async (
    paymentDetails = null,
    shippingDetailsOverride = null,
    tokenOverride = null,
  ) => {
    const activeToken = tokenOverride || token;

    if (!activeToken) {
      openAuthModal("login");
      setToast("Session expire ho gayi. Dobara login karo.");
      return;
    }

    try {
      setPurchaseLoading(true);
      const shippingDetails = shippingDetailsOverride || {
        ...checkoutForm,
        paymentDetails,
      };

      const response = await api.post(
        "/cart/checkout",
        { shippingDetails },
        { headers: getAuthHeaders(activeToken) },
      );
      setCartItems([]);
      setShowCartModal(false);
      closeCheckoutModal();
      showOrderSuccess(response.data.order);
      await refreshOrders();
      setToast(
        `Order placed. Total Rs. ${response.data.order.totalAmount.toLocaleString("en-IN")}`,
      );
    } catch (error) {
      setToast(error.response?.data?.message || "Checkout failed.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const placeBuyNowOrder = async (
    product,
    paymentDetails = null,
    shippingDetailsOverride = null,
    tokenOverride = null,
  ) => {
    const activeToken = tokenOverride || token;

    if (!activeToken) {
      openAuthModal("login");
      setToast("Session expire ho gayi. Dobara login karo.");
      return;
    }

    try {
      setPurchaseLoading(true);
      const shippingDetails = shippingDetailsOverride || {
        ...checkoutForm,
        paymentDetails,
      };

      const response = await api.post(
        "/cart/buy-now",
        {
          productId: product._id,
          quantity: 1,
          shippingDetails,
        },
        { headers: getAuthHeaders(activeToken) },
      );
      setSelectedProduct(null);
      closeCheckoutModal();
      showOrderSuccess(response.data.order);
      setToast(
        `${product.name} ordered. Total Rs. ${response.data.order.totalAmount.toLocaleString("en-IN")}`,
      );
      await refreshCart();
      await refreshOrders();
    } catch (error) {
      setToast(error.response?.data?.message || "Buy now failed.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const openRazorpayCheckout = async () => {
    if (!window.Razorpay) {
      setToast("Razorpay load nahi hua. Page refresh karke try karo.");
      return;
    }

    const currentCheckoutContext = checkoutContext;
    const currentCheckoutForm = { ...checkoutForm };
    const currentToken = token;
    const amount =
      currentCheckoutContext?.type === "cart"
        ? cartTotal
        : currentCheckoutContext?.product?.price || 0;

    if (!amount) {
      setToast("Payment amount missing hai.");
      return;
    }

    try {
      setPurchaseLoading(true);
      const response = await api.post("/payment/create-order", {
        amount,
        productId: currentCheckoutContext?.product?._id,
        productName:
          currentCheckoutContext?.type === "cart"
            ? "EasyMart Cart Checkout"
            : currentCheckoutContext?.product?.name,
      });

      const data = response.data;

      if (!data.success) {
        setToast(data.message || "Payment order create nahi hua.");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "EasyMart",
        description:
          currentCheckoutContext?.type === "cart"
            ? "Cart checkout"
            : currentCheckoutContext?.product?.name || "Product checkout",
        order_id: data.order_id,
        handler: async function (paymentResponse) {
          const paymentDetails = {
            provider: "Razorpay",
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature,
            status: "paid",
          };
          const shippingDetails = {
            ...currentCheckoutForm,
            paymentDetails,
          };

          if (currentCheckoutContext?.type === "cart") {
            await placeCartOrder(paymentDetails, shippingDetails, currentToken);
            return;
          }

          if (currentCheckoutContext?.type === "buy-now" && currentCheckoutContext.product) {
            await placeBuyNowOrder(
              currentCheckoutContext.product,
              paymentDetails,
              shippingDetails,
              currentToken,
            );
          }
        },
        prefill: {
          name: currentCheckoutForm.fullName || currentUser?.name || "EasyMart User",
          email: currentUser?.email || "test@example.com",
          contact: currentCheckoutForm.phone || "9999999999",
        },
        readonly: {
          name: true,
          email: true,
          contact: true,
        },
        notes: {
          paymentMethod: currentCheckoutForm.paymentMethod,
        },
        config: {
          display: {
            blocks: {
              cards: {
                name: "Cards",
                instruments: [{ method: "card" }],
              },
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
              netbanking: {
                name: "Netbanking",
                instruments: [{ method: "netbanking" }],
              },
              wallet: {
                name: "Wallet",
                instruments: [{ method: "wallet" }],
              },
            },
            sequence: ["block.cards", "block.upi", "block.netbanking", "block.wallet"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#1f3b5b",
        },
        modal: {
          ondismiss: function () {
            setToast("Payment popup band kar diya gaya.");
          },
        },
      };

      if (currentCheckoutForm.paymentMethod === "UPI" && data.isTestMode) {
        setToast(
          "Razorpay test mode detect hua hai. Real UPI app se QR scan fail ho sakta hai. Live key use karo ya test UPI flow se verify karo.",
        );
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (paymentError) => {
        const failureReason =
          paymentError?.error?.description ||
          paymentError?.error?.reason ||
          "UPI payment failed. Dobara try karo.";
        setToast(failureReason);
      });
      razorpay.open();
    } catch (error) {
      setToast(error.response?.data?.message || "Payment start nahi hua.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const submitCheckout = async () => {
    const validationError = validateCheckoutForm();

    if (validationError) {
      setToast(validationError);
      return;
    }

    if (ONLINE_PAYMENT_METHODS.includes(checkoutForm.paymentMethod)) {
      await openRazorpayCheckout();
      return;
    }

    if (checkoutContext?.type === "cart") {
      await placeCartOrder();
      return;
    }

    if (checkoutContext?.type === "buy-now" && checkoutContext.product) {
      await placeBuyNowOrder(checkoutContext.product);
    }
  };

  const checkoutTitle =
    checkoutContext?.type === "cart"
      ? "Complete your cart order"
      : `Buy ${checkoutContext?.product?.name || "product"}`;

  const checkoutSummary =
    checkoutContext?.type === "cart"
      ? `Cart total Rs. ${cartTotal.toLocaleString("en-IN")}`
      : `Order total Rs. ${(checkoutContext?.product?.price || 0).toLocaleString("en-IN")}`;

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onAccountClick={() => setShowAccountModal(true)}
        onAdminClick={openAdminMessages}
        onCartClick={() => setShowCartModal(true)}
        onOrdersClick={async () => {
          await refreshOrders();
          setShowOrdersModal(true);
        }}
        onLoginClick={() => openAuthModal("login")}
        onLogoutClick={handleLogout}
        onRegisterClick={() => openAuthModal("register")}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAdminButton={isAdminUser}
      />

      <main className="page-content">
        {featuredProduct ? (
          <section className="top-offer-banner">
            <div className="offer-copy">
              <span className="section-label">Mega Sale</span>
              <div className="banner-price-row">
                <strong>Rs. {featuredProduct.price.toLocaleString("en-IN")}</strong>
                <span>
                  Rs. {(featuredProduct.originalPrice || featuredProduct.price).toLocaleString("en-IN")}
                </span>
                <em>Big deals on top brands</em>
              </div>
              <h2>
                Big Deals on <span>Top Brands</span>
              </h2>
              <p>
                Best products at unbeatable prices
              </p>
              <button
                className="shop-now-btn"
                onClick={() => {
                  if (!token) {
                    openAuthModal("login");
                    return;
                  }

                  setActiveCategory("All");
                  setSearchTerm("");
                }}
              >
                Shop Now
              </button>

              <div className="banner-features">
                <div className="banner-feature-card">
                  <strong>Free Delivery</strong>
                  <span>On all orders</span>
                </div>
                <div className="banner-feature-card">
                  <strong>7 Days Return</strong>
                  <span>No questions asked</span>
                </div>
                <div className="banner-feature-card">
                  <strong>Best Quality</strong>
                  <span>Top products</span>
                </div>
                <div className="banner-feature-card">
                  <strong>Secure Payment</strong>
                  <span>100% secure</span>
                </div>
              </div>
            </div>

            <div className="offer-meta">
              <span className="rating-chip large">★ {featuredProduct.rating}</span>
              <span className="offer-pill">{featuredProduct.delivery}</span>
              <button
                className="primary-btn"
                onClick={() => setSelectedProduct(featuredProduct)}
              >
                Shop Now
              </button>
            </div>
            <div className="offer-visual">
              <img src={heroGadgets} alt="Mobiles, smartwatch, and headphones" />
            </div>
          </section>
        ) : null}

        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Smart shopping, cleaner experience</span>
            <h1>EasyMart now feels like a real storefront, not a rough demo.</h1>
            <p>
              Explore curated categories, faster search, cleaner product cards,
              and a smoother login experience in one responsive screen.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => {
                  if (!token) {
                    openAuthModal("login");
                    return;
                  }

                  setActiveCategory("All");
                  setSearchTerm("");
                }}
              >
                Browse catalog
              </button>
              <button
                className="secondary-btn"
                onClick={() => featuredProduct && setSelectedProduct(featuredProduct)}
                disabled={!featuredProduct}
              >
                View featured deal
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{token ? `${products.length}+` : "Login"}</strong>
                <span>Products</span>
              </div>
              <div>
                <strong>{categories.length - 1}</strong>
                <span>Core categories</span>
              </div>
              <div>
                <strong>Rs. {totalSavings.toLocaleString("en-IN")}</strong>
                <span>Visible savings</span>
              </div>
            </div>
          </div>

          {featuredProduct ? (
            <aside className="hero-highlight">
              <p className="highlight-label">Featured pick</p>
              <h2>{featuredProduct.name}</h2>
              <p className="highlight-tagline">{featuredProduct.tagline}</p>

            <div className="price-row">
              <strong>Rs. {featuredProduct.price.toLocaleString("en-IN")}</strong>
              <span>
                Rs. {(featuredProduct.originalPrice || featuredProduct.price).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="hero-highlight-meta">
              <span className="rating-chip large">★ {featuredProduct.rating}</span>
              <span className="offer-pill">{featuredProduct.delivery}</span>
            </div>

            <ul className="highlight-points">
              {(featuredProduct.features || []).map((feature) => (
                <li key={feature}>{feature}</li>
                ))}
              </ul>
            </aside>
          ) : null}
        </section>

        <h3 className="top-categories-title">Top Categories</h3>
        <section className="category-strip">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tile ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <div>
                <strong>{category.label}</strong>
                <small>{category.offer}</small>
                <span>Shop Now</span>
              </div>
              <img src={category.image} alt={category.label} />
            </button>
          ))}
        </section>

        <section className="catalog-panel">
          <div className="catalog-toolbar">
            <div>
              <span className="section-label">Catalog</span>
              <h3>
                {token
                  ? `${filteredProducts.length} products for ${
                      activeCategory === "All" ? "all categories" : activeCategory
                    }`
                  : "Login required to view products"}
              </h3>
            </div>

            <label className="sort-control">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!token ? (
            <div className="empty-state">
              <h3>Login required</h3>
              <p>Products dekhne ke liye pehle login karo.</p>
              <button className="primary-btn" onClick={() => openAuthModal("login")}>
                Login to view products
              </button>
            </div>
          ) : loadingProducts ? (
            <div className="empty-state">
              <h3>Products load ho rahe hain...</h3>
              <p>Backend aur MongoDB response ka wait ho raha hai.</p>
            </div>
          ) : filteredProducts.length ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id || product.name}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={() => openCheckout({ type: "buy-now", product })}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products matched your search.</h3>
              <p>Try another keyword or switch back to a broader category.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-header">
          <span className="section-label">EasyMart Footer</span>
          <h2>Helpful links, support details, and brand info in one clean space.</h2>
          <p>
            Footer me quick company info, contact options, aur shopping help rakha gaya hai
            taki page zyada complete aur useful lage.
          </p>
        </div>

        <div className="footer-grid">
          <button
            className={`footer-card ${activeFooterTab === "about" ? "active" : ""}`}
            onClick={() => setActiveFooterTab("about")}
          >
            <span className="footer-card-kicker">About Us</span>
            <strong>EasyMart story, vision, and shopping promise.</strong>
            <p>Know who we are and why the storefront is built for simpler buying.</p>
          </button>

          <button
            className={`footer-card ${activeFooterTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveFooterTab("contact")}
          >
            <span className="footer-card-kicker">Contact</span>
            <strong>Reach support quickly for delivery or payment help.</strong>
            <p>Use email, phone, or address details to contact the EasyMart team.</p>
          </button>

          <button
            className={`footer-card ${activeFooterTab === "help" ? "active" : ""}`}
            onClick={() => setActiveFooterTab("help")}
          >
            <span className="footer-card-kicker">Help</span>
            <strong>Need support with orders, refunds, or account issues?</strong>
            <p>Find the most useful customer help points in one place.</p>
          </button>
        </div>

        <div className="footer-detail-panel">
          {activeFooterTab === "about" ? (
            <>
              <span className="section-label">About EasyMart</span>
              <h3>Built to make product discovery and checkout feel smooth.</h3>
              <p>
                EasyMart focuses on curated shopping, fast checkout, clear pricing, and
                premium presentation so customers can browse offers without confusion.
              </p>
              <div className="footer-detail-points">
                <div>
                  <strong>What we do</strong>
                  <span>Mobiles, fashion, electronics, and featured daily offers.</span>
                </div>
                <div>
                  <strong>Our promise</strong>
                  <span>Simple buying flow, transparent pricing, and quick order updates.</span>
                </div>
                <div>
                  <strong>Customer focus</strong>
                  <span>Clean browsing, better checkout, and easier post-order tracking.</span>
                </div>
              </div>
            </>
          ) : null}

          {activeFooterTab === "contact" ? (
            <div className="contact-experience">
              <div className="contact-hero">
                <div className="contact-copy">
                  <span className="contact-pill">Contact EasyMart</span>
                  <h3>Contact Us</h3>
                  <p>
                    We'd love to hear from you. Have a question, suggestion, or
                    need help? Get in touch with us.
                  </p>
                  <div className="contact-benefits">
                    <span>Fast Reply</span>
                    <span>24h Support</span>
                    <span>Customer Friendly</span>
                  </div>
                </div>

                <div className="support-video-card" aria-label="Live contact desk preview">
                  <div className="support-video-top">
                    <span>LIVE CONTACT DESK</span>
                    <strong>Need Help?</strong>
                    <em>ONLINE</em>
                  </div>
                  <div className="support-chat-bubble">
                    Hi! Main EasyMart AI support hu. Order, exchange, delivery,
                    return ya payment ke baare me pooch sakte ho.
                  </div>
                  <div className="support-chip-row">
                    <span>Exchange kaise kare?</span>
                    <span>Order track kaise hoga?</span>
                    <span>Delivery kitne din me?</span>
                  </div>
                  <div className="support-input-demo">
                    <span>Type your question...</span>
                    <button type="button">Send</button>
                  </div>
                </div>
              </div>

              <div className="contact-main-grid">
                <form
                  className="contact-form-panel"
                  onSubmit={handleContactMessageSubmit}
                >
                  <span className="section-label">Contact Form</span>
                  <h3>Send Message</h3>
                  <div className="contact-form-grid">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      defaultValue={currentUser?.name || ""}
                      required
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      defaultValue={currentUser?.email || ""}
                      required
                    />
                    <input name="phone" type="tel" placeholder="Mobile Number" required />
                    <input name="subject" type="text" placeholder="Subject" required />
                    <textarea name="message" placeholder="Message" required />
                  </div>
                  <button className="primary-btn full-width" type="submit" disabled={contactSubmitting}>
                    {contactSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>

                <div className="contact-info-stack">
                  <div>
                    <span className="contact-icon">A</span>
                    <strong>Address</strong>
                    <p>Bhopal, Madhya Pradesh, India</p>
                  </div>
                  <div>
                    <span className="contact-icon">@</span>
                    <strong>Email</strong>
                    <p>support@easymart.in</p>
                  </div>
                  <div>
                    <span className="contact-icon">P</span>
                    <strong>Phone</strong>
                    <p>+91 9304154904</p>
                  </div>
                  <div>
                    <span className="contact-icon">H</span>
                    <strong>Working Hours</strong>
                    <p>Mon - Sat, 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="location-panel">
                <h3>Our Location</h3>
                <iframe
                  title="EasyMart location in Bhopal"
                  loading="lazy"
                  src="https://www.google.com/maps?q=Bhopal%2C%20Madhya%20Pradesh%2C%20India&output=embed"
                />
              </div>

              <div className="social-panel">
                <h3>Social Media</h3>
                <div className="social-grid">
                  {socialLinks.map((item) => (
                      <a href={item.url} key={item.label} target="_blank" rel="noreferrer">
                        <span>{item.icon}</span>
                        <strong>{item.label}</strong>
                      </a>
                    ))}
                </div>
              </div>

              <div className="faq-panel">
                <h3>FAQ</h3>
                <details open>
                  <summary>How can I return a product?</summary>
                  <p>
                    Order delivered hone ke baad return option My Orders section
                    me milega. Product unused condition me hona chahiye.
                  </p>
                </details>
                <details>
                  <summary>How does exchange work?</summary>
                  <p>
                    Exchange request support team review karegi, phir pickup aur
                    replacement update My Orders me milega.
                  </p>
                </details>
                <details>
                  <summary>How many days does delivery take?</summary>
                  <p>Usually 3-5 working days, location aur product availability par depend karta hai.</p>
                </details>
                <details>
                  <summary>How can I track my order?</summary>
                  <p>My Orders open karke 5-step delivery progress aur expected delivery date check karo.</p>
                </details>
              </div>
            </div>
          ) : null}

          {activeFooterTab === "help" ? (
            <>
              <span className="section-label">Help Center</span>
              <h3>Quick guidance for the most common shopping questions.</h3>
              <div className="footer-detail-points">
                <div>
                  <strong>Order tracking</strong>
                  <span>Open My Orders to check live status and expected delivery date.</span>
                </div>
                <div>
                  <strong>Payment support</strong>
                  <span>UPI and Cash on Delivery are supported during checkout.</span>
                </div>
                <div>
                  <strong>Cart issues</strong>
                  <span>Update quantity, remove items, and review total price before checkout.</span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </footer>

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
          role="presentation"
        >
          <div
            className="modal-card product-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="icon-close" onClick={() => setSelectedProduct(null)}>
              Close
            </button>

            <div className="product-modal-media">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="product-modal-content">
              <span className="product-badge">{selectedProduct.category}</span>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>

              <div className="price-row">
                <strong>Rs. {selectedProduct.price.toLocaleString("en-IN")}</strong>
                <span>
                  Rs. {(selectedProduct.originalPrice || selectedProduct.price).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="meta-row">
                <span className="rating-chip">★ {selectedProduct.rating}</span>
                <span>{selectedProduct.delivery}</span>
              </div>

              <ul className="highlight-points">
                {(selectedProduct.features || []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="modal-actions">
                <button
                  className="primary-btn"
                  onClick={() => handleAddToCart(selectedProduct)}
                >
                  Add to cart
                </button>
                <button
                  className="secondary-btn"
                  onClick={() =>
                    openCheckout({ type: "buy-now", product: selectedProduct })
                  }
                >
                  Buy now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCartModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCartModal(false)}
          role="presentation"
        >
          <div
            className="modal-card auth-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="auth-copy">
              <span className="section-label">Your cart</span>
              <h2>{cartCount ? `${cartCount} item in cart` : "Cart is empty"}</h2>
              <p>
                {cartCount
                  ? `Total Rs. ${cartTotal.toLocaleString("en-IN")}`
                  : "Login karke products add karo, phir yahin se order place hoga."}
              </p>
            </div>

            <div className="auth-form">
              {cartLoading ? (
                <p>Cart load ho raha hai...</p>
              ) : cartItems.length ? (
                <>
                  {cartItems.map((item) => (
                    <div key={item.product?._id} className="cart-line">
                      <div className="cart-line-copy">
                        <strong>{item.product?.name}</strong>
                        <p>Price: Rs. {(item.product?.price || 0).toLocaleString("en-IN")}</p>
                        <div className="cart-line-footer">
                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() =>
                                handleUpdateCartQuantity(item.product?._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || cartLoading}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() =>
                                handleUpdateCartQuantity(item.product?._id, item.quantity + 1)
                              }
                              disabled={cartLoading}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveFromCart(item.product?._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-line-total">
                        <span>Total price</span>
                        <strong>
                          Rs. {((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  ))}

                  <div className="cart-summary-card">
                    <span>Cart total price</span>
                    <strong>Rs. {cartTotal.toLocaleString("en-IN")}</strong>
                  </div>

                  <button
                    className="primary-btn full-width"
                    disabled={purchaseLoading}
                    onClick={() => openCheckout({ type: "cart" })}
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <button
                  className="primary-btn full-width"
                  onClick={() => {
                    setShowCartModal(false);
                    if (!token) openAuthModal("login");
                  }}
                >
                  {token ? "Browse products" : "Login to start shopping"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {showOrdersModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowOrdersModal(false)}
          role="presentation"
        >
          <div
            className="modal-card auth-modal orders-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="auth-copy">
              <span className="section-label">My Orders</span>
              <h2>{orders.length ? `${orders.length} order found` : "No orders yet"}</h2>
              <p>
                {orders.length
                  ? "Yahan tumhare placed orders, status aur expected delivery date dikhenge."
                  : "Abhi tak koi order place nahi hua. Checkout karoge to order yahin visible hoga."}
              </p>
            </div>

            <div className="auth-form orders-list">
              {ordersLoading ? (
                <p>Orders load ho rahe hain...</p>
              ) : orders.length ? (
                orders.map((order) => {
                  const orderStatus = getDisplayOrderStatus(order);
                  const completedSteps =
                    orderStatus === "Delivered" ? 5 : getOrderProgress(order);

                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-card-top">
                        <div>
                          <strong>{order.orderNumber}</strong>
                          <p>Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <span
                          className={`product-badge ${
                            orderStatus === "Delivered" ? "delivered-badge" : ""
                          }`}
                        >
                          {orderStatus}
                        </span>
                      </div>

                      <div className="order-steps" aria-label="Delivery progress">
                        {deliverySteps.map((step, index) => {
                          const isDone = index + 1 <= completedSteps;

                          return (
                            <div
                              key={`${order._id}-${step}`}
                              className={`order-step ${isDone ? "done" : ""}`}
                            >
                              <span>{index + 1}</span>
                              <strong>{step}</strong>
                            </div>
                          );
                        })}
                      </div>

                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={`${order._id}-${item.productId}`} className="order-line">
                            <strong>{item.name}</strong>
                            <p>
                              Qty {item.quantity} | Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="order-meta">
                        <span>Total: Rs. {order.totalAmount.toLocaleString("en-IN")}</span>
                        <span>Payment: {order.shippingDetails?.paymentMethod || "N/A"}</span>
                        <span>Expected delivery: {formatDate(order.estimatedDelivery)}</span>
                      </div>

                      {canManageOrders && orderStatus === "Delivered" ? (
                        <button
                          className="remove-btn order-remove-btn"
                          disabled={ordersLoading}
                          onClick={() => handleRemoveDeliveredOrder(order._id)}
                        >
                          Remove delivered order
                        </button>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <button
                  className="primary-btn full-width"
                  onClick={() => setShowOrdersModal(false)}
                >
                  Continue shopping
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdminMessagesModal && isAdminUser && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAdminMessagesModal(false)}
          role="presentation"
        >
          <div
            className="modal-card admin-messages-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="icon-close" onClick={() => setShowAdminMessagesModal(false)}>
              Close
            </button>

            <div className="admin-panel-hero">
              <div>
                <span className="section-label">Admin Panel</span>
                <h2>Contact Messages</h2>
                <p>Contact form se jo user message bhejega, admin yahin se dekh sakta hai.</p>
              </div>
              <button
                className="primary-btn"
                disabled={contactMessagesLoading}
                onClick={() => refreshContactMessages()}
              >
                {contactMessagesLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="admin-stats-grid">
              <div>
                <span>Total Messages</span>
                <strong>{contactStats.totalMessages}</strong>
              </div>
              <div>
                <span>Today</span>
                <strong>{contactStats.todayMessages}</strong>
              </div>
              <div>
                <span>Emails</span>
                <strong>{contactStats.emailMessages}</strong>
              </div>
            </div>

            <div className="admin-message-list">
              {contactMessagesLoading ? (
                <div className="admin-empty-message">Loading messages...</div>
              ) : contactMessages.length ? (
                contactMessages.map((item) => (
                  <article className="admin-message-card" key={item._id}>
                    <div className="admin-message-top">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.email}</span>
                      </div>
                      <div className="admin-message-actions">
                        <span className="new-contact-badge">New Contact</span>
                        <button
                          className="solved-remove-btn"
                          disabled={contactMessagesLoading}
                          onClick={() => handleRemoveContactMessage(item._id)}
                        >
                          Problem Solved - Remove
                        </button>
                      </div>
                    </div>
                    <small className="admin-message-date">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </small>
                    <div className="admin-message-meta">
                      <span>Name: {item.name}</span>
                      <span>Email: {item.email}</span>
                      <span>Phone: {item.phone}</span>
                      <span>Subject: {item.subject}</span>
                    </div>
                    <p>{item.message}</p>
                  </article>
                ))
              ) : (
                <div className="admin-empty-message">
                  Abhi koi contact message nahi aaya.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showOrderSuccessModal && recentOrder && (
        <div
          className="modal-backdrop"
          onClick={closeOrderSuccessModal}
          role="presentation"
        >
          <div
            className="modal-card success-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="success-banner">Order placed successfully</div>

            <div className="auth-copy">
              <span className="section-label">Order Confirmed</span>
              <h2>{recentOrder.orderNumber}</h2>
              <p>
                Tumhara order successfully place ho gaya hai. Niche amount, payment
                aur delivery date di gayi hai.
              </p>
            </div>

            <div className="success-details">
              <div className="success-detail-card">
                <strong>Total Amount</strong>
                <span>Rs. {recentOrder.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="success-detail-card">
                <strong>Payment</strong>
                <span>{recentOrder.shippingDetails?.paymentMethod || "N/A"}</span>
              </div>
              <div className="success-detail-card">
                <strong>Expected Delivery</strong>
                <span>{formatDate(recentOrder.estimatedDelivery)}</span>
              </div>
              <div className="success-detail-card">
                <strong>Items</strong>
                <span>{recentOrder.items?.length || 0} product</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={closeOrderSuccessModal}>
                Continue shopping
              </button>
              <button
                className="primary-btn"
                onClick={async () => {
                  closeOrderSuccessModal();
                  await refreshOrders();
                  setShowOrdersModal(true);
                }}
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {purchaseLoading && showCheckoutModal && (
        <div className="modal-backdrop order-processing-backdrop" role="presentation">
          <div className="modal-card processing-modal" role="dialog" aria-modal="true">
            <div className="processing-pulse" />
            <span className="section-label">EasyMart</span>
            <h2>Placing your order...</h2>
            <p>
              Order confirm kiya ja raha hai. Thoda sa wait karo, tumhara order
              aur payment details secure tarike se save ho rahe hain.
            </p>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div
          className="modal-backdrop"
          onClick={closeCheckoutModal}
          role="presentation"
        >
          <div
            className="modal-card checkout-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="auth-copy">
              <span className="section-label">Checkout</span>
              <h2>{checkoutTitle}</h2>
              <p>{checkoutSummary}</p>
            </div>

            <div className="checkout-grid">
              <input
                type="text"
                placeholder="Full name"
                value={checkoutForm.fullName}
                onChange={(event) =>
                  handleCheckoutFieldChange("fullName", event.target.value)
                }
              />
              <input
                type="text"
                placeholder="Phone number"
                value={checkoutForm.phone}
                onChange={(event) =>
                  handleCheckoutFieldChange("phone", event.target.value)
                }
              />
              <input
                type="text"
                placeholder="Pincode"
                value={checkoutForm.pincode}
                onChange={(event) =>
                  handleCheckoutFieldChange("pincode", event.target.value)
                }
              />
              <input
                type="text"
                placeholder="City"
                value={checkoutForm.city}
                onChange={(event) =>
                  handleCheckoutFieldChange("city", event.target.value)
                }
              />
              <input
                type="text"
                placeholder="State"
                value={checkoutForm.state}
                onChange={(event) =>
                  handleCheckoutFieldChange("state", event.target.value)
                }
              />
              <select
                value={checkoutForm.paymentMethod}
                onChange={(event) =>
                  handleCheckoutFieldChange("paymentMethod", event.target.value)
                }
              >
                <option>Cash on Delivery</option>
                <option>Online Payment</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Netbanking</option>
                <option>Wallet</option>
              </select>
              <textarea
                className="checkout-address"
                placeholder="Full address"
                value={checkoutForm.address}
                onChange={(event) =>
                  handleCheckoutFieldChange("address", event.target.value)
                }
              />
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={closeCheckoutModal}>
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={purchaseLoading}
                onClick={submitCheckout}
              >
                {purchaseLoading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && currentUser && (
        <div
          className="modal-backdrop"
          onClick={closeAccountModal}
          role="presentation"
        >
          <div
            className="modal-card auth-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="auth-copy">
              <span className="section-label">My Account</span>
              <h2>{currentUser.name}</h2>
              <p>
                Yahan tumhari basic account details aur quick actions available hain.
              </p>
            </div>

            <div className="auth-form">
              <div className="account-info-card">
                <strong>Full Name</strong>
                <span>{currentUser.name}</span>
              </div>
              <div className="account-info-card">
                <strong>Email</strong>
                <span>{currentUser.email}</span>
              </div>
              <div className="account-info-card">
                <strong>Account Status</strong>
                <span>Active shopper account</span>
              </div>
              <div className="account-info-card">
                <strong>Quick Access</strong>
                <span>Cart, checkout, payments, and order tracking enabled</span>
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={closeAccountModal}>
                  Close
                </button>
                <button
                  className="primary-btn"
                  onClick={async () => {
                    closeAccountModal();
                    await refreshOrders();
                    setShowOrdersModal(true);
                  }}
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div
          className="modal-backdrop"
          onClick={closeAuthModal}
          role="presentation"
        >
          <div
            className="modal-card auth-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="auth-copy">
              <span className="section-label">Easy access</span>
              <h2>
                {showForgotPassword
                  ? "Reset your password"
                  : isRegistering
                    ? "Create your EasyMart account"
                    : "Login to continue"}
              </h2>
              <p>
                {showForgotPassword
                  ? "Email daalo, reset code lo, phir new password set karo."
                  : "Save your session, manage your cart faster, and keep the storefront experience personal."}
              </p>
            </div>

            <div className="auth-form">
              {showForgotPassword ? (
                <>
                  <input
                    type="email"
                    placeholder="Registered email address"
                    value={passwordResetForm.email}
                    onChange={(event) =>
                      handlePasswordResetFieldChange("email", event.target.value)
                    }
                  />

                  <button
                    className="secondary-btn full-width"
                    disabled={authLoading}
                    onClick={handleForgotPassword}
                  >
                    {authLoading ? "Please wait..." : "Get reset code"}
                  </button>

                  {visibleResetCode ? (
                    <div className="reset-code-box">
                      <span>Your reset code</span>
                      <strong>{visibleResetCode}</strong>
                      <small>Code 10 minutes tak valid rahega.</small>
                    </div>
                  ) : null}

                  <input
                    type="text"
                    placeholder="Reset code"
                    value={passwordResetForm.resetCode}
                    onChange={(event) =>
                      handlePasswordResetFieldChange("resetCode", event.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordResetForm.password}
                    onChange={(event) =>
                      handlePasswordResetFieldChange("password", event.target.value)
                    }
                  />

                  <button
                    className="primary-btn full-width"
                    disabled={authLoading}
                    onClick={handleResetPassword}
                  >
                    {authLoading ? "Please wait..." : "Reset Password"}
                  </button>

                  <button
                    className="text-btn"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setVisibleResetCode("");
                    }}
                  >
                    Back to login
                  </button>
                </>
              ) : (
                <>
                  {isRegistering && (
                    <input
                      type="text"
                      placeholder="Your name"
                      value={authForm.name}
                      onChange={(event) =>
                        handleAuthFieldChange("name", event.target.value)
                      }
                    />
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={authForm.email}
                    onChange={(event) =>
                      handleAuthFieldChange("email", event.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(event) =>
                      handleAuthFieldChange("password", event.target.value)
                    }
                  />

                  <button
                    className="primary-btn full-width"
                    disabled={authLoading}
                    onClick={isRegistering ? handleRegister : handleLogin}
                  >
                    {authLoading
                      ? "Please wait..."
                      : isRegistering
                        ? "Register"
                        : "Login"}
                  </button>

                  {!isRegistering ? (
                    <button
                      className="text-btn"
                      onClick={() => {
                        setPasswordResetForm({
                          ...initialPasswordResetForm,
                          email: authForm.email,
                        });
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot password? Reset here
                    </button>
                  ) : null}

                  <button className="text-btn" onClick={() => setIsRegistering((value) => !value)}>
                    {isRegistering
                      ? "Already registered? Switch to login"
                      : "Need an account? Switch to register"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}












