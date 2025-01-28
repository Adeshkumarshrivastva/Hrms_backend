const express = require("express");
const { connectToDB, sql } = require("./dbconnection");

const app = express();
app.use(express.json());

// Helper function to handle database queries
const executeQuery = async (request, query, inputs = {}) => {
    try {
        // Set input parameters for the query
        Object.keys(inputs).forEach((key) => {
            request.input(key, sql.VarChar, inputs[key]);
        });
        return await request.query(query);
    } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Database error.");
    }
};

// /checkMobile endpoint
app.post("/checkMobile", async (req, res) => {
    const { mobileNumber } = req.body;
    console.log("Incoming request body for checkMobile:", req.body);

    try {
        await connectToDB();
        const request = new sql.Request();
        const query = "SELECT COUNT(*) AS count FROM EmpBasicDetail WHERE MobileNo = @MobileNumber";

        const result = await executeQuery(request, query, { MobileNumber: mobileNumber });
        const exists = result.recordset[0].count > 0;

        res.json({ exists, message: exists ? "Mobile number exists." : `Mobile number ${mobileNumber} does not exist.` });
        console.log(exists ? "Number exists" : "Number does not exist:", mobileNumber);
    } catch (error) {
        res.status(500).json({ error: "Database error." });
    }
});

// /insertPin endpoint
app.post("/insertPin", async (req, res) => {
    const { mobileNumber, pin } = req.body;
    console.log("Incoming request body for insertPin:", req.body);

    try {
        await connectToDB();
        const request = new sql.Request();
        request.input("MobileNumber", sql.VarChar, mobileNumber);
        request.input("Pin", sql.VarChar, pin);

        await request.execute("Proc_AppUserConfig");
        res.json({ success: true, message: "PIN and mobile number inserted successfully." });
        console.log("Inserted mobile number and PIN successfully.");
    } catch (error) {
        res.status(500).json({ error: "Database error." });
    }
});

// /getUserDetails endpoint
app.post("/getUserDetails", async (req, res) => {
    const { mobileNumber } = req.body;
    console.log("Incoming request body for getUserDetails:", req.body);

    try {
        await connectToDB();
        const request = new sql.Request();
        const query = "SELECT ECNO, EmpFName FROM EmpBasicDetail WHERE MobileNo = @MobileNumber";

        const result = await executeQuery(request, query, { MobileNumber: mobileNumber });

        if (result.recordset.length > 0) {
            const userDetails = result.recordset[0];
            res.json({ success: true, name: userDetails.EmpFName, employeeId: userDetails.ECNO });
            console.log("User details retrieved successfully.");
        }
    } catch (error) {
        res.status(500).json({ error: "Database error." });
    }
});

// /generateSalarySlip endpoint
app.post("/generateSalarySlip", async (req, res) => {
    const { ecno, payYear, payMonth, regionId, taxFormat } = req.body;
    console.log("Incoming request body for salary slip:", req.body);

    try {
        await connectToDB();
        const request = new sql.Request();
        request.input("StatementType", sql.VarChar, 'EmpWise');
        request.input("ECNO", sql.VarChar, ecno);
        request.input("PayYear", sql.Int, payYear);
        request.input("PayMonth", sql.Int, payMonth);
        request.input("RegionID", sql.VarChar, regionId);
        request.input("TaxFormat", sql.Int, taxFormat);

        const result = await request.execute("Proc_PrintSalarySlipNew");

        // Check if data was returned
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset,  // Send the fetched data back to the client
                message: "Salary slip data fetched successfully.",
            });
            console.log("Fetched salary slip data:", result.recordset);
        } else {
            res.status(404).json({
                success: false,
                message: "No salary slip data found for the provided ECNO, year, and month."
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Database error while fetching salary slip data."
        });
    }
});

//bindleave
app.post("/bindLeave", async (req, res) => {
    const { ecno } = req.body;
    try {
        await connectToDB();
        const request = new sql.Request();
        request.input("Stype", sql.VarChar, 'CurBal');
        request.input("ECNO", sql.VarChar, ecno);
        const result = await request.execute("Proc_LeaveApplication");
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset,
            });
        } else {
            res.status(404).json({
                success: false,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Database error."
        });
    }
});


