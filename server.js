const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const { exec } = require("child_process");

const app = express();

app.use(express.urlencoded({ extended: true }));

// HOME PAGE
app.get("/", (req, res) => {

  const results = [];

  fs.createReadStream("vouchers.txt")
    .pipe(csv({ separator: "\t" }))
    .on("data", (data) => results.push(data))
    .on("end", () => {

      let html = `
        <h2>Voucher Printer Panel</h2>
        <form method="POST" action="/print">
      `;

      results.forEach(v => {

        html += `
          <label>
            <input type="checkbox" name="voucher" value="${v.username}">
            ${v.username} - ${v.validity}
          </label><br>
        `;

      });

      html += `
        <br><button type="submit">PRINT SELECTED</button>
        </form>
      `;

      res.send(html);

    });

});

// PRINT ROUTE
app.post("/print", (req, res) => {

  let selected = req.body.voucher;

  if (!selected) return res.send("No voucher selected");

  if (!Array.isArray(selected)) {
    selected = [selected];
  }

  const results = [];

  fs.createReadStream("vouchers.txt")
    .pipe(csv({ separator: "\t" }))
    .on("data", (data) => results.push(data))
    .on("end", () => {

      let outputHTML = `
<!DOCTYPE html>
<html>
<head>
<title>Voucher Print</title>

<style>
  @page {
    size: letter;
    margin: 10mm;
  }

  body {
    font-family: Arial;
    font-size: 14px;
    margin: 0;
    padding: 0;
  }

  /* 🔥 4 COLUMNS */
  .page {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 5px;
  }

  .voucher {
    border: 1.5px dashed #000;
    padding: 10px;
    height: 180px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .line {
    font-size: 12px;
    margin: 2px 0;
  }

  @media print {
    button { display: none; }
  }
</style>

</head>

<body>

<div class="page">

`;

      results.forEach(v => {

        if (selected.includes(v.username)) {

          outputHTML += `
            <div class="voucher">

              <div class="title">JIE_WI_FI</div>

              <div class="line">USER: ${v.username}</div>
              <div class="line">PASS: ${v.password}</div>
              <div class="line">GROUP: ${v.vouchergroup}</div>
              <div class="line">TIME: ${v.expirytime}</div>
              <div class="line">VALID: ${v.validity}</div>

            </div>
          `;

        }

      });

      outputHTML += `
</div>

<button onclick="window.print()">PRINT NOW</button>

</body>
</html>
`;

      const fileName = `voucher_${Date.now()}.html`;

      fs.writeFileSync(fileName, outputHTML);

      exec(`start ${fileName}`);

      res.send("Opening 4-column print layout...");

    });

});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});