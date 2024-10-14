import React, { useEffect, useState} from "react";
import Header from "../src/components/header";
import useAuthCheck from "../src/utils/authCheck";
import ReviewTable from "./Review_Manager_Components/table";
import Chart from "./Review_Manager_Components/chart";
import axios from "axios";
import Reporting from "./Review_Manager_Components/reporting";
import Loader from "../src/components/Loader/loader";
import '../src/style/print.css';
import Footer from "../src/components/footer";





// Next UI
import { Tabs, Tab } from "@nextui-org/react";

const API_BASE_URL = "http://localhost:8098";

const Review_manager = () => {
    useAuthCheck();
  const [activeTab, setActiveTab] = useState("stats");

  const [loading, setLoading] = useState(true);
  const [ratingsData, setRatingsData] = useState([]);

  // const fetchRatings = async (id) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8098/ratings/game/${id}`
  //     );
  //     const ratings = response.data;

  //     // Calculate average rating
  //     const avg =
  //       ratings.length > 0
  //         ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
  //           ratings.length
  //         : undefined;

  //     // Check if avg is defined
  //     if (avg !== undefined) {
  //       // Create a new entry with gameId and averageRating
  //       const newRatingData = { gameId: id, averageRating: avg };

  //       // Update the state with the new entry
  //       setRatingsData((prevData) => {
  //         const updatedData = [...prevData, newRatingData];

  //         // Filter out entries where averageRating is undefined
  //         const filteredData = updatedData.filter(
  //           (data) => data.averageRating !== undefined
  //         );

  //         // Sort by averageRating in descending order
  //         const sortedData = filteredData.sort(
  //           (a, b) => b.averageRating - a.averageRating
  //         );

  //         return sortedData;
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching ratings:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchRatings();
  //   console.log("fetching ratings",);
  // },[]);

  const getRatings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ratings/getallratings`);
      if (response.data) {
        setRatingsData(response.data);
        setTimeout(() => {
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // finally {
    //   // Delay the end of loading to ensure the Loader is visible for at least 2 seconds
    //   const minLoadingTime = 1000; // 2 seconds
    //   const actualLoadingTime = Date.now() - startLoadingTime;
    //   const delay = Math.max(minLoadingTime - actualLoadingTime, 0);

    //   // setTimeout(() => {
    //   //   setLoading(false);
    //   // }, delay);
    //   // const startLoadingTime = Date.now();
    // }
  };


 useEffect(() => {
  getRatings();
  
  }, []);


  const calculateAverageRatings = (reviews) => {
    // Create an object to store the sum of ratings and count for each game
    const gameRatings = {};
  
    // Loop through all reviews
    reviews.forEach((review) => {
      const game = review.game;
  
      if (game && game.AssignedGame) {
        const gameId = game.AssignedGame._id;
        const gameTitle = game.AssignedGame.title;
  
        // If the game has been encountered before, update its ratings
        if (gameRatings[gameId]) {
          gameRatings[gameId].totalRatings += review.rating;
          gameRatings[gameId].reviewCount += 1;
        } else {
          // Initialize game with its first rating and a review count of 1
          gameRatings[gameId] = {
            title: gameTitle,
            totalRatings: review.rating,
            reviewCount: 1
          };
        }
      }
    });
  
    // Calculate average ratings for each game
    const averageRatings = Object.keys(gameRatings).map((gameId) => {
      const game = gameRatings[gameId];
      const averageRating = game.totalRatings / game.reviewCount;
  
      return {
        id: gameId, // Include gameId in the return object
        title: game.title,
        averageRating: parseFloat(averageRating.toFixed(2)) // rounding to 2 decimal places
      };
    });
  
    return averageRatings;
  };

  
  const averageRatings = calculateAverageRatings(ratingsData);
  console.log("This is review data for chart",averageRatings);
  
  if (loading) return <Loader />;

  

  
  return (
    <div className="printable">
        <Header/>
        <div className="flex w-full flex-col">
      <div className="relative">
      </div>
      <div className="flex items-center p-4 font-primaryRegular">
        <Tabs
          aria-label="Blogger Tabs"
          className="flex-1"
          onSelectionChange={setActiveTab}
          selectedKey={activeTab}
          size="lg"
          color="primary"
        >
          <Tab key="tab1" title="Reviews" />
          <Tab key="tab2" title="Top Game Ratings" />
          <Tab key="tab3" title="Reporting" />
          
        </Tabs>
      </div>
      
      <div className="p-4 ">

        {activeTab === "tab1" && <ReviewTable/>}
        {activeTab === "tab2" && <Chart data={averageRatings}  />}
        {activeTab === "tab3" && <Reporting data={averageRatings}/>}
        
      </div>
    </div>
    <Footer />
    </div>
    

  );
};

export default Review_manager;