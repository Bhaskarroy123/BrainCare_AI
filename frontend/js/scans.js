// =========================================
// BRAINCARE AI
// MY SCANS - DYNAMIC JAVASCRIPT
// =========================================


// =========================================
// GET SAVED DASHBOARD DATA
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
// LOAD LOCAL STORAGE
// =========================================

if (storedData) {

    try {

        dashboardData = JSON.parse(storedData);

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
// GET HTML ELEMENTS
// =========================================

const totalScansElement =
    document.getElementById("totalScans");


const completedScansElement =
    document.getElementById("completedScans");


const averageConfidenceElement =
    document.getElementById("averageConfidence");


const scanTableBody =
    document.getElementById("scanTableBody");


const emptyState =
    document.getElementById("emptyState");


// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateSummary() {

    const scans =
        dashboardData.scans;


    const totalScans =
        scans.length;


    let totalConfidence = 0;


    // Calculate total confidence

    scans.forEach(function (scan) {

        totalConfidence +=
            Number(scan.confidence) || 0;

    });


    // Calculate average

    let averageConfidence = 0;


    if (totalScans > 0) {

        averageConfidence =
            totalConfidence / totalScans;

    }


    // Save calculated values

    dashboardData.totalScans =
        totalScans;


    dashboardData.completedScans =
        totalScans;


    dashboardData.averageConfidence =
        averageConfidence;


    // Update HTML

    if (totalScansElement) {

        totalScansElement.textContent =
            totalScans;

    }


    if (completedScansElement) {

        completedScansElement.textContent =
            totalScans;

    }


    if (averageConfidenceElement) {

        averageConfidenceElement.textContent =
            averageConfidence.toFixed(1) + "%";

    }

}


// =========================================
// GET RESULT CSS CLASS
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
// CREATE TABLE ROW
// =========================================

function createScanRow(scan) {

    const row =
        document.createElement("tr");


    const result =
        scan.result || "Unknown";


    const confidence =
        Number(scan.confidence) || 0;


    const scanId =
        scan.id || "MRI";


    const date =
        scan.date || "-";


    const fileName =
        scan.fileName || "MRI Scan";


    const resultClass =
        getResultClass(result);


    row.innerHTML = `

        <td>
            <strong>
                ${scanId}
            </strong>
        </td>


        <td>
            ${date}
        </td>


        <td>
            ${fileName}
        </td>


        <td>

            <span class="result ${resultClass}">
                ${result}
            </span>

        </td>


        <td>
            <strong>
                ${confidence.toFixed(1)}%
            </strong>
        </td>


        <td>

            <span class="status completed">
                Completed
            </span>

        </td>


        <td>

            <button
                class="view-btn"
                type="button">

                View

            </button>

        </td>

    `;


    // =====================================
    // VIEW BUTTON
    // =====================================

    const viewButton =
        row.querySelector(".view-btn");


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            function () {

                alert(

                    "BrainCare AI Scan Details\n\n" +

                    "Scan ID: " +
                    scanId +

                    "\n\nMRI File: " +
                    fileName +

                    "\n\nResult: " +
                    result +

                    "\n\nConfidence: " +
                    confidence.toFixed(1) +

                    "%\n\nDate: " +
                    date

                );

            }
        );

    }


    return row;

}


// =========================================
// DISPLAY SCANS
// =========================================

function displayScans() {

    if (!scanTableBody) {

        console.error(
            "scanTableBody was not found."
        );

        return;

    }


    // Clear existing rows

    scanTableBody.innerHTML = "";


    const scans =
        dashboardData.scans;


    // =====================================
    // NO SCANS
    // =====================================

    if (scans.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        return;

    }


    // Hide empty state

    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // =====================================
    // NEWEST SCAN FIRST
    // =====================================

    const reversedScans =
        [...scans].reverse();


    reversedScans.forEach(
        function (scan) {

            const row =
                createScanRow(scan);


            scanTableBody.appendChild(row);

        }
    );

}


// =========================================
// SAVE DATA
// =========================================

function saveDashboardData() {

    localStorage.setItem(
        "brainCareDashboard",
        JSON.stringify(dashboardData)
    );

}


// =========================================
// RUN
// =========================================

updateSummary();

displayScans();

saveDashboardData();


// =========================================
// DEBUG INFORMATION
// =========================================

console.log(
    "BrainCare AI - My Scans"
);


console.log(
    "Total scans:",
    dashboardData.scans.length
);


console.log(
    "Scan data:",
    dashboardData.scans
);