const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { print } = require("pdf-to-printer");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/print", async (req, res) => {
  let vouchers = req.body.voucher;

  if (!vouchers) return res.send("No voucher selected");

  if (!Array.isArray(vouchers)) {
    vouchers = [vouchers];
  }

  for (const v of vouchers) {
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
  }

  res.send("Printing started...");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});