import React from "react";
import { Grid, Card, Typography, Box } from "@mui/material";

export default function DashboardPage() {
  // Placeholder values — these can be replaced with real API values later
  const metrics = [
    { label: "Total Protocols", value: 12 },
    { label: "Total Story Points", value: 86 },
    { label: "Completed", value: 34 },
    { label: "Blocked", value: 3 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.label}>
            <Card
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#fafafa",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                {m.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {m.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
