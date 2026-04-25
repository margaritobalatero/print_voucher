const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// show page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// print selected vouchers
app.post("/print", (req, res) => {
  let vouchers = req.body.voucher;

  if (!vouchers) {
    return res.send("No voucher selected");
  }

  // if only one checkbox selected, convert to array
  if (!Array.isArray(vouchers)) {
    vouchers = [vouchers];
  }

  vouchers.forEach(v => {
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

    // HERE you will send to printer later
    // printer.print(receipt);
  });

  res.send("Printed successfully!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});