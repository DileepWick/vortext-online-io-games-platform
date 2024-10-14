import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Radar,
  Treemap,
  Scatter,
} from "recharts";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  Chip,
  CardHeader,
  CardBody,
  Image,
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Analytics = () => {
  const [stocks, setStocks] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFrame, setTimeFrame] = useState("monthly");

  useEffect(() => {
    getAllStocks();
    getAllSales();
  }, []);

  const getAllStocks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8098/gameStocks/allGameStock"
      );
      if (response.data.allGameStocks) {
        setStocks(response.data.allGameStocks);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const getAllSales = async () => {
    try {
      const response = await axios.get("http://localhost:8098/orderItems");
      if (response.data.orderHistory) {
        setSales(response.data.orderHistory);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.AssignedGame.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const genreData = stocks.reduce((acc, stock) => {
    stock.AssignedGame.Genre.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  const genreChartData = Object.entries(genreData).map(([name, value]) => ({
    name,
    value,
  }));

  const priceRanges = [
    { range: "0-1000", count: 0 },
    { range: "1001-3000", count: 0 },
    { range: "3001-5000", count: 0 },
    { range: "5001+", count: 0 },
  ];

  stocks.forEach((stock) => {
    const price = stock.UnitPrice;
    if (price <= 1000) priceRanges[0].count++;
    else if (price <= 3000) priceRanges[1].count++;
    else if (price <= 5000) priceRanges[2].count++;
    else priceRanges[3].count++;
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8" ,"#955538" ,"#b0390a"];

  // Sales Analytics
  const salesByGame = sales.reduce((acc, sale) => {
    const gameTitle = sale.stockid.AssignedGame?.title ? sale.stockid.AssignedGame.title : "NA";

    acc[gameTitle] = (acc[gameTitle] || 0) + sale.price;
    return acc;
  }, {});

  const salesChartData = Object.entries(salesByGame).map(([name, value]) => ({
    name,
    value,
  }));

  const getSalesOverTime = (timeFrame) => {
    const salesData = sales.reduce((acc, sale) => {
      let key;
      const date = new Date(sale.date);
      switch (timeFrame) {
        case "daily":
          key = date.toISOString().split("T")[0];
          break;
        case "weekly":
          const weekNumber = Math.ceil(
            (date.getDate() - 1 - date.getDay()) / 7
          );
          key = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case "monthly":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split("T")[0];
      }
      acc[key] = (acc[key] || 0) + sale.price;
      return acc;
    }, {});

    return Object.entries(salesData).map(([date, value]) => ({
      date,
      value,
    }));
  };

  const salesTimeChartData = getSalesOverTime(timeFrame);

  // New complex analytics
  const genrePerformance = stocks.reduce((acc, stock) => {
    stock.AssignedGame.Genre.forEach((genre) => {
      if (!acc[genre]) {
        acc[genre] = { totalRevenue: 0, totalSales: 0, avgPrice: 0 };
      }
      const gameSales = sales.filter(
        (sale) => sale.stockid.AssignedGame.title === stock.AssignedGame.title
      );
      const revenue = gameSales.reduce((sum, sale) => sum + sale.price, 0);
      acc[genre].totalRevenue += revenue;
      acc[genre].totalSales += gameSales.length;
      acc[genre].avgPrice =
        acc[genre].totalRevenue / acc[genre].totalSales || 0;
    });
    return acc;
  }, {});

  const genrePerformanceData = Object.entries(genrePerformance).map(
    ([genre, data]) => ({
      genre,
      totalRevenue: data.totalRevenue,
      totalSales: data.totalSales,
      avgPrice: data.avgPrice,
    })
  );

  const priceVsSales = stocks.map((stock) => {
    const gameSales = sales.filter(
      (sale) => sale.stockid.AssignedGame.title === stock.AssignedGame.title
    );
    return {
      name: stock.AssignedGame.title,
      price: stock.UnitPrice,
      sales: gameSales.length,
      revenue: gameSales.reduce((sum, sale) => sum + sale.price, 0),
    };
  });

  const topPerformers = salesChartData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((game) => ({
      name: game.name,
      value: game.value,
    }));

  const generatePDFReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Analytics Report - VortexGaming", 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Games: ${stocks.length}`, 14, 32);
    doc.text(
      `Total Sales: $${sales
        .reduce((sum, sale) => sum + sale.price, 0)
        .toFixed(2)}`,
      14,
      40
    );

    doc.setFontSize(14);
    doc.text("Genre Distribution", 14, 50);
    const genreTableData = Object.entries(genreData).map(([genre, count]) => [
      genre,
      count,
    ]);
    doc.autoTable({
      startY: 54,
      head: [["Genre", "Count"]],
      body: genreTableData,
    });

    doc.text("Price Range Distribution", 14, doc.lastAutoTable.finalY + 10);
    const priceRangeTableData = priceRanges.map((range) => [
      range.range,
      range.count,
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Price Range", "Count"]],
      body: priceRangeTableData,
    });

    doc.text("Top 5 Games by Sales", 14, doc.lastAutoTable.finalY + 10);
    const topSalesGames = salesChartData
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((game, index) => [
        `${index + 1}. ${game.name}`,
        `$${game.value.toFixed(2)}`,
      ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Game", "Sales"]],
      body: topSalesGames,
    });

    doc.text("Genre Performance", 14, doc.lastAutoTable.finalY + 10);
    const genrePerformanceTableData = genrePerformanceData.map((data) => [
      data.genre,
      `$${data.totalRevenue.toFixed(2)}`,
      data.totalSales,
      `$${data.avgPrice.toFixed(2)}`,
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Genre", "Total Revenue", "Total Sales", "Avg Price"]],
      body: genrePerformanceTableData,
    });

    doc.save("enhanced_analytics_report.pdf");
  };

  return (
    <div className="p-8">

      <div className="flex flex-row mt-8 mb-8">
        <Card className="py-4" style={{ marginRight: "50px" }}>
          <CardHeader
            className="pb-0 pt-2 px-4 flex-col items-center" // Change items-start to items-center
            style={{ textAlign: "center" }} // Keep the text alignment for additional safety
          >
            <h4
              className="font-primaryRegular"
              style={{ fontSize: "25px", textAlign: "center" }}
            >
              <Chip size="lg" className="text-lg">
                Total Games{" "}
              </Chip>
            </h4>
            <p
              className="ml-2"
              style={{ fontSize: "35px", textAlign: "center" }}
            >
              {stocks.length}
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Image
              alt="Card background"
              className="object-cover rounded-xl"
              src="https://res.cloudinary.com/dhcawltsr/image/upload/v1728298519/Horror_video_game_eb9htc.gif"
              width={200}
            />
          </CardBody>
        </Card>
        <Card className="py-4">
          <CardHeader
            className="pb-0 pt-2 px-4 flex-col items-center" // Change items-start to items-center
            style={{ textAlign: "center" }} // Keep the text alignment for additional safety
          >
            <h4
              className="font-primaryRegular"
              style={{ fontSize: "25px", textAlign: "center" }}
            >
              <Chip size="lg" className="text-lg">
                Total Sales
              </Chip>
            </h4>
            <p
              className="ml-2"
              style={{ fontSize: "35px", textAlign: "center" }}
            >
              Rs.{sales.reduce((sum, sale) => sum + sale.price, 0).toFixed(2)}
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Image
              alt="Card background"
              className="object-cover rounded-xl"
              src="https://res.cloudinary.com/dhcawltsr/image/upload/v1728298312/Coins_vwunuh.gif"
              width={200}
            />
          </CardBody>
        </Card>
      </div>
      <div className="flex gap-4 mb-4">
        <Input
          className="w-64 font-primaryRegular"
          placeholder="Search by game title"
          startContent={<SearchIcon size={18} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          className="w-48 font-primaryRegular text-black"
          placeholder="Select time frame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          <SelectItem value="daily" className="text-black">
            Daily
          </SelectItem>
          <SelectItem value="weekly" className="text-black">
            Weekly
          </SelectItem>
          <SelectItem value="monthly" className="text-black">
            Monthly
          </SelectItem>
          <SelectItem value="yearly" className="text-black">
            Yearly
          </SelectItem>
        </Select>
        <Button
          onClick={generatePDFReport}
          color="primary"
          className="font-primaryRegular"
        >
          Generate PDF Report
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8">Genre Distribution</Chip>
            
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {genreChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
        <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Price Range Distribution</Chip>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8">
      <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Game Prices And Discounts</Chip>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredStocks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="AssignedGame.title"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="UnitPrice" fill="#82ca9d" name="Price ($)" />
            <Bar dataKey="discount" fill="#8884d8" name="Discount (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8">
      <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Sales By Game</Chip>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              fill="#82ca9d"
              stroke="#82ca9d"
              name="Sales ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8">
      <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Sales Over Time</Chip>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={salesTimeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              name="Sales ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8">
      <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Game Selling Performance</Chip>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart outerRadius={150} data={genrePerformanceData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="genre" />
            <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
            <Radar
              name="Total Revenue"
              dataKey="totalRevenue"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Total Sales"
              dataKey="totalSales"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8">
      <Chip variant="dot" size="lg" style={{fontSize:'20px'}} className="mt-8 mb-8">Prices vs Sales</Chip>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="price" name="Price" unit="$" />
            <YAxis type="number" dataKey="sales" name="Sales" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Price vs Sales" data={priceVsSales} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/*
      <div className="mt-8">
        <h2 className="text-xl font-primaryRegular mb-2">Top Selling Games</h2>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={topPerformers}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#000000"
            fill="#b9b5e9"
          >
            <Tooltip />
          </Treemap>
        </ResponsiveContainer>
      </div>*/}
    </div>
  );
};

export default Analytics;
