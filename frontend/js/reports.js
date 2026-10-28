// =========================================
// BrainCare AI - Dynamic Reports JavaScript
// =========================================


// =========================================
// LOAD DASHBOARD DATA
// =========================================

const storedData =
    localStorage.getItem("brainCareDashboard");


let dashboardData = {
    patientName: "Bhaskar Roy",
    totalScans: 0,
    completedScans: 0,
    averageConfidence: 0,
    latestResult: null,
    latestConfidence: null,
    latestDate: null,
    scans: []
};


// =========================================
// READ SAVED DATA
// =========================================

if (storedData) {

    try {

        dashboardData =
            JSON.parse(storedData);

    } catch (error) {

        console.error(
            "Unable to read BrainCare AI data:",
            error
        );

    }

}


// Make sure scans is an array

if (!Array.isArray(dashboardData.scans)) {

    dashboardData.scans = [];

}


// =========================================
// HTML ELEMENTS
// =========================================

const totalReportsElement =
    document.getElementById("totalReports");


const generatedReportsElement =
    document.getElementById("generatedReports");


const latestReportElement =
    document.getElementById("latestReport");


const reportTableBody =
    document.getElementById("reportTableBody");


const emptyReportState =
    document.getElementById("emptyReportState");


// =========================================
// REPORT DATA
// =========================================

// Reports are generated from actual scans.

const reports = {};


// =========================================
// CREATE REPORTS FROM SCANS
// =========================================

function generateReports() {

    reports = {};

}


// =========================================
// RESULT CSS CLASS
// =========================================

function getResultClass(result) {

    if (!result) {
        return "";
    }


    const value =
        result.toLowerCase();


    if (value.includes("glioma")) {

        return "glioma";

    }


    if (value.includes("meningioma")) {

        return "meningioma";

    }


    if (value.includes("pituitary")) {

        return "pituitary";

    }


    if (
        value.includes("no tumor") ||
        value.includes("no_tumor")
    ) {

        return "no-tumor";

    }


    return "";

}


// =========================================
// FORMAT REPORT ID
// =========================================

function getReportId(index) {

    return "RPT" +
        String(index + 1).padStart(3, "0");

}


// =========================================
// BUILD REPORT OBJECTS
// =========================================

function buildReports() {

    const reportData = {};


    // Newest scan first

    const scans =
        [...dashboardData.scans].reverse();


    scans.forEach(function (scan, index) {

        const reportId =
            getReportId(index);


        reportData[reportId] = {

            reportId: reportId,

            scanId:
                scan.id || "MRI",

            date:
                scan.date || "-",

            fileName:
                scan.fileName || "MRI Scan",

            result:
                scan.result || "Unknown",

            confidence:
                Number(scan.confidence) || 0

        };

    });


    return reportData;

}


// =========================================
// DISPLAY REPORTS
// =========================================

function displayReports() {

    if (!reportTableBody) {

        console.error(
            "reportTableBody was not found."
        );

        return;

    }


    reportTableBody.innerHTML = "";


    const reportList =
        Object.values(reports);


    // =====================================
    // NO REPORTS
    // =====================================

    if (reportList.length === 0) {

        if (emptyReportState) {

            emptyReportState.style.display =
                "block";

        }

        return;

    }


    // Hide empty state

    if (emptyReportState) {

        emptyReportState.style.display =
            "none";

    }


    // =====================================
    // CREATE TABLE ROWS
    // =====================================

    reportList.forEach(function (report) {

        const row =
            document.createElement("tr");


        const resultClass =
            getResultClass(report.result);


        row.innerHTML = `

            <td>

                <strong>
                    ${report.reportId}
                </strong>

            </td>


            <td>
                ${report.date}
            </td>


            <td>

                <span class="result ${resultClass}">
                    ${report.result}
                </span>

            </td>


            <td>

                ${report.confidence.toFixed(1)}%

            </td>


            <td>

                <span class="status generated">
                    Generated
                </span>

            </td>


            <td>

                <button
                    class="view-btn"
                    type="button">

                    View

                </button>


                <button
                    class="download-btn"
                    type="button">

                    Download

                </button>

            </td>

        `;


        // =================================
        // VIEW BUTTON
        // =================================

        const viewButton =
            row.querySelector(".view-btn");


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                function () {

                    viewReport(
                        report.reportId
                    );

                }
            );

        }


        // =================================
        // DOWNLOAD BUTTON
        // =================================

        const downloadButton =
            row.querySelector(".download-btn");


        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                function () {

                    downloadReport(
                        report.reportId
                    );

                }
            );

        }


        reportTableBody.appendChild(row);

    });

}


