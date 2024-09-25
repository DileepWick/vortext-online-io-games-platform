import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import { toast, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
} from "@nextui-org/react";
import { SearchIcon } from "../src/assets/icons/SearchIcon";
import { DeleteIcon } from "../src/assets/icons/DeleteIcon";

const CommunityDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [reportedArticles, setReportedArticles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("allArticles");
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  useEffect(() => {
    if (activeTab === "allArticles") {
      fetchAllArticles();
    } else if (activeTab === "reportedArticles") {
      fetchReportedArticles();
    }
  }, [activeTab]);

  const fetchAllArticles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8098/articles/getAllArticles");
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
      const response = await axios.get("http://localhost:8098/articles/reported");
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
        await axios.delete(`http://localhost:8098/articles/deleteArticle/${articleId}`);
        toast.success("Article deleted successfully", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        if (activeTab === "allArticles") {
          fetchAllArticles();
        } else {
          fetchReportedArticles();
        }
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
      await axios.post(`http://localhost:8098/articles/dismissReport/${articleId}`);
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

  const filteredItems = useMemo(() => {
    const currentArticles = activeTab === "allArticles" ? articles : reportedArticles;
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

  // Columns definition
  const columns = useMemo(() => [
    { key: "title", label: "TITLE" },
    ...(activeTab === "allArticles" ? [{ key: "author", label: "AUTHOR" }] : []),
    { key: "likes", label: "LIKES" },
    { key: "comments", label: "COMMENTS" },
    ...(activeTab === "reportedArticles" ? [{ key: "reports", label: "REPORTS" }] : []),
    { key: "actions", label: "ACTIONS" },
  ], [activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-grow p-4">
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
            </Tabs>
          </div>
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
                      {columnKey === "author" && activeTab === "allArticles" && (item.uploader?.name || item.uploader?.username)}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityDashboard;