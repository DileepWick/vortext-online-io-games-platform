import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Star, ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

const MinimalistShop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch game stocks from API
  useEffect(() => {
    const fetchGameStocks = async () => {
      try {
        const response = await fetch("http://localhost:8098/gameStocks/allGameStock");
        if (!response.ok) {
          throw new Error('Failed to fetch game stocks');
        }
        const data = await response.json();
        setGameStocks(data.allGameStocks || []);
        setFilteredStocks(data.allGameStocks || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching game stocks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStocks();
  }, []);

  // Filter stocks based on search only
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStocks(gameStocks);
    } else {
      setFilteredStocks(
        gameStocks.filter((stock) => {
          const matchesTitle = stock.AssignedGame?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          return matchesTitle;
        })
      );
    }
  }, [searchTerm, gameStocks]);

  const calculateDiscountedPrice = (originalPrice, discount) => {
    return discount > 0
      ? originalPrice - (originalPrice * discount) / 100
      : originalPrice;
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );


  const Hero = () => (
    <section 
      className="relative py-32 px-4 overflow-hidden font-primaryRegular"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-4xl mx-auto text-center text-white z-10">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          DISCOVER
          <br />
          <span className="text-4xl md:text-6xl font-light">
            Your Next Adventure
          </span>
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light">
          Curated collection of premium games with exclusive deals and instant downloads
        </p>
        <button 
          onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-black px-12 py-4 hover:bg-gray-100 transition-all duration-300 font-medium inline-flex items-center transform hover:scale-105 text-lg"
        >
          EXPLORE GAMES <ArrowRight className="ml-3 w-5 h-5" />
        </button>
      </div>
    </section>
  );

  const GameCard = ({ stock }) => {
    const originalPrice = stock.UnitPrice;
    const discount = stock.discount;
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);

    return (
      <div className=" border border-gray-200 hover:border-black transition-all duration-300 group hover:shadow-xl">
        <Link to={`/game/${stock._id}`}>
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={stock.AssignedGame?.coverPhoto}
              alt={stock.AssignedGame?.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop';
              }}
            />
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold text-xl mb-3 text-black">
              {stock.AssignedGame?.title}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {stock.AssignedGame?.Genre?.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    LKR {originalPrice}
                  </span>
                )}
                <span className="font-bold text-sm text-black">
                  LKR {discountedPrice.toFixed(2)}
                </span>
                {discount > 0 && (
                  <span className="bg-black text-white px-3 py-1 text-sm font-medium">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };


  if (loading) return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Games</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark text-black font-primaryRegular">
      <Header />
      <Hero />
      <section id="shop-section" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Search Section */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">ALL GAMES</h2>
              <p className="text-gray-600 text-lg">Find your perfect gaming experience</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white text-black border-2 border-gray-300 focus:border-black focus:outline-none text-lg"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg">
              {filteredStocks.length} {filteredStocks.length === 1 ? 'game' : 'games'} available
            </p>
          </div>

          {/* Games Grid */}
          {filteredStocks.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-gray-200">
              <h3 className="text-3xl font-bold mb-4 text-black">No Games Found</h3>
              <p className="text-gray-600 mb-8 text-lg">Try adjusting your search</p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                RESET SEARCH
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredStocks.map((stock) => (
                <GameCard key={stock._id} stock={stock} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default MinimalistShop;