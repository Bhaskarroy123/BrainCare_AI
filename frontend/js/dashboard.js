// =========================================
// BRAINCARE AI - PATIENT-WISE DASHBOARD
// =========================================

const API_URL = "http://127.0.0.1:5000";


// =========================================
// GET LOGGED-IN USER
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(
            sessionStorage.getItem("user") || "null"
        );
    } catch (error) {
        console.error("User session error:", error);
        return null;
    }
}


// =========================================
// GET PATIENT INITIALS
// =========================================

function getInitials(name) {
    if (!name) return "P";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(
        String(dateValue).replace(" ", "T")
    );

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString();
}


// =========================================
// UPDATE PATIENT NAME AND AVATAR
// =========================================

function updatePatientName(user) {
    const name = user.name || "Patient";

    const welcomeName = document.querySelector(
        ".welcome-section h1"
    );

    const profileName = document.getElementById(
        "topPatientName"
    );

    const avatar = document.getElementById(
        "topAvatar"
    );

    if (welcomeName) {
        welcomeName.textContent = "Welcome Back, " + name;
    }

    if (profileName) {
        profileName.textContent = name;
    }

    if (avatar) {
        avatar.textContent = getInitials(name);
    }
}


// =========================================
// CALCULATE DASHBOARD DATA
// =========================================

function calculateDashboardData(scans) {
    const totalScans = scans.length;

    const completedScans = scans.filter(
        scan => Boolean(scan.prediction)
    ).length;

    const averageConfidence = totalScans > 0
        ? scans.reduce(
            (sum, scan) =>
                sum + Number(scan.confidence || 0),
            0
        ) / totalScans
        : 0;

    const latestScan = scans.length > 0
        ? scans[0]
        : null;

    return {
        totalScans,
        completedScans,
        averageConfidence,
        latestResult: latestScan
            ? latestScan.prediction
            : null,
        latestConfidence: latestScan
            ? Number(latestScan.confidence)
            : 0,
        latestDate: latestScan
            ? formatDate(latestScan.scan_date)
            : null,
        scans
    };
}


// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateSummaryCards(data) {
    const cards = document.querySelectorAll(
        ".summary-card"
    );

    if (cards.length < 4) return;

    const total = cards[0].querySelector("h2");
    const completed = cards[1].querySelector("h2");
    const latest = cards[2].querySelector("h2");
    const average = cards[3].querySelector("h2");

    if (total) {
        total.textContent = data.totalScans;
    }

    if (completed) {
        completed.textContent = data.completedScans;
    }

    if (latest) {
        latest.textContent = data.latestResult || "—";
    }

    if (average) {
        average.textContent = data.totalScans > 0
            ? data.averageConfidence.toFixed(1) + "%"
            : "—";
    }
}


// =========================================
// UPDATE LATEST RESULT
// =========================================

function updateLatestResult(data) {
    const latestCard = document.querySelector(
        ".latest-result-card"
    );

    if (!latestCard) return;

    const statusBadge = latestCard.querySelector(
        ".status-badge"
    );

    const noResult = latestCard.querySelector(
        ".no-result"
    );

    if (!data.latestResult) {
        if (statusBadge) {
            statusBadge.textContent = "No Analysis";
        }

        if (noResult) {
            noResult.style.display = "flex";
        }

        return;
    }

    if (statusBadge) {
        statusBadge.textContent = "Completed";
    }

    if (!noResult) return;

    noResult.replaceChildren();

    const resultDisplay = document.createElement("div");
    resultDisplay.className = "result-display";

    const resultIcon = document.createElement("div");
    resultIcon.className = "result-icon";
    resultIcon.textContent = "🧠";

    const resultInfo = document.createElement("div");
    resultInfo.className = "result-info";

    const heading = document.createElement("h3");
    heading.textContent = data.latestResult;

    const confidence = document.createElement("p");
    confidence.textContent =
        "AI Confidence: " +
        data.latestConfidence.toFixed(1) + "%";

    const date = document.createElement("p");
    date.textContent =
        "Analysis Date: " + (data.latestDate || "—");

    resultInfo.append(heading, confidence, date);
    resultDisplay.append(resultIcon, resultInfo);
    noResult.appendChild(resultDisplay);

    noResult.style.display = "flex";
}


// =========================================
// UPDATE RECENT SCANS
// =========================================

function updateRecentScans(data) {
    const recentCard = document.querySelector(
        ".recent-scans-card"
    );

    if (!recentCard) return;

    const emptyHistory = recentCard.querySelector(
        ".empty-history"
    );

    let recentList = recentCard.querySelector(
        ".recent-scans-list"
    );

    if (!recentList) {
        recentList = document.createElement("div");
        recentList.className = "recent-scans-list";

        if (emptyHistory) {
            emptyHistory.insertAdjacentElement(
                "afterend",
                recentList
            );
        } else {
            recentCard.appendChild(recentList);
        }
    }

    recentList.replaceChildren();

    if (data.scans.length === 0) {
        recentList.style.display = "none";

        if (emptyHistory) {
            emptyHistory.style.display = "flex";
        }

        return;
    }

    if (emptyHistory) {
        emptyHistory.style.display = "none";
    }

    recentList.style.display = "block";

    data.scans.slice(0, 5).forEach(scan => {
        const item = document.createElement("div");
        item.className = "recent-scan-item";

        const title = document.createElement("h3");
        title.textContent = scan.file_name || "MRI Scan";

        const result = document.createElement("p");
        result.textContent =
            "Prediction: " + (scan.prediction || "Pending");

        const confidence = document.createElement("p");
        confidence.textContent =
            "Confidence: " +
            Number(scan.confidence || 0).toFixed(2) + "%";

        const date = document.createElement("small");
        date.textContent = formatDate(scan.scan_date);

        item.append(title, result, confidence, date);
        recentList.appendChild(item);
    });
}


// =========================================
// LOAD PATIENT SCANS FROM DATABASE
// =========================================

async function loadPatientScans(user) {
    const response = await fetch(
        `${API_URL}/api/scans?user_id=${encodeURIComponent(user.id)}`
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
        throw new Error(
            result.message || "Unable to load patient scans."
        );
    }

    const scans = Array.isArray(result.scans)
        ? result.scans
        : [];

    scans.sort((a, b) => {
        return new Date(b.scan_date) - new Date(a.scan_date);
    });

    return scans;
}


// =========================================
// MAIN DASHBOARD
// =========================================

async function updateDashboard() {
    const user = getLoggedInUser();

    if (!user || !user.id) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    // Update name and avatar immediately.
    updatePatientName(user);

    try {
        const scans = await loadPatientScans(user);

        const data = calculateDashboardData(scans);

        updateSummaryCards(data);
        updateLatestResult(data);
        updateRecentScans(data);

        console.log("Current patient:", user);
        console.log("Patient-specific scans:", scans);

    } catch (error) {
        console.error("Dashboard error:", error);

        alert(
            "Unable to load dashboard data. " +
            "Please check the backend server."
        );
    }
}


// =========================================
// INITIALIZE
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    updateDashboard
);