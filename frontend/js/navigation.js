// =========================================
// BrainCare AI - Global Navigation
// =========================================

document.addEventListener("DOMContentLoaded", function () {

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