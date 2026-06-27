function ProductCard({ product, onAddToCart, onBuyNow, onQuickView }) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
        <span className="discount-badge">{discount}% off</span>
      </div>

      <div className="product-copy">
        <div className="product-topline">
          <span className="product-badge">{product.category}</span>
          <span className="rating-chip">{"\u2605"} {product.rating}</span>
        </div>

        <h4>{product.name}</h4>

        <p className="product-tagline">{product.tagline}</p>

        <div className="price-row compact">
          <strong>Rs. {product.price}</strong>
          <span>Rs. {product.originalPrice}</span>
        </div>

        <div className="meta-row">
          <span>{product.delivery}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="secondary-btn" onClick={() => onQuickView(product)}>
          Quick View
        </button>

        <button className="primary-btn" onClick={() => onAddToCart(product)}>
          Add to Cart
        </button>

        <button className="buy-btn" onClick={() => onBuyNow(product)}>
          Buy Now
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
