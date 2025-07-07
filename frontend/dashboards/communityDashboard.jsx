import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import { toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BackgroundBeams } from "../src/components/ui/BackgroundBeams";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_BASE_URL } from "../src/utils/getAPI";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Tabs,
  Tab,
  Pagination,
  Chip,
  Tooltip,
  Card,
  CardBody,
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";
import { Download } from "lucide-react";
import { Bar } from "react-chartjs-2";
import useAuthCheck from "../src/utils/authCheck";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const CommunityPostsChart = ({ data, chartRef }) => {
  if (!data || data.length === 0) {
    return <div>No data available for the chart</div>;
  }

  const chartData = {
    labels: data.map((item) => item.heading || "Untitled Post"),
    datasets: [
      {
        label: "Likes",
        data: data.map((item) => item.likes || 0),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Reports",
        data: data.map((item) => item.reportedBy?.length || 0),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Community Posts: Likes vs Reports",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return (
    <Bar
      ref={chartRef}
      data={chartData}
      options={options}
      style={{ height: "400px" }}
    />
  );
};
const AnalyticsTable = ({ data }) => {
  return (
    <Table aria-label="Analytics table">
      <TableHeader>
        <TableColumn>POST TITLE</TableColumn>
        <TableColumn>LIKES</TableColumn>
        <TableColumn>COMMENTS</TableColumn>
        <TableColumn>REPORTS</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item._id}>
            <TableCell>{item.heading}</TableCell>
            <TableCell>{item.likes || 0}</TableCell>
            <TableCell>{item.comments?.length || 0}</TableCell>
            <TableCell>{item.reportedBy?.length || 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const CommunityDashboard = () => {
  useAuthCheck("Community Manager");
  const [articles, setArticles] = useState([]);
  const [reportedArticles, setReportedArticles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("allArticles");
  const [page, setPage] = useState(1);
  const chartRef = React.useRef(null);

  const rowsPerPage = 5;

  useEffect(() => {
    fetchAllArticles();
    fetchReportedArticles();
  }, []);

  const fetchAllArticles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/articles/getAllArticles`
      );
      setArticles(response.data.articles || []);
      setError("");
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to fetch articles. Please try again.");
      toast.error("Failed to fetch articles. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReportedArticles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/articles/reported`);
      setReportedArticles(response.data.reportedArticles || []);
      setError("");
    } catch (error) {
      console.error("Error fetching reported articles:", error);
      setError("Failed to fetch reported articles. Please try again.");
      toast.error("Failed to fetch reported articles. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/articles/deleteArticle/${articleId}`
        );
        toast.success("Article deleted successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        fetchAllArticles();
        fetchReportedArticles();
      } catch (error) {
        console.error("Error deleting article:", error);
        toast.error("Failed to delete article. Please try again.", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }
    }
  };

  const handleDismissReport = async (articleId) => {
    try {
      await axios.post(`${API_BASE_URL}/articles/dismissReport/${articleId}`);
      toast.success("Report dismissed successfully", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
      fetchReportedArticles();
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast.error("Failed to dismiss report. Please try again.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title and header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Dark blue color
    doc.text("Community Analytics Report", 15, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141); // Gray color
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 30);

    // Add summary statistics
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text(`Total Posts: ${articles.length}`, 15, 45);
    doc.text(`Total Reported Posts: ${reportedArticles.length}`, 15, 55);

    // Add analytics table
    const tableData = articles.map((article) => [
      article.heading,
      article.likes || 0,
      article.comments?.length || 0,
      article.reportedBy?.length || 0,
    ]);

    doc.autoTable({
      startY: 70,
      head: [["Post Title", "Likes", "Comments", "Reports"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
      alternateRowStyles: { fillColor: [241, 245, 249] }, // Light blue alternate rows
    });

    // Add chart on new page
    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addPage();
      doc.text("Analytics Visualization", 15, 20);
      doc.addImage(chartImage, "PNG", 15, 30, 180, 100);
    }

    // Save the PDF
    doc.save("community-analytics.pdf");

    toast.success("PDF downloaded successfully!", {
      theme: "dark",
      transition: Flip,
      style: { fontFamily: "Rubik" },
    });
  };

  const filteredItems = useMemo(() => {
    const currentArticles =
      activeTab === "allArticles" ? articles : reportedArticles;
    return currentArticles.filter((article) =>
      article.heading.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, articles, reportedArticles, searchQuery]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  const columns = useMemo(
    () => [
      { key: "title", label: "TITLE" },
      ...(activeTab === "allArticles"
        ? [{ key: "author", label: "AUTHOR" }]
        : []),
      { key: "likes", label: "LIKES" },
      { key: "comments", label: "COMMENTS" },
      ...(activeTab === "reportedArticles"
        ? [{ key: "reports", label: "REPORTS" }]
        : []),
      { key: "actions", label: "ACTIONS" },
    ],
    [activeTab]
  );

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <BackgroundBeams />
      <Header />

      <main className="flex-grow p-4">
        <h1 className="text-5xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-blue-500 via-orange-500 to-orange-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
          Community Dashboard
        </h1>
        <div className="flex w-full flex-col">
          <div className="flex items-center p-4 font-primaryRegular">
            <Tabs
              aria-label="Community Dashboard Tabs"
              className="flex-1"
              onSelectionChange={setActiveTab}
              selectedKey={activeTab}
              size="lg"
              color="primary"
            >
              <Tab key="allArticles" title="All Articles" />
              <Tab key="reportedArticles" title="Reported Articles" />
              <Tab key="analytics" title="Analytics" />
            </Tabs>
          </div>

          {activeTab === "analytics" && (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  color="primary"
                  endContent={<Download size={16} />}
                  onClick={downloadPDF}
                  className="ml-auto"
                >
                  Download Analytics Report
                </Button>
              </div>
              <div className="grid gap-4">
                <Card>
                  <CardBody>
                    <CommunityPostsChart data={articles} chartRef={chartRef} />
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <AnalyticsTable data={articles} />
                  </CardBody>
                </Card>
              </div>
            </>
          )}

          {activeTab !== "analytics" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <Input
                  className="w-64"
                  placeholder="Search by article title..."
                  startContent={<SearchIcon />}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClear={handleClearSearch}
                />
              </div>
              <Table
                className="text-black"
                aria-label="Articles table"
                bottomContent={
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={Math.ceil(filteredItems.length / rowsPerPage)}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                }
                classNames={{
                  wrapper: "min-h-[222px]",
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={items}>
                  {(item) => (
                    <TableRow key={item._id}>
                      {(columnKey) => (
                        <TableCell>
                          {columnKey === "title" && item.heading}
                          {columnKey === "author" &&
                            activeTab === "allArticles" &&
                            (item.uploader?.name || item.uploader?.username)}
                          {columnKey === "likes" && item.likes}
                          {columnKey === "comments" && item.comments.length}
                          {columnKey === "reports" && (
                            <Chip color="danger" variant="flat">
                              {item.reportedBy.length}
                            </Chip>
                          )}
                          {columnKey === "actions" && (
                            <div className="flex items-center gap-4">
                              <Tooltip
                                content="Delete article"
                                color="danger"
                                className="font-primaryRegular"
                              >
                                <span
                                  className="text-lg text-danger cursor-pointer active:opacity-50"
                                  onClick={() => handleDeleteArticle(item._id)}
                                >
                                  <DeleteIcon />
                                </span>
                              </Tooltip>
                              {activeTab === "reportedArticles" && (
                                <Button
                                  size="sm"
                                  color="warning"
                                  onClick={() => handleDismissReport(item._id)}
                                >
                                  Dismiss Report
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityDashboard;
