import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";
import { getUserIdFromToken } from "../utils/user_id_decoder";
import { API_BASE_URL } from "../utils/getAPI";

const DeveloperIncomeTable = () => {
  useAuthCheck();
  const [profileData, setProfileData] = useState(null);
  const token = getToken();
  const userId = getUserIdFromToken(token);
  const componentRef = useRef();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/profile/${userId}`
        );
        if (response.data && response.data.profile) {
          setProfileData(response.data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Developer_Income_Report.pdf");
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  const incomeData = [{ value: profileData.developerAttributes.income }];
  const COLORS = ["#0088FE", "#FFFFFF"];

  return (
    <div>
      <div
        ref={componentRef}
        className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src={profileData.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${profileData.email[0]}&background=random`;
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {profileData.email.split("@")[0]}
            </h2>
            <p className="text-sm text-gray-500">Developer</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm">{profileData.email}</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-lg font-semibold">
                Rs. {profileData.developerAttributes.income.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-gray-500 mt-2">
              Income Visualization
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full text-sm transition duration-300 ease-in-out"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default DeveloperIncomeTable;
