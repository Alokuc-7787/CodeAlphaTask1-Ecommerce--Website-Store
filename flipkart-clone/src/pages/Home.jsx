import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const existingScript = document.getElementById("razorpay-checkout-script");

    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleAddToCart = (product) => {
    alert(product.name + " added to cart");
  };

  const handleQuickView = (product) => {
    alert(product.name);
  };

  const handleBuyNow = async (product) => {
    try {
      const res = await axios.post("/api/payment/create-order", {
        amount: product.price,
        productId: product._id || product.id,
        productName: product.name,
      });

      const data = res.data;

      if (!data.success) {
        alert(data.message || "Failed to create payment order");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "EasyMart",
        description: product.name,
        order_id: data.order_id,
        handler: function (response) {
          alert(`Payment Successful. Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "EasyMart User",
          email: "test@example.com",
          contact: "9999999999",
        },
        notes: {
          productName: product.name,
        },
        theme: {
          color: "#1f3b5b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
      alert("Payment failed");
    }
  };

  return (
    <div className="home">
      <div className="topbar">
        <h2>MyShop</h2>
        <input placeholder="Search for products..." />
      </div>

      <div className="categories">
        <div className="card" onClick={() => navigate("/mobiles")}>
          📱
          <p>Mobiles</p>
        </div>

        <div className="card" onClick={() => navigate("/electronics")}>
          💻
          <p>Electronics</p>
        </div>

        <div className="card">
          🏠
          <p>Home</p>
        </div>

        <div className="card">
          👕
          <p>Fashion</p>
        </div>
      </div>

      <div className="banner">
        <h1>Big Sale is Live 🔥</h1>
      </div>

      <div className="products">
        {products.map((item) => (
          <ProductCard
            key={item._id}
            product={item}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onQuickView={handleQuickView}
          />
        ))}
      </div>
    </div>
  );
}
