// =========================================
// BRAINCARE AI - PATIENT SCANS
// Fetch scans from SQLite database
// =========================================

const API_URL = "http://127.0.0.1:5000";


// =========================================
// GET LOGGED-IN USER
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch (error) {
        console.error("User session error:", error);
        return null;
    }
}


// =========================================
// PAGE ELEMENTS
// =========================================

const totalScansElement = document.getElementById("totalScans");
const completedScansElement = document.getElementById("completedScans");
const averageConfidenceElement = document.getElementById("averageConfidence");
const scanTableBody = document.getElementById("scanTableBody");
const emptyState = document.getElementById("emptyState");


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue.replace(" ", "T"));

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString();
}


// =========================================
// FORMAT CONFIDENCE
// =========================================

function formatConfidence(value) {
    const confidence = Number(value);

    if (!Number.isFinite(confidence)) {
        return "N/A";
    }

    // Backend confidence is expected as a percentage.
    return confidence.toFixed(2) + "%";
}


// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateSummary(scans) {
    const total = scans.length;

    const completed = scans.filter(
        scan => scan.prediction
    ).length;

    const average = total > 0
        ? scans.reduce(
            (sum, scan) => sum + Number(scan.confidence || 0),
            0
        ) / total
        : 0;

    if (totalScansElement) {
        totalScansElement.textContent = total;
    }

    if (completedScansElement) {
        completedScansElement.textContent = completed;
    }

    if (averageConfidenceElement) {
        averageConfidenceElement.textContent =
            total > 0 ? average.toFixed(2) + "%" : "0%";
    }
}


// =========================================
// DISPLAY EMPTY STATE
// =========================================

function showEmptyState(message) {
    if (scanTableBody) {
        scanTableBody.replaceChildren();
    }

    if (emptyState) {
        emptyState.style.display = "block";
        emptyState.textContent = message;
    }

    updateSummary([]);
}


// =========================================
// DISPLAY SCANS
// =========================================

function displayScans(scans) {
    if (!scanTableBody) {
        console.error("scanTableBody element not found.");
        return;
    }

    scanTableBody.replaceChildren();

    if (!Array.isArray(scans) || scans.length === 0) {
        showEmptyState("No MRI scans found.");
        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    // Newest scans first
    scans.sort((a, b) => {
        return new Date(b.scan_date) - new Date(a.scan_date);
    });

    scans.forEach(scan => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = scan.id ?? "N/A";

        const fileCell = document.createElement("td");
        fileCell.textContent = scan.file_name || "Unknown file";

        const predictionCell = document.createElement("td");
        predictionCell.textContent = scan.prediction || "N/A";

        const confidenceCell = document.createElement("td");
        confidenceCell.textContent =
            formatConfidence(scan.confidence);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(scan.scan_date);

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View";

        viewButton.addEventListener("click", function () {
            alert(
                "MRI Scan Details\n\n" +
                "Scan ID: " + (scan.id ?? "N/A") + "\n" +
                "File: " + (scan.file_name || "N/A") + "\n" +
                "Prediction: " + (scan.prediction || "N/A") + "\n" +
                "Confidence: " + formatConfidence(scan.confidence) + "\n" +
                "Date: " + formatDate(scan.scan_date)
            );
        });

        actionCell.appendChild(viewButton);

        row.appendChild(idCell);
        row.appendChild(fileCell);
        row.appendChild(predictionCell);
        row.appendChild(confidenceCell);
        row.appendChild(dateCell);
        row.appendChild(actionCell);

        scanTableBody.appendChild(row);
    });

    updateSummary(scans);
}


// =========================================
// FETCH PATIENT SCANS FROM BACKEND
// =========================================

async function loadPatientScans() {
    const user = getLoggedInUser();

    if (!user || !user.id) {
        alert("Please log in to view your MRI scans.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/scans?user_id=${encodeURIComponent(user.id)}`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.error || "Unable to load scans.");
        }

        const scans = Array.isArray(data)
            ? data
            : data.scans;

        if (!Array.isArray(scans)) {
            throw new Error("Invalid scan data received from server.");
        }

        displayScans(scans);

    } catch (error) {
        console.error("Error loading scans:", error);

        showEmptyState(
            "Unable to load scans. Please check that the backend is running."
        );
    }
}


// =========================================
// LOAD SCANS WHEN PAGE OPENS
// =========================================

document.addEventListener("DOMContentLoaded", loadPatientScans);