// =========================================
// VIEW REPORT
// =========================================

function viewReport(reportId) {

    const report =
        reports[reportId];


    if (!report) {

        alert(
            "Report details not found."
        );

        return;

    }


    // Save selected report

    sessionStorage.setItem(
        "selectedReportId",
        report.reportId
    );


    sessionStorage.setItem(
        "selectedReportScanId",
        report.scanId
    );


    sessionStorage.setItem(
        "selectedReportDate",
        report.date
    );


    sessionStorage.setItem(
        "selectedReportPrediction",
        report.result
    );


    sessionStorage.setItem(
        "selectedReportConfidence",
        report.confidence
    );


    // Show report information

    alert(

        "BrainCare AI\n\n" +

        "Report ID: " +
        report.reportId +

        "\n\n" +

        "Scan ID: " +
        report.scanId +

        "\n\n" +

        "MRI File: " +
        report.fileName +

        "\n\n" +

        "Date: " +
        report.date +

        "\n\n" +

        "Result: " +
        report.result +

        "\n\n" +

        "AI Confidence: " +
        report.confidence.toFixed(1) +
        "%"

    );

}


// =========================================
// DOWNLOAD REPORT
// =========================================

function downloadReport(reportId) {

    const report =
        reports[reportId];


    if (!report) {

        alert(
            "Report not found."
        );

        return;

    }


    // Current date and time

    const currentDate =
        new Date();


    const generatedDate =
        currentDate.toLocaleDateString();


    const generatedTime =
        currentDate.toLocaleTimeString();


    // =====================================
    // REPORT CONTENT
    // =====================================

    const reportContent = `

========================================
           BRAINCARE AI
        See Beyond the Scan.
========================================

PATIENT INFORMATION
----------------------------------------
Patient Name : ${dashboardData.patientName}
Patient Type : Patient

REPORT INFORMATION
----------------------------------------
Report ID    : ${report.reportId}
Scan ID      : ${report.scanId}
MRI File     : ${report.fileName}
Scan Date    : ${report.date}

AI ANALYSIS RESULT
----------------------------------------
Detected Condition : ${report.result}
AI Confidence      : ${report.confidence.toFixed(1)}%

Report Status      : Generated

REPORT GENERATED
----------------------------------------
Date : ${generatedDate}
Time : ${generatedTime}

----------------------------------------
MEDICAL DISCLAIMER
----------------------------------------

BrainCare AI is an AI-assisted screening
tool and is not a replacement for
professional medical diagnosis.

The result generated by this system should
not be considered a final medical diagnosis.

Always consult a qualified healthcare
professional for medical advice.

========================================
             BrainCare AI
        See Beyond the Scan.
========================================

`;


    // =====================================
    // CREATE FILE
    // =====================================

    const blob =
        new Blob(
            [reportContent],
            {
                type: "text/plain"
            }
        );


    // Temporary URL

    const url =
        URL.createObjectURL(blob);


    // Download link

    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "BrainCare_AI_" +
        report.reportId +
        "_Report.txt";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    // Release URL

    URL.revokeObjectURL(url);

}


// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateReportSummary() {

    const totalReports =
        Object.keys(reports).length;


    // Total reports

    if (totalReportsElement) {

        totalReportsElement.textContent =
            totalReports;

    }


    // Generated reports

    if (generatedReportsElement) {

        generatedReportsElement.textContent =
            totalReports;

    }


    // Latest report

    if (
        latestReportElement &&
        totalReports > 0
    ) {

        const reportList =
            Object.values(reports);


        latestReportElement.textContent =
            reportList[0].reportId;

    }


    if (
        latestReportElement &&
        totalReports === 0
    ) {

        latestReportElement.textContent =
            "—";

    }

}


// =========================================
// INITIALIZE REPORTS
// =========================================

const generatedReports =
    buildReports();


// Copy generated reports into
// the reports object

Object.assign(
    reports,
    generatedReports
);


// Update page

updateReportSummary();

displayReports();


// =========================================
// DEBUG
// =========================================

console.log(
    "BrainCare AI - Reports"
);


console.log(
    "Total reports:",
    Object.keys(reports).length
);


console.log(
    "Reports data:",
    reports
);