//checkForAlreadyApplication
app.post("/checkForAlreadyAppliedLeave", async (req, res) => {
    const { ecno, fromDate, toDate } = req.body;
    // Helper function to parse date strings in 'dd-MM-yyyy' format
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('-').map(Number);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };
    const formattedFromDate = parseDate(fromDate);
    const formattedToDate = parseDate(toDate);
    try {
        await connectToDB();
        const request = new sql.Request();
        request.input("Stype", sql.VarChar, "CheckReApply");
        request.input("ECNO", sql.VarChar, ecno);
        request.input("FromDate", sql.Date, formattedFromDate);
        request.input("ToDate", sql.Date, formattedToDate);
        const result = await request.execute("Proc_LeaveApplication");
        if (result.recordset && result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0],
            });
        } else {
            res.status(404).json({
                success: true,
                message: "matched the data.",
            });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Database error",
            details: error.message,
        });
    }
});

//LeaveTransaction
app.post("/LeaveTransaction", async (req, res) => {
    const {
        ecno, leaveTypeID, fromDate, toDate, Days, address,
        leaveReason, permissionFrom, permissionTo, isLocalStay, chargeHandover,
        uploadfileFullname
    } = req.body;

    const parseDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('-').map(Number);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };
    const formattedFromDate = parseDate(fromDate);
    const formattedToDate = parseDate(toDate);
    const formattedPermissionFrom = parseDate(permissionFrom);
    const formattedPermissionTo = parseDate(permissionTo);

    try {
        await connectToDB();
        const request = new sql.Request();
        request.input("Stype", sql.VarChar, "Apply");
        request.input("ECNO", sql.VarChar, ecno);
        request.input("LeaveTypeID", sql.Int, leaveTypeID);
        request.input("FromDate", sql.Date, formattedFromDate);
        request.input("ToDate", sql.Date, formattedToDate);
        request.input("Days", sql.Numeric, Days);
        request.input("AddressWhenOnLeave", sql.VarChar, address);
        request.input("LeaveReason", sql.VarChar, leaveReason);
        request.input("PermissionFrom", sql.Date, formattedPermissionFrom);
        request.input("PermissionTo", sql.Date, formattedPermissionTo);
        request.input("IsLocalStay", sql.NVarChar, isLocalStay ? "Y" : "N");
        request.input("ChargeHandedOverEC", sql.VarChar, chargeHandover);
        request.input("UploadfileFullName", sql.VarChar, uploadfileFullname);
        const result = await request.execute("Proc_LeaveApplication");
        if (result && result.rowsAffected && result.rowsAffected[0] > 0) {
            res.json({ success: true, message: "Leave application submitted successfully." });
        } else {
            res.status(404).json({ success: false, message: "No record inserted." });
        }
    } catch (error) {
        console.error("Database error:", error.message || error);
        res.status(500).json({ success: false, error: error.message || "Database error." });
    }
});


//LeaveApply
app.get("/LeaveApply", async (req, res) => {
    const { ecno } = req.query;
    try 
    {
        await connectToDB();
        const request = new sql.Request();
        request.input("ECNO", sql.VarChar, ecno);
        const result = await request.query(`SELECT L.LeaveName,LT.FromDate,LT.ToDate,LT.Days,LT.ApplicationStatus FROM LeaveTransaction LT join LeaveTypeMaster L on L.ID=LT.LeaveTypeID WHERE ECNO = @ECNO ORDER BY LT.id DESC`);
        if (result.recordset.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Records found.",
                data: result.recordset,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No leave records found",
            });
        }
    } catch (error) {
        console.error("Error fetching leave data:", error.message || error);
        return res.status(500).json({
            success: false,
            error: error.message || "Error fetching leave data.",
        });
    }
});



// SanctionAuthority

app.post('/SanctionAuthority', async (req, res) => {
    const { ecno, leaveTypeID } = req.body;

    try {
        
        await connectToDB();
        const request = new sql.Request();
        request.input("ECNO", sql.VarChar, ecno);
        request.input("LeaveTypeID", sql.Int, leaveTypeID);
        const result = await request.execute("Proc_LeaveApplicationNewSanctinRule");
        if (result.recordset && result.recordset.length > 0) {
            // Log the entire result for debugging
            console.log(result.recordset);

            // Send the response
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'Sanction authority not found' });
        }

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


