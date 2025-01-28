const sql = require("mssql");
const config = {
    user: "pkv",
    password: "pk123@P",
    server: "92.204.134.229",
    database: "AHR_Demo",

    // user: "Adesh",
    // password: "123456",
    // server: "localhost",
    // database: "AHR_Demo",

    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

const connectToDB = async () => {
    try {
        await sql.connect(config);
        console.log("{ db_Connected! }");
    } catch (err) {
        console.error("Database connection error:", err);
        throw new Error("Database connection failed");
    }
};

module.exports = {
    connectToDB,
    sql
};
