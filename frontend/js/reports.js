
// =========================================
// BRAINCARE AI - PATIENT REPORTS
// =========================================

const API_URL = "http://127.0.0.1:5000";

// =========================================
// GET LOGGED-IN USER
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch (error) {
        console.error("Session error:", error);
        return null;
    }
}

// =========================================
// UPDATE PATIENT PROFILE
// =========================================

function updatePatientProfile(user) {
    const name = (user.name || "Patient").trim();
    const words = name.split(/\s+/);

    const initials = words.length > 1
        ? words[0][0] + words[1][0]
        : name.substring(0, 2);

    const avatar = document.getElementById("topAvatar");
    const patientName = document.getElementById("topPatientName");

    if (avatar) avatar.textContent = initials.toUpperCase();
    if (patientName) patientName.textContent = name;
}

// =========================================
// FORMAT DATE
// =========================================

function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(String(value).replace(" ", "T"));

    return isNaN(date.getTime())
        ? value
        : date.toLocaleString();
}

// =========================================
// FORMAT CONFIDENCE
// =========================================

function formatConfidence(value) {
    const confidence = Number(value);

    return Number.isFinite(confidence)
        ? confidence.toFixed(2) + "%"
        : "N/A";
}

// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateSummary(reports) {
    const total = reports.length;

    const totalElement = document.getElementById("totalReports");
    const generatedElement = document.getElementById("generatedReports");
    const latestElement = document.getElementById("latestReport");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (generatedElement) {
        generatedElement.textContent = total;
    }

    if (latestElement) {
        latestElement.textContent = total > 0
            ? formatDate(reports[0].report_date)
            : "No reports";
    }
}

// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {
    return String(value ?? "N/A")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================
// CREATE PROFESSIONAL PDF REPORT
// =========================================

function downloadReport(report, user) {

    const confidence = Number(report.confidence);

    const confidenceText = Number.isFinite(confidence)
        ? confidence.toFixed(2) + "%"
        : "N/A";

    const reportHTML = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>BrainCare AI MRI Report</title>

        <style>

            * {
                box-sizing: border-box;
            }

            body {
                font-family: Arial, Helvetica, sans-serif;
                background: #ffffff;
                color: #172554;
                margin: 0;
                padding: 35px;
            }

            .report-container {
                max-width: 850px;
                margin: auto;
            }

            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 22px;
            }

            .logo {
                font-size: 35px;
                margin-bottom: 5px;
            }

            .header h1 {
                color: #2563eb;
                margin: 5px 0;
                font-size: 30px;
            }

            .header h2 {
                color: #172554;
                font-size: 19px;
                margin: 10px 0;
            }

            .header p {
                color: #64748b;
                font-size: 13px;
            }

            .section {
                margin-top: 28px;
            }

            .section h2 {
                color: #2563eb;
                font-size: 18px;
                padding-bottom: 9px;
                border-bottom: 1px solid #dbeafe;
            }

            .details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            .item {
                padding: 13px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 7px;
                min-width: 0;
            }

            .item strong {
                display: block;
                font-size: 11px;
                color: #64748b;
                margin-bottom: 7px;
                text-transform: uppercase;
            }

            .item span {
                font-size: 14px;
                color: #0f172a;
                overflow-wrap: anywhere;
            }

            .result {
                background: #eff6ff;
                border-left: 5px solid #2563eb;
                border-radius: 7px;
                padding: 20px;
                margin-top: 15px;
            }

            .result h3 {
                font-size: 24px;
                margin: 8px 0;
                color: #172554;
            }

            .confidence {
                font-size: 27px;
                font-weight: bold;
                color: #2563eb;
            }

            .disclaimer {
                margin-top: 30px;
                padding: 16px;
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 7px;
                color: #9a3412;
                font-size: 12px;
                line-height: 1.7;
            }

            .footer {
                margin-top: 35px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 11px;
                line-height: 1.6;
            }

            @page {
                size: A4;
                margin: 15mm;
            }

            @media print {
                body {
                    padding: 0;
                }

                .report-container {
                    max-width: 100%;
                }

                .section,
                .result,
                .disclaimer {
                    break-inside: avoid;
                }
            }

        </style>
    </head>

    <body>

        <div class="report-container">

            <div class="header">
                <div class="logo">🧠</div>

                <h1>BrainCare AI</h1>

                <h2>MRI BRAIN TUMOR DETECTION REPORT</h2>

                <p>AI-Assisted MRI Screening Report</p>
            </div>

            <div class="section">

                <h2>Patient Information</h2>

                <div class="details">

                    <div class="item">
                        <strong>Patient Name</strong>
                        <span>${escapeHTML(user.name || "Patient")}</span>
                    </div>

                    <div class="item">
                        <strong>Patient Email</strong>
                        <span>${escapeHTML(user.email || "N/A")}</span>
                    </div>

                </div>

            </div>

            <div class="section">

                <h2>Scan Information</h2>

                <div class="details">

                    <div class="item">
                        <strong>Report ID</strong>
                        <span>${escapeHTML(report.report_id)}</span>
                    </div>

                    <div class="item">
                        <strong>Scan ID</strong>
                        <span>${escapeHTML(report.scan_id)}</span>
                    </div>

                    <div class="item">
                        <strong>MRI File</strong>
                        <span>${escapeHTML(report.file_name)}</span>
                    </div>

                    <div class="item">
                        <strong>Scan Date</strong>
                        <span>${escapeHTML(formatDate(report.scan_date))}</span>
                    </div>

                    <div class="item">
                        <strong>Report Date</strong>
                        <span>${escapeHTML(formatDate(report.report_date))}</span>
                    </div>

                </div>

            </div>

            <div class="section">

                <h2>AI Analysis Result</h2>

                <div class="result">

                    <strong>Predicted Result</strong>

                    <h3>${escapeHTML(report.prediction || "N/A")}</h3>

                    <strong>AI Confidence</strong>

                    <div class="confidence">
                        ${confidenceText}
                    </div>

                </div>

            </div>

            <div class="disclaimer">

                <strong>⚠ Medical Disclaimer</strong>

                <p>
                    This report contains an AI-assisted screening result
                    and is not a confirmed medical diagnosis. AI predictions
                    may be incorrect. Please consult a qualified radiologist
                    or healthcare professional for clinical evaluation.
                </p>

            </div>

            <div class="footer">

                <strong>BrainCare AI</strong><br>

                MRI Brain Tumor Detection System<br>

                This report was generated electronically.

            </div>

        </div>

        <script>
            window.onload = function () {
                window.print();
            };
        <\/script>

    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups for BrainCare AI.");
        return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHTML);
    printWindow.document.close();
}

