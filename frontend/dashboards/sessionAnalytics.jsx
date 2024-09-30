import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SessionAnalytics = () => {
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get('http://localhost:8098/Rentals/getAllRentals');
        setRentals(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch rental data');
        console.error('Error fetching data:', err);
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const analyzeData = useMemo(() => {
    return rentals.reduce((acc, rental) => {
      const gameTitle = rental.game?.title || 'N/A';
      if (!acc[gameTitle]) {
        acc[gameTitle] = {
          gameTitle,
          userCount: new Set(),
          totalTime: 0,
          totalRevenue: 0,
        };
      }
      acc[gameTitle].userCount.add(rental.user?._id);
      acc[gameTitle].totalTime += parseInt(rental.time, 10) || 0;
      acc[gameTitle].totalRevenue += rental.price || 0;
      return acc;
    }, {});
  }, [rentals]);

  const sortedData = useMemo(() => {
    return Object.values(analyzeData)
      .map(item => ({
        ...item,
        userCount: item.userCount.size,
      }))
      .sort((a, b) => b.userCount - a.userCount);
  }, [analyzeData]);

  const createChartData = (label, dataKey) => ({
    labels: sortedData.map(item => item.gameTitle),
    datasets: [
      {
        label,
        data: sortedData.map(item => item[dataKey]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const chartOptions = (title, yAxisLabel, isTime = false, isUserCount = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          title: (context) => `Game: ${context[0].label}`,
          label: (context) => {
            if (isTime) {
              return `${yAxisLabel}: ${formatTime(context.raw)}`;
            }
            return `${yAxisLabel}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Game Titles',
          font: { size: 14, weight: 'bold' },
        },
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
          font: { size: 14, weight: 'bold' },
        },
        ticks: { 
          font: { size: 12 },
          stepSize: isUserCount ? 1 : undefined,
          callback: function(value) {
            if (isTime) {
              return formatTime(value);
            }
            return value;
          }
        },
      },
    },
    layout: {
      padding: { top: 20, right: 20, bottom: 120, left: 40 },
    },
  });

  if (isLoading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Tabs aria-label="Analytics tabs">
        <Tab key="users" title="Users">
          <Card>
            <CardBody>
              <div style={{ height: '500px', width: '100%' }}>
                <Bar 
                  data={createChartData('Number of Users', 'userCount')} 
                  options={chartOptions('Most Rented Games by Unique Users', 'Number of Users', false, true)} 
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="time" title="Rental Time">
          <Card>
            <CardBody>
              <div style={{ height: '500px', width: '100%' }}>
                <Bar 
                  data={createChartData('Total Rental Time', 'totalTime')} 
                  options={chartOptions('Total Rental Time per Game', 'Total Time', true)} 
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="revenue" title="Revenue">
          <Card>
            <CardBody>
              <div style={{ height: '500px', width: '100%' }}>
                <Bar 
                  data={createChartData('Total Revenue', 'totalRevenue')} 
                  options={chartOptions('Total Revenue per Game', 'Total Revenue (LKR)')} 
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SessionAnalytics;