const express = require("express");
const { connectToDB, sql } = require("./dbconnection");

const app = express();
app.use(express.json());

// New /insertPin endpoint
app.post("/insertPin", async (req, res) => {
    const { mobileNumber, pin } = req.body;
    console.log("Incoming request body for insertPin:", req.body);

    // Log the mobile number before proceeding
    console.log("Mobile Number to be inserted:", mobileNumber);

    try {
        await connectToDB();
        const request = new sql.Request();

        // Define input parameters
        request.input("MobileNumber", sql.VarChar, mobileNumber);
        request.input("Pin", sql.VarChar, pin);

        // Call the stored procedure
        await request.execute("Proc_AppUserConfig");
        
        res.json({ success: true, message: "PIN and mobile number inserted successfully." });
        console.log("Inserted mobile number and PIN successfully.");
    } catch (error) {
        console.error("Error executing insert query:", error);
        res.status(500).json({ error: "Database error." });
    }
});

app.listen(4000, () => {
    console.log("App listening on port:", 4000);
});
