import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
} from "@nextui-org/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { API_BASE_URL } from "../../src/utils/getAPI";

const IncomeExpenseAnalysis = () => {
  const [allPaymentsData, setAllPaymentsData] = useState([]);
  const [rentalPaymentsData, setRentalPaymentsData] = useState([]);
  const [analysisData, setAnalysisData] = useState({
    income: 0,
    expenses: 0,
    netProfit: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allPaymentsResponse = await axios.get(`${API_BASE_URL}/orderItems`);
      const rentalPaymentsResponse = await axios.get(
        `${API_BASE_URL}/rentalPayments/`
      );

      setAllPaymentsData(allPaymentsResponse.data.orderHistory || []);
      setRentalPaymentsData(rentalPaymentsResponse.data.rentalPayments || []);

      calculateAnalysis(
        allPaymentsResponse.data.orderHistory,
        rentalPaymentsResponse.data.rentalPayments
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateAnalysis = (allPayments, rentalPayments) => {
    let income = 0;
    let expenses = 0;
    const monthlyStats = {};

    // Calculate for AllPayments
    allPayments.forEach((payment) => {
      const salePrice = payment.order?.paymentAmount || 0;
      const devFunds = salePrice * 0.7;
      const discount =
        (payment.stockid?.discount / 100) * payment.stockid?.UnitPrice || 0;

      income += salePrice - devFunds;
      expenses += devFunds + discount;

      updateMonthlyStats(
        payment.date,
        salePrice - devFunds,
        devFunds + discount,
        monthlyStats
      );
    });

    // Calculate for RentalPayments
    rentalPayments.forEach((payment) => {
      const amount = payment.amount || 0;
      const devFunds = amount * 0.7;

      income += amount - devFunds;
      expenses += devFunds;

      updateMonthlyStats(
        payment.date,
        amount - devFunds,
        devFunds,
        monthlyStats
      );
    });

    const netProfit = income - expenses;

    setAnalysisData({ income, expenses, netProfit });
    setMonthlyData(
      Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses,
          netProfit: data.income - data.expenses,
        }))
        .sort((a, b) => new Date(a.month) - new Date(b.month))
    );
  };

  const updateMonthlyStats = (date, income, expenses, monthlyStats) => {
    const month = new Date(date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!monthlyStats[month]) {
      monthlyStats[month] = { income: 0, expenses: 0 };
    }
    monthlyStats[month].income += income;
    monthlyStats[month].expenses += expenses;
  };

  const chartData = [
    { name: "Income", value: analysisData.income, fill: "#8884d8" },
    { name: "Expenses", value: analysisData.expenses, fill: "#82ca9d" },
    { name: "Net Profit", value: analysisData.netProfit, fill: "#ffc658" },
  ];

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return "N/A";
    return (((current - previous) / previous) * 100).toFixed(2) + "%";
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Add title
    pdf.setFontSize(18);
    pdf.text("Income and Expense Analysis Report", pdfWidth / 2, 20, {
      align: "center",
    });

    // Convert charts to images
    const barChartImage = await toPng(document.querySelector(".bar-chart"));
    const lineChartImage = await toPng(document.querySelector(".line-chart"));

    // Add bar chart
    pdf.addImage(barChartImage, "PNG", margin, 30, pdfWidth - 2 * margin, 70);

    // Add line chart
    pdf.addImage(lineChartImage, "PNG", margin, 110, pdfWidth - 2 * margin, 70);

    // Add detailed analysis
    pdf.setFontSize(14);
    pdf.text("Detailed Analysis", margin, 190);
    pdf.setFontSize(12);
    pdf.text(
      `Total Income: Rs. ${analysisData.income.toFixed(2)}`,
      margin,
      200
    );
    pdf.text(
      `Total Expenses: Rs. ${analysisData.expenses.toFixed(2)}`,
      margin,
      210
    );
    pdf.text(
      `Net Profit: Rs. ${analysisData.netProfit.toFixed(2)}`,
      margin,
      220
    );

    // Add percentage changes
    if (monthlyData.length > 1) {
      pdf.text("Percentage Changes (vs Previous Month)", margin, 235);
      pdf.text(
        `Income: ${calculatePercentageChange(
          monthlyData[monthlyData.length - 1].income,
          monthlyData[monthlyData.length - 2].income
        )}`,
        margin,
        245
      );
      pdf.text(
        `Expenses: ${calculatePercentageChange(
          monthlyData[monthlyData.length - 1].expenses,
          monthlyData[monthlyData.length - 2].expenses
        )}`,
        margin,
        255
      );
      pdf.text(
        `Net Profit: ${calculatePercentageChange(
          monthlyData[monthlyData.length - 1].netProfit,
          monthlyData[monthlyData.length - 2].netProfit
        )}`,
        margin,
        265
      );
    }

    // Add note
    pdf.setFontSize(10);
    pdf.text(
      "Note: Income is calculated as the sale price minus DevFunds for both regular and rental payments.",
      margin,
      pdfHeight - 20,
      { maxWidth: pdfWidth - 2 * margin }
    );
    pdf.text(
      "Expenses include discounts from regular sales and DevFunds from rental payments.",
      margin,
      pdfHeight - 15,
      { maxWidth: pdfWidth - 2 * margin }
    );

    // Save the PDF
    pdf.save("Income_Expense_Analysis_Report.pdf");
  };

  return (
    <Card className="w-full" ref={reportRef}>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income and Expense Analysis</h2>
        <Button color="primary" auto onClick={generatePDF}>
          Download PDF Report
        </Button>
      </CardHeader>
      <CardBody>
        <div className="bar-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Divider className="my-4" />

        <h3 className="text-xl font-semibold mb-2">Monthly Trend</h3>
        <div className="line-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#8884d8" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
              <Line type="monotone" dataKey="netProfit" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
      <CardFooter>
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-2">Detailed Analysis</h3>
          <p>Total Income: Rs. {analysisData.income.toFixed(2)}</p>
          <p>Total Expenses: Rs. {analysisData.expenses.toFixed(2)}</p>
          <p>Net Profit: Rs. {analysisData.netProfit.toFixed(2)}</p>

          {monthlyData.length > 1 && (
            <>
              <h4 className="text-lg font-semibold mt-4 mb-2">
                Percentage Changes (vs Previous Month)
              </h4>
              <p>
                Income:{" "}
                {calculatePercentageChange(
                  monthlyData[monthlyData.length - 1].income,
                  monthlyData[monthlyData.length - 2].income
                )}
              </p>
              <p>
                Expenses:{" "}
                {calculatePercentageChange(
                  monthlyData[monthlyData.length - 1].expenses,
                  monthlyData[monthlyData.length - 2].expenses
                )}
              </p>
              <p>
                Net Profit:{" "}
                {calculatePercentageChange(
                  monthlyData[monthlyData.length - 1].netProfit,
                  monthlyData[monthlyData.length - 2].netProfit
                )}
              </p>
            </>
          )}

          <p className="mt-2 text-sm text-gray-600">
            Note: Income is calculated as the sale price minus DevFunds for both
            regular and rental payments. Expenses include discounts from regular
            sales and DevFunds from rental payments.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncomeExpenseAnalysis;
