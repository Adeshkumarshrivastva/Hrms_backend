// const express = require("express");
// const { connectToDB, sql } = require("./dbconnection");
// const PDFDocument = require("pdfkit");
// const router = express.Router();

// // /generateSalarySlip endpoint
// router.post("/generateSalarySlip", async (req, res) => {
//     const { ecno, regionId, payYear, payMonth } = req.body;

//     console.log("Incoming request body for generateSalarySlip:", req.body);

//     try {
//         const pool = await connectToDB();
//         const request = new sql.Request(pool);

//         // Set parameters for the stored procedure
//         request.input("StatementType", sql.VarChar, 'EmpWise');
//         request.input("ECNO", sql.VarChar, ecno);
//         request.input("RegionID", sql.Int, regionId); 
//         request.input("PayYear", sql.Int, payYear);
//         request.input("PayMonth", sql.Int, payMonth);
//         request.input("TaxFormat", sql.Int, 0); 

//         // Execute the stored procedure
//         const result = await request.execute("Proc_PrintSalarySlipNew");

//         console.log("Salary details retrieved:", result);

//         if (result.recordset.length > 0) {
//             const salaryDetails = result.recordset[0];

//             // Create PDF
//             const doc = new PDFDocument();
//             const filename = `Salary_Slip_${salaryDetails.ECNO}_${payMonth}_${payYear}.pdf`;
//             res.setHeader('Content-disposition', `attachment; filename=${filename}`);
//             res.setHeader('Content-type', 'application/pdf');

//             // Add content to the PDF
//             doc.fontSize(25).text('Salary Slip', { align: 'center' });
//             doc.moveDown();



//            doc.fontSize(16).text(`Employee ID: ${salaryDetails.ECNO}`);
//             doc.text(`Name: ${salaryDetails.EmpFName}`);
//             doc.text(`Pay Period: ${salaryDetails.PayPeriod}`);
//             doc.text(`Region: ${salaryDetails.RegionName}`);
//             doc.text(`Branch: ${salaryDetails.Brname}`);
//             doc.text(`Basic Pay: ${salaryDetails.MBasic}`);
//             doc.text(`PAN No: ${salaryDetails.PanNo}`);
//             doc.text(`Retirement Date: ${salaryDetails.DOR}`);
//             doc.text(`Working Days: ${salaryDetails.WorkingDay}`);
//             doc.text(`Grade: ${salaryDetails.CadreName}`);
//             doc.text(`Account No: ${salaryDetails.SalaryAc}`);

//             // Earnings Section
//             doc.moveDown().fontSize(20).text('Earnings', { underline: true });
//             doc.fontSize(16).text(`Basic: ${salaryDetails.Basic}`);
//             doc.text(`DA: ${salaryDetails.DA}`);
//             doc.text(`HRA: ${salaryDetails.HRA}`);
//             doc.text(`Special Allowance: ${salaryDetails.SpecialAllowance}`);
//             doc.text(`DA on Special Allowance: ${salaryDetails.DAOnSpAllow}`);
//             doc.text(`CCA: ${salaryDetails.CCAAmount}`);
//             doc.text(`Conveyance Allowance: ${salaryDetails.ConveyanceAllowance}`);
//             doc.text(`Deputation Allowance: ${salaryDetails.DeputationAllowance}`);
//             doc.text(`Washing Allowances: ${salaryDetails.WashingAllowances}`);
//             doc.text(`Cycle Allowance: ${salaryDetails.CycleAllowance}`);
//             doc.text(`Closing Allowance: ${salaryDetails.ClosingAllowance}`);
//             doc.text(`Officiating Pay: ${salaryDetails.OfficiatingPay}`);
//             doc.text(`LTC: ${salaryDetails.LTC}`);
//             doc.text(`Medical: ${salaryDetails.Medical}`);
//             doc.text(`Arrear: ${salaryDetails.Arrear}`);
//             doc.text(`Over Time: ${salaryDetails.OverTime}`);
//             doc.text(`Transportation Charge: ${salaryDetails.TransportationCharge}`);
//             doc.text(`Other Allowance: ${salaryDetails.OtherAllowance}`);
//             doc.text(`Graduation Pay: ${salaryDetails.GraduationPay}`);
//             doc.text(`Head Cashier: ${salaryDetails.HeadCashier}`);
//             doc.text(`Location Allowance: ${salaryDetails.LocationAllowance}`);
//             doc.text(`Learning Allowance: ${salaryDetails.LearningAllowance}`);
//             doc.text(`Gross Income: ${salaryDetails.GrossIncome}`);

