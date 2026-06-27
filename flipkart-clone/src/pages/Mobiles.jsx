import products from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Mobiles() {

  const mobileProducts = products.filter(
    (product) => product.category === "Mobiles"
  );

  // Add to Cart function
  const handleAddToCart = (product) => {
    alert(product.name + " added to cart");
    console.log("Added:", product);
  };

  // Quick View function
  const handleQuickView = (product) => {
    alert("Viewing: " + product.name);
  };

  return (
    <div style={{ padding: "40px" }}>
      
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        📱 Mobiles
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {mobileProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
          />
        ))}
      </div>

    </div>
  );
}