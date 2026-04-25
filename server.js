const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const PDFDocument = require("pdfkit");
const { print } = require("pdf-to-printer");

const app = express();
app.use(express.urlencoded({ extended: true }));

// HOME PAGE (dynamic from CSV)
app.get("/", (req, res) => {
  const results = [];

  fs.createReadStream("vouchers.txt")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {

      let html = "<h2>Voucher Printer Panel</h2><form method='POST' action='/print'>";

      results.forEach(v => {
        html += `
          <label>
            <input type="checkbox" name="voucher"
              value="${v.username}|${v.password}|${v.validity}">
            ${v.username} - ${v.validity} sec
          </label><br>
        `;
      });

      html += `
        <br><button type="submit">PRINT SELECTED</button>
      </form>`;

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

  selected.forEach(v => {
    const [user, pass, time] = v.split("|");

    const fileName = `voucher_${Date.now()}.pdf`;

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(fileName);

    doc.pipe(stream);

    doc.fontSize(20).text("WIFI VOUCHER", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`USER: ${user}`);
    doc.text(`PASS: ${pass}`);
    doc.text(`TIME: ${time} sec`);

    doc.end();

    stream.on("finish", async () => {
      await print(fileName);
      console.log("Printed:", fileName);
    });
  });

  res.send("Printing started...");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});