import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MostRentedGamesChart = ({ rentalPayments }) => {
  console.log("MostRentedGamesChart rendered with rentalPayments:", rentalPayments);

  const groupedData = useMemo(() => {
    if (!rentalPayments || !Array.isArray(rentalPayments)) {
      console.error("Invalid rentalPayments data:", rentalPayments);
      return [];
    }

    return rentalPayments.reduce((acc, item) => {
      const gameTitle = item.game?.title || 'N/A';
      if (acc[gameTitle]) {
        acc[gameTitle].rentalCount += 1;
      } else {
        acc[gameTitle] = {
          gameTitle,
          rentalCount: 1,
        };
      }
      return acc;
    }, {});
  }, [rentalPayments]);

  const sortedData = useMemo(() => {
    return Object.values(groupedData)
      .sort((a, b) => b.rentalCount - a.rentalCount)
      .slice(0, 10); // Limit to top 10 games
  }, [groupedData]);

  if (sortedData.length === 0) {
    return <div>No rental data available or data is in an unexpected format.</div>;
  }

  const chartData = {
    labels: sortedData.map(item => item.gameTitle),
    datasets: [
      {
        label: 'Rental Count',
        data: sortedData.map(item => item.rentalCount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Most Rented Games',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rental Count',
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MostRentedGamesChart;