// =========================================
// VIEW REPORT
// =========================================

function viewReport(report) {
    alert(
        "MRI REPORT DETAILS\n\n" +
        "Report ID: " + (report.report_id ?? "N/A") + "\n" +
        "Scan ID: " + (report.scan_id ?? "N/A") + "\n" +
        "MRI File: " + (report.file_name || "N/A") + "\n" +
        "Prediction: " + (report.prediction || "N/A") + "\n" +
        "Confidence: " + formatConfidence(report.confidence) + "\n" +
        "Scan Date: " + formatDate(report.scan_date) + "\n" +
        "Report Date: " + formatDate(report.report_date)
    );
}

// =========================================
// SHOW EMPTY STATE
// =========================================

function showEmptyState(message) {
    const tableBody = document.getElementById("reportTableBody");
    const emptyState = document.getElementById("emptyReportState");

    if (tableBody) {
        tableBody.replaceChildren();
    }

    if (emptyState) {
        emptyState.style.display = "block";

        const heading = emptyState.querySelector("h3");
        const paragraph = emptyState.querySelector("p");

        if (heading) {
            heading.textContent = message;
        }

        if (paragraph) {
            paragraph.textContent =
                message === "No Reports Yet"
                    ? "Complete an MRI analysis to generate your first report."
                    : "Please check your connection and try again.";
        }
    }

    updateSummary([]);
}

// =========================================
// DISPLAY REPORTS
// =========================================

function displayReports(reports, user) {
    const tableBody = document.getElementById("reportTableBody");
    const emptyState = document.getElementById("emptyReportState");

    if (!tableBody) {
        console.error("reportTableBody not found in HTML.");
        return;
    }

    tableBody.replaceChildren();

    if (!Array.isArray(reports) || reports.length === 0) {
        showEmptyState("No Reports Yet");
        return;
    }

    reports.sort((a, b) =>
        new Date(String(b.report_date).replace(" ", "T")) -
        new Date(String(a.report_date).replace(" ", "T"))
    );

    if (emptyState) {
        emptyState.style.display = "none";
    }

    reports.forEach(report => {
        const row = document.createElement("tr");

        const values = [
            report.report_id ?? "N/A",
            report.file_name || "Unknown file",
            report.prediction || "N/A",
            formatConfidence(report.confidence),
            formatDate(report.report_date)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "View";

        viewButton.addEventListener("click", () => {
            viewReport(report);
        });

        const downloadButton = document.createElement("button");
        downloadButton.type = "button";
        downloadButton.textContent = "Download";

        downloadButton.addEventListener("click", () => {
            downloadReport(report, user);
        });

        actionCell.append(
            viewButton,
            document.createTextNode(" "),
            downloadButton
        );

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    updateSummary(reports);

    console.log("Reports displayed successfully:", reports.length);
}

// =========================================
// FETCH PATIENT REPORTS
// =========================================

async function loadPatientReports() {
    const user = getLoggedInUser();

    if (!user || !user.id) {
        console.error("No logged-in user found.");
        window.location.href = "login.html";
        return;
    }

    updatePatientProfile(user);

    console.log("Loading reports for user ID:", user.id);

    try {
        const response = await fetch(
            `${API_URL}/api/reports?user_id=${encodeURIComponent(user.id)}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        console.log("API Response:", data);

        if (data.success === false) {
            throw new Error(data.error || "Unable to load reports.");
        }

        const reports = Array.isArray(data)
            ? data
            : data.reports;

        if (!Array.isArray(reports)) {
            throw new Error("Invalid report data received.");
        }

        displayReports(reports, user);

    } catch (error) {
        console.error("REPORT LOADING ERROR:", error);
        showEmptyState("Unable to Load Reports");
    }
}

// =========================================
// INITIALIZE PAGE
// =========================================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPatientReports);
} else {
    loadPatientReports();
}