//             // Deductions Section
//             doc.moveDown().fontSize(20).text('Deductions', { underline: true });
//             doc.fontSize(16).text(`PF/NPS: ${salaryDetails.PFNPSArrearEMI}`);
//             doc.text(`VPF: ${salaryDetails.VPF}`);
//             doc.text(`TDS: ${salaryDetails.TDS}`);
//             doc.text(`Housing Loan: ${salaryDetails.HousingLoan}`);
//             doc.text(`Add Housing Loan: ${salaryDetails.AddHousingLoanACNo}`);
//             doc.text(`Support Housing Loan 1: ${salaryDetails.AddHousingLoan1ACNo}`);
//             doc.text(`Support Housing Loan 2: ${salaryDetails.AddHousingLoan2ACNo}`);
//             doc.text(`Support Housing Loan 3: ${salaryDetails.AddHousingLoan3ACNo}`);
//             doc.text(`Support Housing Loan 4: ${salaryDetails.AddHousingLoan4ACNo}`);
//             doc.text(`Support Housing Loan 5: ${salaryDetails.AddHousingLoan5ACNo}`);
//             doc.text(`Vehicle Loan 1: ${salaryDetails.VehicleLoan1Amt}`);
//             doc.text(`Vehicle Loan 2: ${salaryDetails.VehicleLoan2Amt}`);
//             doc.text(`Festival Advance: ${salaryDetails.FestivalAdvance}`);
//             doc.text(`GIS: ${salaryDetails.GIS}`);
//             doc.text(`Union: ${salaryDetails.MUNION}`);
//             doc.text(`SC/ST Kalyan Sansthan: ${salaryDetails.SC_ST_KalyanSangthan}`);
//             doc.text(`Sports Club: ${salaryDetails.US3SportClubACNo}`);
//             doc.text(`Salary Saving: ${salaryDetails.SalSaving}`);
//             doc.text(`BUPG Employee Welfare Fund: ${salaryDetails.BUPGBEmpWelfareFund}`);
//             doc.text(`Bank Cooperative Society: ${salaryDetails.BankCooperativeSociety}`);
//             doc.text(`AKGB Society: ${salaryDetails.AKGB_Society}`);
//             doc.text(`Salary Advance Recovery: ${salaryDetails.AdvanceSalary_Recovery}`);
//             doc.text(`Exigency Loan: ${salaryDetails.ExigencyLoan}`);
//             doc.text(`Recovery Loan: ${salaryDetails.RecoveryLoan}`);
//             doc.text(`Other Deductions: ${salaryDetails.OtherDeduction}`);
//             doc.text(`Other Loan 1 EMI: ${salaryDetails.OtherLoan1EMI}`);
//             doc.text(`Other Loan 2 EMI: ${salaryDetails.OtherLoan2EMI}`);
//             doc.text(`Loan Against PF: ${salaryDetails.LoanAgainstPFAmt}`);
//             doc.text(`PF NRW Amount: ${salaryDetails.PFNRWAmt}`);
//             doc.text(`COVID-19 EMI: ${salaryDetails.Covid19EMI}`);

//             // Total Deduction and Net Pay
//             doc.moveDown().fontSize(20).text('Summary', { underline: true });
//             doc.fontSize(16).text(`Total Deduction: ${salaryDetails.TotalDeduction}`);
//             doc.text(`Net Pay: ${salaryDetails.NetPay}`);

//             // Tax Section
//             doc.moveDown().fontSize(20).text('Tax Details', { underline: true });
//             doc.fontSize(16).text(`Annual Gross: ${salaryDetails.A_GrossIncome_NewTax}`);
//             doc.text(`Other Income: ${salaryDetails.B_InstOnOldNSC_NewTax}`);
//             doc.text(`Total Income: ${salaryDetails.C_Gross_Total_Income_AB_NewTax}`);
//             doc.text(`Standard Deduction: ${salaryDetails.O_TDS_Deducted_At_Source_NewTax}`);
//             doc.text(`Net Income: ${salaryDetails.C_Gross_Total_Income_NewTax}`);
//             doc.text(`Up to 3 Lac: ${salaryDetails.AmtFor25Per_NewTax}`);
//             doc.text(`3 to 6 Lac: ${salaryDetails.Tax5Per_NewTax}`);
//             doc.text(`6 to 9 Lac: ${salaryDetails.Tax10Per_NewTax}`);
//             doc.text(`9 to 12 Lac: ${salaryDetails.TaxPer15_NewTax}`);
//             doc.text(`12 to 15 Lac: ${salaryDetails.Tax20Per_NewTax}`);
//             doc.text(`Above 15 Lac: ${salaryDetails.Tax30Per_NewTax}`);
//             doc.text(`Income Tax: ${salaryDetails.J_Income_Tax_NewTax}`);
//             doc.text(`Less Rebate 87A: ${salaryDetails.K_Less_Rebate87A_NewTax}`);
//             doc.text(`Income Tax Payable: ${salaryDetails.L_Income_Tax_Payable_NewTax}`);
//             doc.text(`Add Cess: ${salaryDetails.M_AddCess_NewTax}`);
//             doc.text(`Net Tax Payable: ${salaryDetails.N_Net_Tax_Payable_LM_NewTax}`);
//             doc.text(`TDS (Monthly): ${salaryDetails.TDS_Per_Month_NewTax}`);
//             doc.text(`Net Tax Liability: ${salaryDetails.P_Net_Income_Tax_Liability_NO_NewTax}`);


//             doc.end();
//             doc.pipe(res);
//         } else {
//             res.status(404).json({ message: "No salary details found" });
//         }
//     } catch (error) {
//         console.error("Error generating salary slip:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// module.exports = router;
