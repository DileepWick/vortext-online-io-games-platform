import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Bar, Line, Pie, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Button,
  Input,
} from "@nextui-org/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const SessionAnalytics = () => {
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch rental data from API
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8098/Rentals/getAllRentals"
        );
        setRentals(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch rental data");
        setIsLoading(false);
      }
    };
    fetchRentals();
  }, []);

  // Filter rentals based on time frame and search query
  const filteredRentals = useMemo(() => {
    const now = new Date();
    return rentals.filter((rental) => {
      const rentalDate = new Date(rental.insertDate);
      const matchesSearch = rental.game?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const withinTimeFrame = (() => {
        switch (timeFrame) {
          case "week":
            return now - rentalDate <= 7 * 24 * 60 * 60 * 1000;
          case "month":
            return now - rentalDate <= 30 * 24 * 60 * 60 * 1000;
          case "year":
            return now - rentalDate <= 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      })();
      return matchesSearch && withinTimeFrame;
    });
  }, [rentals, timeFrame, searchQuery]);

  // Analyze rental data for charts and reports
  const analyzeData = useMemo(() => {
    return filteredRentals.reduce((acc, rental) => {
      const gameTitle = rental.game?.title || "N/A";
      if (!acc[gameTitle]) {
        acc[gameTitle] = {
          gameTitle,
          userCount: new Set(),
          totalTime: 0,
          totalRevenue: 0,
          rentalDates: [],
        };
      }
      acc[gameTitle].userCount.add(rental.user?._id);
      acc[gameTitle].totalTime += parseInt(rental.time, 10) || 0;
      acc[gameTitle].totalRevenue += rental.price || 0;
      acc[gameTitle].rentalDates.push(new Date(rental.insertDate));
      return acc;
    }, {});
  }, [filteredRentals]);

  // Sort analyzed data for charts
  const sortedData = useMemo(() => {
    return Object.values(analyzeData)
      .map((item) => ({
        ...item,
        userCount: item.userCount.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [analyzeData]);

  // Chart Data and Options
  const createChartData = (label, dataKey, colors) => ({
    labels: sortedData.map((item) => item.gameTitle),
    datasets: [
      {
        label,
        data: sortedData.map((item) => item[dataKey]),
        backgroundColor: colors,
        borderColor: colors.map((color) => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = (title, yAxisLabel, isTime = false) => ({
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
          label: (context) =>
            `${yAxisLabel}: ${isTime ? formatTime(context.raw) : context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Game Titles",
          font: { size: 14, weight: "bold" },
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
          font: { size: 14, weight: "bold" },
        },
        ticks: {
          font: { size: 12 },
          callback: (value) => (isTime ? formatTime(value) : value),
        },
      },
    },
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Color palette for charts
  const colorPalette = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(99, 255, 132, 0.6)",
  ];

  const revenueData = useMemo(
    () => ({
      labels: sortedData.map((item) => item.gameTitle),
      datasets: [
        {
          data: sortedData.map((item) => item.totalRevenue),
          backgroundColor: colorPalette,
        },
      ],
    }),
    [sortedData]
  );

  const totalTimeData = useMemo(
    () => ({
      labels: sortedData.map((item) => item.gameTitle),
      datasets: [
        {
          label: "Total Time",
          data: sortedData.map((item) => item.totalTime),
          backgroundColor: colorPalette,
          borderColor: colorPalette.map((color) => color.replace("0.6", "1")),
        },
      ],
    }),
    [sortedData]
  );

  // Generate PDF report function
  const generateReport = () => {
    const doc = new jsPDF();
    const marginLeft = 14; // Set left margin for text consistency

    // Title for the report
    doc.setFontSize(18);
    doc.text("Game Rental and Revenue Report", marginLeft, 15);

    // Section 1: Total Revenue Table
    doc.setFontSize(14);
    doc.text("Revenue Analysis for Popular Games", marginLeft, 30);
    autoTable(doc, {
      startY: 35,
      head: [["Game Title", "User Count", "Total Time (s)", "Total Revenue"]],
      body: sortedData.map((item) => [
        item.gameTitle,
        item.userCount,
        item.totalTime,
        item.totalRevenue.toFixed(2),
      ]),
    });

    // Section 2: Peak Rental Time Analysis
    doc.text(
      "Peak Rental Time Analysis for Games",
      marginLeft,
      doc.autoTable.previous.finalY + 10
    );
    autoTable(doc, {
      startY: doc.autoTable.previous.finalY + 15,
      head: [["Game Title", "Peak Rental Time"]],
      body: sortedData.map((item) => {
        const peakHour =
          Math.max(...item.rentalDates.map((date) => date.getHours())) + ":00";
        return [item.gameTitle, peakHour];
      }),
    });

    // Section 3: Rental Date Analysis
    doc.text(
      "Rental Date Analysis for Games",
      marginLeft,
      doc.autoTable.previous.finalY + 10
    );
    autoTable(doc, {
      startY: doc.autoTable.previous.finalY + 15,
      head: [["Game Title", "Rental Dates"]],
      body: sortedData.map((item) => [
        item.gameTitle,
        item.rentalDates.map((date) => date.toLocaleString()).join(", "),
      ]),
    });

    // Save PDF
    doc.save("session_analytics_report.pdf");
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <Input
          label="Search by Game Title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[500px]"
        />
        <Select
          label="Select Time Frame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="w-[500px]"
        >
          <SelectItem value="all" className="text-black">
            All Time
          </SelectItem>
          <SelectItem value="week" className="text-black">
            Last Week
          </SelectItem>
          <SelectItem value="month" className="text-black">
            Last Month
          </SelectItem>
          <SelectItem value="year" className="text-black">
            Last Year
          </SelectItem>
        </Select>
        <Button onClick={generateReport} color="primary" size="lg">
          Generate Report
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "20px",
          margin:'30px'
        }}
      >
        <Card  style={{marginRight:'30px' ,width:'650px' }}>
          <CardBody>
            <Bar
              data={createChartData(
                "Total Revenue",
                "totalRevenue",
                colorPalette
              )}
              options={chartOptions("Revenue Analysis", "Total Revenue")}
            />
          </CardBody>
        </Card>
        <Card style={{width:'720px'}}>
          <CardBody>
            <Line
              data={createChartData("Total Time", "totalTime", colorPalette)}
              options={chartOptions("Time Analysis", "Total Time (s)", true)}
            />
          </CardBody>
        </Card>
        <Card style={{marginRight:'30px' ,width:'650px',marginTop:'20px'}}>
          <CardBody>
            <Pie
              data={revenueData}
              options={chartOptions("Revenue Distribution", "Total Revenue")}
            />
          </CardBody>
        </Card>
        <Card style={{width:'720px',marginTop:'20px'}}>
          <CardBody>
            <Doughnut
              data={totalTimeData}
              options={chartOptions(
                "Total Time Distribution",
                "Total Time (s)",
                true
              )}
            />
          </CardBody>
        </Card>
        <Card style={{ marginTop: "20px" ,width:'1400px' }} className="font-primaryRegular">
          <CardBody>
            <Radar className="font-primaryRegular"
              data={createChartData("User Count", "userCount", colorPalette)}
              options={chartOptions("User Count Analysis", "User Count")}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SessionAnalytics;
