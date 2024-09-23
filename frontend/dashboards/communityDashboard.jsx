//communityDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab, Card, CardBody, CardFooter, Button } from "@nextui-org/react";
import Header from "../src/components/header";

const CommunityDashBoard = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [reportedPosts, setReportedPosts] = useState([]);

  useEffect(() => {
    if (activeTab === "tab3") {
      fetchReportedPosts();
    }
  }, [activeTab]);

  const fetchReportedPosts = async () => {
    try {
      const response = await axios.get("http://localhost:8098/articles/reported");
      setReportedPosts(response.data.reportedArticles);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
    }
  };

  const handleDismissReport = async (articleId) => {
    try {
      await axios.post(`http://localhost:8098/articles/dismissReport/${articleId}`);
      fetchReportedPosts(); // Refresh the list after dismissing
    } catch (error) {
      console.error("Error dismissing report:", error);
    }
  };

  const handleRemovePost = async (articleId) => {
    try {
      await axios.delete(`http://localhost:8098/articles/deleteArticle/${articleId}`);
      fetchReportedPosts(); // Refresh the list after removing
    } catch (error) {
      console.error("Error removing post:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="flex w-full flex-col">
        <h1 className="text-2xl font-bold mb-4 p-4">Community Dashboard</h1>
        <div className="flex items-center p-4 font-primaryRegular">
          <Tabs
            aria-label="Community Dashboard Tabs"
            className="flex-1"
            onSelectionChange={setActiveTab}
            selectedKey={activeTab}
            size="lg"
            color="primary"
          >
            <Tab key="tab1" title="Post" />
            <Tab key="tab2" title="Chat" />
            <Tab key="tab3" title="Report" />
            <Tab key="tab4" title="Group" />
          </Tabs>
        </div>
        <div className="p-4">
          {activeTab === "tab1" && <div>Still Developing</div>}
          {activeTab === "tab2" && <div>Still Developing</div>}
          {activeTab === "tab3" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reported Posts</h2>
              {reportedPosts.length === 0 ? (
                <p>No reported posts.</p>
              ) : (
                <div className="space-y-4">
                  {reportedPosts.map((post) => (
                    <Card key={post._id} className="bg-gray-800 text-white">
                      <CardBody>
                        <h3 className="text-lg font-semibold">{post.heading}</h3>
                        <p className="text-sm text-gray-400">{post.articleBody.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Reported by: {post.reportedBy.length} user(s)
                        </p>
                      </CardBody>
                      <CardFooter className="justify-end space-x-2">
                        <Button
                          size="sm"
                          color="warning"
                          onClick={() => handleDismissReport(post._id)}
                        >
                          Dismiss Report
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleRemovePost(post._id)}
                        >
                          Remove Post
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "tab4" && <div>Still Developing</div>}
        </div>
      </div>
    </>
  );
};

export default CommunityDashBoard;