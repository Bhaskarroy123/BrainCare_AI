
// =========================================
// BrainCare AI - Global Navigation
// =========================================

// =========================================
// UPDATE COMMON PATIENT PROFILE
// =========================================

function updatePatientHeader() {
    let user;

    try {
        user = JSON.parse(
            sessionStorage.getItem("user") || "null"
        );
    } catch (error) {
        console.error("User session error:", error);
        return;
    }

    if (!user) return;

    const name = (user.name || "Patient").trim();

    // Always take first two letters of first name
    const firstName = name.split(/\s+/)[0];
    const initials = firstName.substring(0, 2).toUpperCase();

    // Update all patient avatars
    document.querySelectorAll(
        "#topAvatar, .patient-avatar"
    ).forEach(function (avatar) {
        avatar.textContent = initials;
    });

    // Update patient names
    document.querySelectorAll(
        "#topPatientName, .patient-profile strong"
    ).forEach(function (element) {
        element.textContent = name;
    });
}


// =========================================
// GLOBAL NAVIGATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // Update patient profile on every page
    updatePatientHeader();

    const navigationLinks = document.querySelectorAll(
        ".sidebar-nav a"
    );

    navigationLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const text = link.textContent.trim();

            if (text.includes("Dashboard")) {

                event.preventDefault();
                window.location.href = "dashboard.html";

            }

            else if (text.includes("Upload MRI")) {

                event.preventDefault();
                window.location.href = "upload.html";

            }

            else if (text.includes("My Scans")) {

                event.preventDefault();
                window.location.href = "scans.html";

            }

            else if (text.includes("Reports")) {

                event.preventDefault();
                window.location.href = "reports.html";

            }

            else if (text.includes("My Profile")) {

                event.preventDefault();
                window.location.href = "profile.html";

            }

            else if (text.includes("Settings")) {

                event.preventDefault();
                window.location.href = "settings.html";

            }

        });

    });

});
