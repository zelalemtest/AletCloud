const express = require("express");
const axios = require("axios");
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
app.get("/telebirr-test", async (req, res) => {
  try {
    const response = await axios.get("https://transactioninfo.ethiotelecom.et/receipt/DHQ46GN88I", {
      timeout: 15000,
     
    });
	const html = response.data
    res.status(200).json({data:html});
  } catch (error) {
    console.error(error.message);

    if (error.response) {
      res.status(error.response.status).type("html").send(error.response.data);
    } else {
      res.status(500).json({
        error: error.message
      });
    }
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
