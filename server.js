const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "AletCloud IP Test",
    server: "running",
    platform: "AletCloud"
  });
});

app.get("/ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    res.json({
      outbound_ip: data.ip
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not determine outbound IP"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
