// =========================================
// BrainCare AI - Result JavaScript
// =========================================

// -----------------------------
// Get HTML Elements
// -----------------------------

const resultMRI =
    document.getElementById("resultMRI");

const resultFileName =
    document.getElementById("resultFileName");

const predictionText =
    document.getElementById("predictionText");

const confidenceText =
    document.getElementById("confidenceText");

const confidenceProgress =
    document.getElementById("confidenceProgress");

const summaryPrediction =
    document.getElementById("summaryPrediction");

const summaryConfidence =
    document.getElementById("summaryConfidence");

const reportBtn =
    document.getElementById("reportBtn");


// -----------------------------
// Get Data From Session Storage
// -----------------------------

const savedImage =
    sessionStorage.getItem("mriImage");

const savedFileName =
    sessionStorage.getItem("mriFileName");

const prediction =
    sessionStorage.getItem("mriPrediction");

const confidence =
    Number(
        sessionStorage.getItem("mriConfidence")
    );


// -----------------------------
// Check Prediction Data
// -----------------------------

if (!prediction || isNaN(confidence)) {

    alert(
        "No AI prediction found. Please upload an MRI again."
    );

    window.location.href = "upload.html";

} else {

    // -----------------------------
    // Display MRI Image
    // -----------------------------

    if (savedImage) {

        resultMRI.src = savedImage;

        resultMRI.alt =
            "Uploaded MRI scan";

    } else {

        resultMRI.removeAttribute("src");

        resultMRI.alt =
            "No MRI image available";
    }


    // -----------------------------
    // Display File Name
    // -----------------------------

    if (savedFileName) {

        resultFileName.textContent =
            savedFileName;

    } else {

        resultFileName.textContent =
            "MRI Scan";
    }


    // -----------------------------
    // Display Prediction
    // -----------------------------

    predictionText.textContent =
        prediction;


    // -----------------------------
    // Display Confidence
    // -----------------------------

    confidenceText.textContent =
        confidence.toFixed(1) + "%";


    summaryConfidence.textContent =
        confidence.toFixed(1) + "%";


    // -----------------------------
    // Confidence Progress Bar
    // -----------------------------

    confidenceProgress.style.width =
        confidence + "%";


    // -----------------------------
    // Summary Prediction
    // -----------------------------

    summaryPrediction.textContent =
        prediction +
        " was detected by the AI classification model.";
}


// =========================================
// Save Result To Dashboard
// =========================================

function saveDashboardResult() {

    // -----------------------------
    // Prevent Duplicate Saving
    // -----------------------------

    const resultSaved =
        sessionStorage.getItem("resultSaved");


    if (resultSaved === "true") {

        return;
    }


    // -----------------------------
    // Mark Result As Saved
    // -----------------------------

    sessionStorage.setItem(
        "resultSaved",
        "true"
    );


    // -----------------------------
    // Get Existing Dashboard Data
    // -----------------------------

    const existingData =
        localStorage.getItem(
            "brainCareDashboard"
        );


    let dashboardData;


    // -----------------------------
    // Existing Data
    // -----------------------------

    if (existingData) {

        try {

            dashboardData =
                JSON.parse(existingData);

        } catch (error) {

            console.error(
                "Dashboard data is corrupted:",
                error
            );

            dashboardData = {
                patientName: "Bhaskar Roy",
                totalScans: 0,
                completedScans: 0,
                averageConfidence: 0,
                latestResult: null,
                latestConfidence: null,
                latestDate: null,
                scans: []
            };
        }

    } else {

        // -----------------------------
        // Create New Dashboard Data
        // -----------------------------

        dashboardData = {

            patientName: "Bhaskar Roy",

            totalScans: 0,

            completedScans: 0,

            averageConfidence: 0,

            latestResult: null,

            latestConfidence: null,

            latestDate: null,

            scans: []
        };
    }


    // -----------------------------
    // Make Sure scans Exists
    // -----------------------------

    if (!Array.isArray(dashboardData.scans)) {

        dashboardData.scans = [];
    }


    // -----------------------------
    // Create New Scan
    // -----------------------------

    const newScan = {

        id:
            "MRI" +
            String(
                dashboardData.scans.length + 1
            ).padStart(3, "0"),

        fileName:
            savedFileName ||
            "MRI Scan",

        result:
            prediction,

        confidence:
            confidence,

        date:
            new Date().toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
    };


    // -----------------------------
    // Add Scan To History
    // -----------------------------

    dashboardData.scans.push(
        newScan
    );


    // -----------------------------
    // Update Scan Count
    // -----------------------------

    dashboardData.totalScans =
        dashboardData.scans.length;


    dashboardData.completedScans =
        dashboardData.scans.length;


    // -----------------------------
    // Calculate Average Confidence
    // -----------------------------

    let totalConfidence = 0;


    dashboardData.scans.forEach(
        function (scan) {

            totalConfidence +=
                Number(scan.confidence);
        }
    );


    if (dashboardData.scans.length > 0) {

        dashboardData.averageConfidence =
            totalConfidence /
            dashboardData.scans.length;

    } else {

        dashboardData.averageConfidence = 0;
    }


    // -----------------------------
    // Update Latest Result
    // -----------------------------

    dashboardData.latestResult =
        prediction;


    dashboardData.latestConfidence =
        confidence;


    dashboardData.latestDate =
        newScan.date;


    // -----------------------------
    // Save Dashboard Data
    // -----------------------------

    localStorage.setItem(
        "brainCareDashboard",
        JSON.stringify(
            dashboardData
        )
    );


    // -----------------------------
    // Debug Message
    // -----------------------------

    console.log(
        "Real AI result saved:",
        dashboardData
    );
}


// -----------------------------
// Save Successful Result
// -----------------------------

if (prediction && !isNaN(confidence)) {

    saveDashboardResult();
}


// =========================================
// Generate MRI Report
// =========================================

if (reportBtn) {

    reportBtn.addEventListener(
        "click",
        function () {

            // -----------------------------
            // Current Date & Time
            // -----------------------------

            const currentDate =
                new Date();


            const date =
                currentDate.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            const time =
                currentDate.toLocaleTimeString();


            // -----------------------------
            // Create Report
            // -----------------------------

            const report = `
========================================
           BRAINCARE AI
        See Beyond the Scan.
========================================

MRI ANALYSIS REPORT
----------------------------------------

Patient:
Bhaskar Roy

MRI File:
${savedFileName || "MRI Scan"}

Detected Condition:
${prediction}

AI Confidence:
${confidence.toFixed(1)}%

Analysis Date:
${date}

Analysis Time:
${time}

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


            // -----------------------------
            // Create Text File
            // -----------------------------

            const blob =
                new Blob(
                    [report],
                    {
                        type: "text/plain"
                    }
                );


            // -----------------------------
            // Create Download URL
            // -----------------------------

            const url =
                URL.createObjectURL(
                    blob
                );


            // -----------------------------
            // Create Download Link
            // -----------------------------

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                "BrainCare_AI_MRI_Report.txt";


            // -----------------------------
            // Start Download
            // -----------------------------

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );


            // -----------------------------
            // Release URL
            // -----------------------------

            URL.revokeObjectURL(
                url
            );
        }
    );
}


// =========================================
// BrainCare AI Result Page Complete
// =========================================