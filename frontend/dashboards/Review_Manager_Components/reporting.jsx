import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../src/style/print.css";
import { API_BASE_URL } from "../../src/utils/getAPI";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reporting = ({ data }) => {
  const [sortedGameDetails, setSortedGameDetails] = useState([]);

  // Check if data is available and not empty
  if (!data || data.length === 0) {
    return <div>No data available for the chart</div>;
  }

  // Sort the data by averageRating and take the top 5 values
  const sortedData = [...data]
    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
    .slice(0, 5);

  const chartData = {
    labels: sortedData.map((item) => item?.title || "N/A"),
    datasets: [
      {
        label: "Average Rating",
        data: sortedData.map((item) => parseFloat(item?.averageRating) || 0),
        backgroundColor: "rgb(242, 17, 96, 0.8)", // Red theme for the bars
        maxBarThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "black", // Set legend text color to black
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: "Average Rating",
          color: "black", // Y-axis label color
        },
        ticks: {
          color: "black", // Y-axis tick color
        },
      },
      x: {
        ticks: {
          color: "black", // X-axis tick color
        },
      },
    },
  };

  const getGameDetailsById = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/games/getgamebyassignedgameid/${id}`
      );
      const game = response.data;

      return game;
    } catch (error) {
      console.error("Error fetching game details:", error);
    }
  };

  useEffect(() => {
    setSortedGameDetails([]);

    data.forEach((item) => {
      getGameDetailsById(item?.id).then((gameDetails) => {
        console.log("Game Details:", gameDetails);
        setSortedGameDetails((prevData) => [
          ...prevData,
          { ...gameDetails, averageRating: item.averageRating },
        ]);
      });
    });
  }, [data]);

  const sortedGameDetail = [...sortedGameDetails]
    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
    .slice(0, 5);

  useEffect(() => {
    console.log("Sorted Game Details:", sortedGameDetails);
  }, [sortedGameDetails]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable bg-gray-100 rounded-lg shadow-xl w-full ">
      <div className="pageCover grid grid-cols-2 gap-4 p-6   ">
        {/* Chart Section */}
        <div
          className="chartSection shadow-2xl rounded-lg bg-white p-4"
          style={{ height: "80vh", margin: "auto", width: "90%" }}
        >
          <Bar data={chartData} options={options} className="barchart" />
        </div>

        {/* Table Section */}
        <div className="gameDetailsSec bg-white shadow-2xl rounded-lg p-4">
          <table className="table-auto w-full  shadow-md rounded-lg overflow-hidden border-none">
            <thead className="" style={{ backgroundColor: "#17181c" }}>
              <tr className=" text-white shadow-sm">
                <th className="px-4 py-2">Cover & Title</th>
                <th className="px-4 py-2">Price (Rs)</th>
                <th className="px-4 py-2">Discount (%)</th>
                <th className="px-4 py-2">Selling Price (Rs)</th>
                <th className="px-4 py-2">Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedGameDetail.map((item, index) => {
                const sellingPrice =
                  item?.UnitPrice - (item?.discount / 100) * item?.UnitPrice;
                return (
                  <tr
                    key={index}
                    className="bg-white h-[30px] hover:bg-gray-50 hover:shadow-lg transition-all duration-300 ease-in-out"
                  >
                    <td className="px-4 py-2 flex items-center space-x-3 text-black">
                      <img
                        src={item?.coverPhoto}
                        alt={item?.title}
                        className="object-cover rounded-md mr-2 shadow-sm"
                        style={{ height: "40px", width: "40px" }}
                      />
                      <span>{item?.title}</span>
                    </td>
                    <td className="px-4 py-2 text-center text-black">
                      Rs {item?.UnitPrice}
                    </td>
                    <td className="px-4 py-2 text-center text-black">
                      {item?.discount}%
                    </td>
                    <td className="px-4 py-2 text-center text-red-600">
                      Rs {sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center text-black">
                      {sortedData[index]?.averageRating}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="Genre ">
            <h1 className="text-2xl font-bold text-center mt-4 text-black">
              Top Genres
            </h1>
            {sortedGameDetail.map((item, index) => {
              return (
                <div
                  key={index}
                  className="genreContent flex items-center justify-between mt-2"
                >
                  <span className="text-lg text-black">
                    {item?.genre?.map((genre, index) => (
                      <span key={index}>
                        {(() => {
                          const genreName =
                            genre.trim().charAt(0).toUpperCase() +
                            genre.trim().slice(1);
                          if (genreName === "Action") return `Action ⚔️`;
                          if (genreName === "Adventure") return `Adventure 🐾`;
                          if (genreName === "Racing") return `Racing 🏎️`;
                          if (genreName === "Puzzle") return `Puzzle 🧩`;
                          if (genreName === "Fighting") return `Fighting 🥷🏻`;
                          if (genreName === "Strategy") return `Strategy 🙄`;
                          if (genreName === "Sport") return `Sport 🏅`;
                          return genreName; // Fallback in case no match is found
                        })()}
                        {index < item.genre.length - 1 && ",\u00A0"}
                      </span>
                    ))}
                  </span>
                  <span className="text-lg text-black">
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            sortedData[index]?.averageRating >= star
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button
        onClick={handlePrint}
        style={{ backgroundColor: "#17181c" }}
        className="printBtn mt-4  text-white px-6 py-3 rounded-full "
      >
        Print Report
      </button>
    </div>
  );
};

export default Reporting;
