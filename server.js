require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const TELEBIRR_SECRET = process.env.TELEBIRR_SECRET;

app.get("/", (req, res) => {
  res.json({
    message: "AletCloud IP Test",
    server: "running",
    platform: "AletCloud",
  });
});

app.get("/ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    res.json({
      outbound_ip: data.ip,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not determine outbound IP",
    });
  }
});
app.get("/telebirr-test", async (req, res) => {
  try {
    const response = await axios.get(
      "https://transactioninfo.ethiotelecom.et/receipt/DHQ46GN88I",
      {
        timeout: 15000,
      },
    );
    const html = response.data;
    res.status(200).json({ data: html });
  } catch (error) {
    console.error(error.message);

    if (error.response) {
      res.status(error.response.status).type("html").send(error.response.data);
    } else {
      res.status(500).json({
        error: error.message,
      });
    }
  }
});

app.post("/telebirr", async (req, res) => {
  try {
    // 1. Get secret from header
    const secret = req.headers["x-telebirr-secret"];
    if (!secret) {
      return res
        .status(401)
        .json({
          status: "error",
          status_code: 401,
          error: "Missing secret code",
        });
    }
    // 2. Check secret
    if (secret !== TELEBIRR_SECRET) {
      return res
        .status(403)
        .json({
          status: "error",
          status_code: 403,
          error: "Invalid secret code",
        });
    }
    // 3. Get reference number from body
    const { reference_number } = req.body;
    if (!reference_number) {
      return res
        .status(400)
        .json({
          status: "error",
          status_code: 400,
          error: "reference_number is required",
        });
    }
    // 4. Request Telebirr
    const telebirrUrl = `https://transactioninfo.ethiotelecom.et/receipt/${encodeURIComponent(reference_number)}`;
    const response = await axios.get(telebirrUrl, {
      timeout: 15000,
      responseType: "text",
    });
    // 5. Return Telebirr HTML
    return res
      .status(response.status)
      .json({
        status: "success",
        status_code: response.status,
        reference_number,
        html: response.data,
      });
  } catch (error) {
    console.error("Telebirr request error:", error.message);
    // Telebirr returned an HTTP error
    if (error.response) {
      return res
        .status(error.response.status)
        .json({
          status: "error",
          status_code: error.response.status,
          reference_number: req.body?.reference_number || null,
          error: "Telebirr request failed",
          html: error.response.data,
        });
    }
    // Timeout
    if (error.code === "ECONNABORTED") {
      return res
        .status(504)
        .json({
          status: "error",
          status_code: 504,
          reference_number: req.body?.reference_number || null,
          error: "Telebirr request timed out",
        });
    }
    // Other connection/server error
    return res
      .status(500)
      .json({
        status: "error",
        status_code: 500,
        reference_number: req.body?.reference_number || null,
        error: error.message,
      });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
