import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Star, ArrowRight, Menu, X } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

const MinimalistShop = () => {
  const [gameStocks, setGameStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
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

  // Filter stocks based on search and genre
  useEffect(() => {
    if (searchTerm === "" && selectedGenre === "") {
      setFilteredStocks(gameStocks);
    } else {
      setFilteredStocks(
        gameStocks.filter((stock) => {
          const matchesTitle = stock.AssignedGame?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          
          const matchesGenre = selectedGenre
            ? stock.AssignedGame?.Genre?.flatMap((genre) =>
                genre.includes(",") ? genre.split(",") : genre
              ).some(
                (genre) =>
                  genre.trim().toLowerCase() === selectedGenre.toLowerCase()
              )
            : true;

          return matchesTitle && matchesGenre;
        })
      );
    }
  }, [searchTerm, selectedGenre, gameStocks]);

  // Get unique genres from the data
  const uniqueGenres = [...new Set(
    gameStocks.flatMap(stock => 
      stock.AssignedGame?.Genre?.flatMap(genre => 
        genre.includes(",") ? genre.split(",").map(g => g.trim()) : genre.trim()
      ) || []
    )
  )];

  const calculateDiscountedPrice = (originalPrice, discount) => {
    return discount > 0
      ? originalPrice - (originalPrice * discount) / 100
      : originalPrice;
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );


  const Hero = () => (
    <section className="relative py-32 px-4 overflow-hidden font-primaryRegular">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
      
      <div className="relative max-w-4xl mx-auto text-center text-white z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Your Next
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            Gaming Adventure
          </span>
        </h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Explore our curated collection of premium games with exclusive deals and instant downloads.
        </p>
        <button 
          onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-black px-8 py-4 hover:bg-gray-200 transition-all duration-300 font-semibold inline-flex items-center transform hover:scale-105"
        >
          Shop Now <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );

  const GameCard = ({ stock }) => {
    const originalPrice = stock.UnitPrice;
    const discount = stock.discount;
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);

    return (
      <div className="bg-white/95 backdrop-blur-sm text-black border border-gray-200 hover:border-black transition-all duration-300 group hover:shadow-2xl">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={stock.AssignedGame?.coverPhoto}
            alt={stock.AssignedGame?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop';
            }}
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {stock.AssignedGame?.title}
          </h3>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {stock.AssignedGame?.Genre?.flatMap((genre) =>
              genre.includes(",") ? genre.split(",") : genre
            ).slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-black text-white text-xs font-medium"
              >
                {genre.trim().toUpperCase()}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  LKR {originalPrice}
                </span>
              )}
              <span className="font-bold text-lg">
                LKR {discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="bg-black text-white px-2 py-1 text-xs font-medium">
                  -{discount}%
                </span>
              )}
            </div>
            <button className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm font-medium">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Games</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-black text-white relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <section id="shop-section" className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Filters Section */}
            <div className="mb-12 bg-black/80 backdrop-blur-sm p-6 rounded-lg border border-gray-800">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/95 text-black border border-gray-300 focus:border-black focus:outline-none backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGenre("")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      selectedGenre === ""
                        ? "bg-white text-black"
                        : "bg-white/20 text-white border border-white/50 hover:bg-white hover:text-black backdrop-blur-sm"
                    }`}
                  >
                    All Games
                  </button>
                  {uniqueGenres.slice(0, 6).map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        selectedGenre === genre
                          ? "bg-white text-black"
                          : "bg-white/20 text-white border border-white/50 hover:bg-white hover:text-black backdrop-blur-sm"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="mb-8">
              <p className="text-gray-300 bg-black/50 backdrop-blur-sm px-4 py-2 rounded inline-block">
                {filteredStocks.length} {filteredStocks.length === 1 ? 'game' : 'games'} found
              </p>
            </div>

            {/* Games Grid */}
            {filteredStocks.length === 0 ? (
              <div className="text-center py-20 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-800">
                <h3 className="text-2xl font-bold mb-4 text-white">No Games Found</h3>
                <p className="text-gray-400 mb-8">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGenre("");
                  }}
                  className="bg-white text-black px-6 py-3 hover:bg-gray-200 transition-colors font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStocks.map((stock) => (
                  <GameCard key={stock._id} stock={stock} />
                ))}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default MinimalistShop;