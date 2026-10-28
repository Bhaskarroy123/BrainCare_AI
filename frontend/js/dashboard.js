// =========================================
// BrainCare AI - Dynamic Dashboard
// =========================================


// =========================================
// GET DASHBOARD DATA
// =========================================

function getDashboardData() {

    const savedData =
        localStorage.getItem("brainCareDashboard");

    if (savedData) {
        return JSON.parse(savedData);
    }

    return {
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


// =========================================
// UPDATE PATIENT NAME
// =========================================

function updatePatientName(data) {

    const welcomeName =
        document.querySelector(".welcome-section h1");

    const profileName =
        document.querySelector(
            ".patient-mini-profile strong"
        );

    const name =
        data.patientName || "Bhaskar Roy";


    if (welcomeName) {
        welcomeName.textContent =
            "Welcome Back, " + name;
    }


    if (profileName) {
        profileName.textContent = name;
    }
}


// =========================================
// UPDATE SUMMARY CARDS
// =========================================

function updateSummaryCards(data) {

    const cards =
        document.querySelectorAll(".summary-card");


    if (cards.length < 4) {
        console.log(
            "Summary cards not found."
        );
        return;
    }


    // Card 1
    const totalScans =
        cards[0].querySelector("h2");

    if (totalScans) {
        totalScans.textContent =
            data.totalScans;
    }


    // Card 2
    const completedScans =
        cards[1].querySelector("h2");

    if (completedScans) {
        completedScans.textContent =
            data.completedScans;
    }


    // Card 3
    const latestResult =
        cards[2].querySelector("h2");

    if (latestResult) {

        latestResult.textContent =
            data.latestResult || "—";
    }


    // Card 4
    const averageConfidence =
        cards[3].querySelector("h2");

    if (averageConfidence) {

        if (data.averageConfidence > 0) {

            averageConfidence.textContent =
                data.averageConfidence.toFixed(1) + "%";

        } else {

            averageConfidence.textContent =
                "—";
        }
    }
}


// =========================================
// UPDATE LATEST RESULT CARD
// =========================================

function updateLatestResult(data) {

    const latestCard =
        document.querySelector(
            ".latest-result-card"
        );


    if (!latestCard) {
        return;
    }


    const statusBadge =
        latestCard.querySelector(
            ".status-badge"
        );


    const noResult =
        latestCard.querySelector(
            ".no-result"
        );


    // No scan yet

    if (!data.latestResult) {

        if (statusBadge) {
            statusBadge.textContent =
                "No Analysis";
        }

        return;
    }


    // Analysis completed

    if (statusBadge) {
        statusBadge.textContent =
            "Completed";
    }


    // Replace "No MRI Scan Yet" area

    if (noResult) {

        noResult.innerHTML = `

            <div class="result-display">

                <div class="result-icon">
                    🧠
                </div>

                <div class="result-info">

                    <h3>
                        ${data.latestResult}
                    </h3>

                    <p>
                        AI Confidence:
                        ${data.latestConfidence.toFixed(1)}%
                    </p>

                    <p>
                        Analysis Date:
                        ${data.latestDate || "—"}
                    </p>

                </div>

            </div>

        `;

        noResult.style.display = "flex";
    }
}


// =========================================
// UPDATE RECENT SCANS
// =========================================

function updateRecentScans(data) {

    const recentCard =
        document.querySelector(
            ".recent-scans-card"
        );


    if (!recentCard) {
        return;
    }


    const emptyHistory =
        recentCard.querySelector(
            ".empty-history"
        );


    if (!data.scans ||
        data.scans.length === 0) {

        if (emptyHistory) {
            emptyHistory.style.display =
                "flex";
        }

        return;
    }


    if (emptyHistory) {
        emptyHistory.style.display =
            "none";
    }
}


// =========================================
// MAIN DASHBOARD UPDATE
// =========================================

function updateDashboard() {

    const data =
        getDashboardData();


    console.log(
        "Dashboard data:",
        data
    );


    updatePatientName(data);

    updateSummaryCards(data);

    updateLatestResult(data);

    updateRecentScans(data);
}


// =========================================
// RUN AFTER PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDashboard();

    }
);