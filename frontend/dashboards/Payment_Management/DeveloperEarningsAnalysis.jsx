import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  Progress,
  Button,
} from '@nextui-org/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE_URL = 'http://localhost:8098';

const DeveloperEarningsAnalysis = () => {
  const [purchaseEarnings, setPurchaseEarnings] = useState([]);
  const [rentalEarnings, setRentalEarnings] = useState([]);
  const [distributedPayments, setDistributedPayments] = useState({});
  const reportRef = useRef(null);

  useEffect(() => {
    fetchPurchaseEarnings();
    fetchRentalEarnings();
    fetchDistributedPayments();
  }, []);

  const fetchPurchaseEarnings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orderItems`);
      if (response.data && response.data.orderHistory) {
        setPurchaseEarnings(response.data.orderHistory);
      }
    } catch (error) {
      console.error("Error fetching purchase earnings:", error);
    }
  };

  const fetchRentalEarnings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentalPayments/`);
      if (response.data && response.data.rentalPayments) {
        setRentalEarnings(response.data.rentalPayments);
      }
    } catch (error) {
      console.error("Error fetching rental earnings:", error);
    }
  };

  const fetchDistributedPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/distributed-payments/all`);
      const payments = response.data.reduce((acc, payment) => {
        acc[payment.paymentId] = payment.amount;
        return acc;
      }, {});
      setDistributedPayments(payments);
    } catch (error) {
      console.error("Error fetching distributed payments:", error);
    }
  };

  const totalEarnings = useMemo(() => {
    const purchaseTotal = purchaseEarnings.reduce((sum, item) => 
      sum + (distributedPayments[item._id] || 0), 0);
    const rentalTotal = rentalEarnings.reduce((sum, item) => 
      sum + (distributedPayments[item._id] || 0), 0);
    return purchaseTotal + rentalTotal;
  }, [purchaseEarnings, rentalEarnings, distributedPayments]);

  const monthlyEarnings = useMemo(() => {
    const monthlyData = {};
    [...purchaseEarnings, ...rentalEarnings].forEach(item => {
      const date = new Date(item.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, purchase: 0, rental: 0 };
      }
      const amount = distributedPayments[item._id] || 0;
      monthlyData[monthYear].total += amount;
      if (purchaseEarnings.includes(item)) {
        monthlyData[monthYear].purchase += amount;
      } else {
        monthlyData[monthYear].rental += amount;
      }
    });
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return aYear - bYear || aMonth - bMonth;
      });
  }, [purchaseEarnings, rentalEarnings, distributedPayments]);

  const topGames = useMemo(() => {
    const gameEarnings = {};
    [...purchaseEarnings, ...rentalEarnings].forEach(item => {
      const gameTitle = item.stockid?.AssignedGame?.title || item.game?.title || 'Unknown Game';
      if (!gameEarnings[gameTitle]) {
        gameEarnings[gameTitle] = 0;
      }
      gameEarnings[gameTitle] += distributedPayments[item._id] || 0;
    });
    return Object.entries(gameEarnings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [purchaseEarnings, rentalEarnings, distributedPayments]);

  const earningsSources = useMemo(() => {
    const purchaseTotal = purchaseEarnings.reduce((sum, item) => 
      sum + (distributedPayments[item._id] || 0), 0);
    const rentalTotal = rentalEarnings.reduce((sum, item) => 
      sum + (distributedPayments[item._id] || 0), 0);
    return [
      { name: 'Purchases', value: purchaseTotal },
      { name: 'Rentals', value: rentalTotal },
    ];
  }, [purchaseEarnings, rentalEarnings, distributedPayments]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const generatePDF = async () => {
    const content = reportRef.current;
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 30;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('developer_earnings_report.pdf');
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Developer Earnings Analysis</h1>
        <Button color="primary" auto onClick={generatePDF}>
          Download PDF Report
        </Button>
      </div>
      
      <div ref={reportRef}>
        <div className="flex flex-col items-center mb-4">
          <Card className="w-full max-w-md">
            <CardBody className="flex flex-col items-center justify-center py-8">
              <p className="text-lg mb-2">Total Earnings</p>
              <p className="text-4xl font-bold mb-4">Rs.{totalEarnings.toFixed(2)}</p>
              <Progress
                aria-label="Loading..."
                size="md"
                value={100}
                color="success"
                className="max-w-md"
              />
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardBody>
              <p className="text-sm mb-2 font-semibold">Earnings by Source</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={earningsSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {earningsSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <p className="text-sm mb-2 font-semibold">Top 5 Games</p>
              {topGames.map((game, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>{game.name}</span>
                    <span>Rs.{game.value.toFixed(2)}</span>
                  </div>
                  <Progress 
                    size="sm" 
                    value={(game.value / topGames[0].value) * 100} 
                    color="primary"
                    className="h-2"
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm mb-2 font-semibold">Monthly Earnings Trend</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                  <Line type="monotone" dataKey="purchase" stroke="#82ca9d" name="Purchases" />
                  <Line type="monotone" dataKey="rental" stroke="#ffc658" name="Rentals" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <p className="text-sm mb-2 font-semibold">Earnings Breakdown</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="purchase" stackId="a" fill="#82ca9d" name="Purchases" />
                  <Bar dataKey="rental" stackId="a" fill="#ffc658" name="Rentals" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeveloperEarningsAnalysis;