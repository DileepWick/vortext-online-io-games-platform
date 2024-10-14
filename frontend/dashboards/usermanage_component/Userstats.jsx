import React, { useMemo } from "react";
import { Card, Button } from "@nextui-org/react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserStats = ({ users }) => {
  // Memoized calculation of the number of users by playerType and role
  const playerTypeCounts = useMemo(() => {
    const counts = {
      Kid: 0,
      Teenager: 0,
      Adult: 0,
      totalUsers: users.length,
      totalDevelopers: 0,
      totalModerators: 0,
    };

    const moderatorRoles = [
      "Product Manager", 
      "User Manager", 
      "Order Manager", 
      "Session Manager", 
      "Community Manager", 
      "Review Manager", 
      "Support Agent", 
      "Staff Manager", 
      "Payment Manager"
    ];

    users.forEach((user) => {
      if (user.playerType === "Kid") counts.Kid += 1;
      if (user.playerType === "Teenager") counts.Teenager += 1;
      if (user.playerType === "Adult") counts.Adult += 1;
      if (user.role === "Developer") counts.totalDevelopers += 1;
      if (moderatorRoles.includes(user.role)) counts.totalModerators += 1;
    });

    return counts;
  }, [users]);

  // Prepare data for the pie chart
  const chartData = {
    labels: ["Kids", "Teenagers", "Adults"],
    datasets: [
      {
        data: [playerTypeCounts.Kid, playerTypeCounts.Teenager, playerTypeCounts.Adult],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("User Statistics Report", 105, 15, null, null, "center");
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 25);
    
    // Add user statistics
    doc.setFontSize(14);
    doc.text("User Statistics:", 20, 40);
    doc.setFontSize(12);
    doc.text(`Total Users: ${playerTypeCounts.totalUsers}`, 30, 50);
    doc.text(`Total Developers: ${playerTypeCounts.totalDevelopers}`, 30, 60);
    doc.text(`Total Moderators: ${playerTypeCounts.totalModerators}`, 30, 70);
    doc.text(`Number of Kids: ${playerTypeCounts.Kid}`, 30, 80);
    doc.text(`Number of Teenagers: ${playerTypeCounts.Teenager}`, 30, 90);
    doc.text(`Number of Adults: ${playerTypeCounts.Adult}`, 30, 100);
    
    // Add pie chart
    const canvas = document.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 15, 110, 180, 130);
    
    // Save the PDF
    doc.save("user_statistics_report.pdf");
  };

    // Chart options
    const chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 20 // Increase this value to make the font larger
            }
          }
        },
        tooltip: {
          bodyFont: {
            size: 20 // Increase this value to make the tooltip text larger
          },
          titleFont: {
            size: 20 // Increase this value to make the tooltip title larger
          }
        }
      }
    };

  return (
    <div style={{ position: "relative", paddingTop: "40px" ,}}>
      {/* Download Report Button */}
      <Button 
      className=" font-primaryRegular"
        auto 
        color="primary" 
        icon={<Download size={20} />}
        onClick={handleDownloadReport}
        style={{ 
          position: "absolute", 
          top: "-100px",
          right: "10px",
          zIndex: 1
        }}
      >
        Download Report
      </Button>

      {/* Container for the cards */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "30px", 
        marginTop: "50px" 
      }}>
        {/* First row of cards */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "30px" 
        }}>
          <Card style={{ flex: "1", maxWidth: "20%" }}>
            
            <div style={{ padding: "24px" }}>
              <h4  className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Total Users</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.totalUsers}
              </p>
            </div>
          </Card>

          <Card style={{ flex: "1", maxWidth: "20%" }}>
            <div style={{ padding: "24px" }}>
              <h4 className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Total Developers</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.totalDevelopers}
              </p>
            </div>
          </Card>

          <Card style={{ flex: "1", maxWidth: "20%" }}>
            <div style={{ padding: "24px" }}>
              <h4 className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Total Moderators</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.totalModerators}
              </p>
            </div>
          </Card>
        </div>

        {/* Second row of cards */}
        <div style={{ 
          
          display: "flex", 
          justifyContent: "center", 
          gap: "30px" 
        }}>
          <Card style={{ flex: "1", maxWidth: "20%" }}>
            <div style={{ padding: "24px" }}>
              <h4 className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Number of Kids</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.Kid}
              </p>
            </div>
          </Card>

          <Card style={{ flex: "1", maxWidth: "20%" }}>
            <div style={{ padding: "24px" }}>
              <h4 className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Number of Teenagers</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.Teenager}
              </p>
            </div>
          </Card>

          <Card style={{ flex: "1", maxWidth: "20%" }}>
            <div style={{ padding: "24px" }}>
              <h4 className="font-primaryRegular" style={{ textAlign: "center", fontSize: "20px" }}>Number of Adults</h4>
              <p className="font-primaryRegular" style={{ fontSize: "36px", textAlign: "center" }}>
                {playerTypeCounts.Adult}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Container for the pie chart */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", marginBottom: "60px" }}>
        <Card style={{ flex: "1", maxWidth: "900px" }}>
          <div style={{ padding: "24px", textAlign: "center" }}>
            <h4 className="font-primaryRegular" style={{ fontSize: "24px" }}>Player Types Distribution</h4>
            <div style={{ position: "relative", height: "600px" }}>
            <Pie  data={chartData} options={chartOptions} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStats;