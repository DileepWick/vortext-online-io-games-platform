import React, { useMemo } from "react";
import { Card } from "@nextui-org/react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserStats = ({ users }) => {
  // Memoized calculation of the number of users by playerType
  const playerTypeCounts = useMemo(() => {
    const counts = {
      Kid: 0,
      Teenager: 0,
      Adult: 0,
    };

    users.forEach((user) => {
      if (user.playerType === "Kid") counts.Kid += 1;
      if (user.playerType === "Teenager") counts.Teenager += 1;
      if (user.playerType === "Adult") counts.Adult += 1;
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

  return (
    <div>
      {/* Container for the cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
        <Card style={{ flex: "1 1 300px", maxWidth: "300px" }}>
          <div style={{ padding: "16px" }}>
            <h4 style={{ textAlign: "center" }}>Number of Kids</h4>
            <p style={{ fontSize: "24px", textAlign: "center" }}>
              {playerTypeCounts.Kid}
            </p>
          </div>
        </Card>

        <Card style={{ flex: "1 1 300px", maxWidth: "300px" }}>
          <div style={{ padding: "16px" }}>
            <h4 style={{ textAlign: "center" }}>Number of Teenagers</h4>
            <p style={{ fontSize: "24px", textAlign: "center" }}>
              {playerTypeCounts.Teenager}
            </p>
          </div>
        </Card>

        <Card style={{ flex: "1 1 300px", maxWidth: "300px" }}>
          <div style={{ padding: "16px" }}>
            <h4 style={{ textAlign: "center" }}>Number of Adults</h4>
            <p style={{ fontSize: "24px", textAlign: "center" }}>
              {playerTypeCounts.Adult}
            </p>
          </div>
        </Card>
      </div>

      {/* Container for the pie chart */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
        <Card style={{ flex: "1", maxWidth: "600px" }}>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <h4>Player Types Distribution</h4>
            <div style={{ position: "relative", height: "400px" }}>
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStats;
