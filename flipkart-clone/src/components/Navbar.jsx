import { useEffect, useRef, useState } from "react";

const navItems = ["Mobiles", "Fashion", "Electronics", "More", "Deals", "About Us", "Contact"];

function Navbar({
  cartCount,
  currentUser,
  onAccountClick,
  onAdminClick,
  onCartClick,
  onOrdersClick,
  onLoginClick,
  onLogoutClick,
  onRegisterClick,
  onNavigate,
  searchTerm,
  setSearchTerm,
  showAdminButton,
}) {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="nav-main-row">
        <div className="brand-block">
          <span className="brand-logo-mark">AM</span>
          <div>
            <span className="brand-kicker">Aarohimart</span>
            <p>Premium deals for mobiles, fashion, and electronics.</p>
          </div>
        </div>

        <div className="mobile-search-row">
          <button
            className="mobile-menu-toggle"
            type="button"
            onClick={() => setShowMobileNav((value) => !value)}
            aria-label="Open menu"
            aria-expanded={showMobileNav}
          >
            <span />
            <span />
            <span />
          </button>

          <label className="search-field">
            <span>Search</span>
            <div className="search-shell">
              <span className="search-icon">Search</span>
              <input
                className="search-input"
                placeholder="Search products, brands, and categories"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="header-actions">
          <button className="cart-pill" onClick={onCartClick}>
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </button>

          {currentUser ? (
            <>
              <button className="cart-pill" onClick={onOrdersClick}>
                <span>Orders</span>
                <strong>My</strong>
              </button>

              {showAdminButton ? (
                <button className="cart-pill admin-pill" onClick={onAdminClick}>
                  <span>Admin</span>
                  <strong>Panel</strong>
                </button>
              ) : null}

              <div className="profile-menu-wrap" ref={menuRef}>
                <button
                  className="profile-pill"
                  onClick={() => setShowProfileMenu((value) => !value)}
                >
                  <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
                  <small>{currentUser.name}</small>
                </button>

                {showProfileMenu ? (
                  <div className="profile-menu">
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onAccountClick();
                      }}
                    >
                      My Account
                    </button>
                    <button
                      className="profile-menu-item logout-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogoutClick();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="auth-actions">
              <button className="secondary-btn" onClick={onLoginClick}>
                Profile
              </button>
              <button className="secondary-btn" onClick={onLoginClick}>
                Login
              </button>
              <button className="primary-btn" onClick={onRegisterClick}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <nav
        className={`nav-link-row ${showMobileNav ? "open" : ""}`}
        aria-label="Store sections"
      >
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className="nav-link-pill"
            onClick={() => {
              setSearchTerm("");
              setShowMobileNav(false);
              onNavigate?.(item);
            }}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
