import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Code, Menu, X, ShoppingCart, UserCircle, Sun, Moon, LogOut } from "lucide-react";
import Container from "./Container";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast"; // For logout confirmation toast
import { AnimatePresence, motion } from "framer-motion"; // For mobile menu animation

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart(); // Get item count from CartContext
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function from ThemeContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setIsOpen(false); // Close mobile menu on logout
    navigate('/'); // Redirect to home or login page after logout
  };

  // Define navigation links
  // isNavLink: true indicates it should use NavLink for active styling
  // isExternal: true indicates it's an external link and should use <a> tag
  const navLinks = [
    { href: "/", label: "Home", isNavLink: true },
    { href: "/services", label: "Services", isNavLink: true },
    { href: "https://portfolio-delta-ruby-48.vercel.app/", label: "Portfolio", isExternal: true }, // External portfolio link
    { href: "/pricing", label: "Pricing", isNavLink: true },
    { href: "/blog", label: "Blog", isNavLink: true },
    { href: "/contact", label: "Contact", isNavLink: true },
  ];

  // Helper function to render links (handles NavLink vs. <a>)
  const renderLink = (link: typeof navLinks[0], isMobile = false) => {
    const linkClasses = `py-2 px-3 rounded-lg font-medium transition-colors ${
      isMobile ? "text-xl" : "text-lg" // Larger text for mobile menu
    }`;
    const activeClasses = "text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-gray-700";
    const inactiveClasses = "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400";

    if (link.isExternal) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClasses} ${inactiveClasses}`}
          onClick={() => setIsOpen(false)} // Close mobile menu on click
        >
          {link.label}
        </a>
      );
    } else {
      return (
        <NavLink
          key={link.href}
          to={link.href}
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeClasses : inactiveClasses}`
          }
          onClick={() => setIsOpen(false)} // Close mobile menu on click
        >
          {link.label}
        </NavLink>
      );
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <Container className="flex items-center justify-between h-20">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <Code className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">DevServe</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-grow justify-center gap-2 lg:gap-4 ml-8">
          {navLinks.map((link) => renderLink(link))}
        </nav>

        {/* Right Section: Cart, Auth, Theme Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto md:ml-0">
          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth Button (Login/Logout) */}
          {isAuthenticated ? (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <LogOut className="w-6 h-6" />
              <span className="hidden lg:inline">Logout</span> {/* Show text on larger screens */}
            </motion.button>
          ) : (
            <Link to="/login" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <UserCircle className="w-6 h-6" />
              <span className="hidden lg:inline">Login</span> {/* Show text on larger screens */}
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6 text-yellow-500" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Mobile Menu Button (Hamburger) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay with Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-8 z-40 p-4"
            >
              {navLinks.map((link) => renderLink(link, true))}
              <div className="flex flex-col items-center gap-4 mt-8">
                 {isAuthenticated ? (
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-2xl font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                    >
                      <LogOut className="w-8 h-8" />
                      Logout
                    </motion.button>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                      <UserCircle className="w-8 h-8" />
                      Login
                    </Link>
                  )}
                 <button
                    onClick={toggleTheme}
                    className="text-2xl font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                    aria-label="Toggle theme"
                 >
                    {theme === "dark" ? (
                      <Sun className="w-8 h-8 text-yellow-500" />
                    ) : (
                      <Moon className="w-8 h-8 text-gray-700" />
                    )}
                    Toggle Theme
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
};

export default Navbar;