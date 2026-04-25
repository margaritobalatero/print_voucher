const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Print selected vouchers
app.post("/print", (req, res) => {
  let selected = req.body.voucher;

  if (!selected) {
    return res.send("No voucher selected");
  }

  if (!Array.isArray(selected)) {
    selected = [selected];
  }

  selected.forEach(v => {
    const [user, pass, time] = v.split("|");

    const receipt = `
====================
     WIFI VOUCHER
====================
USER: ${user}
PASS: ${pass}
TIME: ${time} sec
====================
`;

    console.log(receipt);
  });

  res.send("Printed successfully!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});