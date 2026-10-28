// =========================================
// BrainCare AI - Settings JavaScript
// =========================================


// =========================================
// GET ELEMENTS
// =========================================

const accountName = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");

const language = document.getElementById("language");
const timezone = document.getElementById("timezone");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const scanNotification =
    document.getElementById("scanNotification");

const reportNotification =
    document.getElementById("reportNotification");

const emailNotification =
    document.getElementById("emailNotification");

const privateAccount =
    document.getElementById("privateAccount");

const saveSettingsBtn =
    document.getElementById("saveSettingsBtn");

const cancelSettingsBtn =
    document.getElementById("cancelSettingsBtn");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");


// =========================================
// DEFAULT SETTINGS
// =========================================

const defaultSettings = {

    accountName: "Bhaskar Roy",

    accountEmail: "bhaskar@example.com",

    language: "english",

    timezone: "IST",

    scanNotification: true,

    reportNotification: true,

    emailNotification: true,

    privateAccount: true
};


// =========================================
// LOAD SETTINGS
// =========================================

function loadSettings() {

    const savedSettings =
        JSON.parse(
            localStorage.getItem("brainCareSettings")
        );

    const settings =
        savedSettings || defaultSettings;


    accountName.value =
        settings.accountName || "Bhaskar Roy";

    accountEmail.value =
        settings.accountEmail || "bhaskar@example.com";

    language.value =
        settings.language || "english";

    timezone.value =
        settings.timezone || "IST";


    scanNotification.checked =
        settings.scanNotification;

    reportNotification.checked =
        settings.reportNotification;

    emailNotification.checked =
        settings.emailNotification;

    privateAccount.checked =
        settings.privateAccount;
}


// Load settings when page opens

loadSettings();


// =========================================
// SAVE SETTINGS
// =========================================

saveSettingsBtn.addEventListener(
    "click",
    function () {

        const name =
            accountName.value.trim();

        const email =
            accountEmail.value.trim();


        // Basic validation

        if (name === "") {

            alert(
                "Please enter your full name."
            );

            accountName.focus();

            return;
        }


        if (email === "") {

            alert(
                "Please enter your email address."
            );

            accountEmail.focus();

            return;
        }


        const settings = {

            accountName: name,

            accountEmail: email,

            language: language.value,

            timezone: timezone.value,

            scanNotification:
                scanNotification.checked,

            reportNotification:
                reportNotification.checked,

            emailNotification:
                emailNotification.checked,

            privateAccount:
                privateAccount.checked
        };


        // Save settings

        localStorage.setItem(
            "brainCareSettings",
            JSON.stringify(settings)
        );


        // Also update profile name

        const savedProfile =
            JSON.parse(
                localStorage.getItem(
                    "brainCareProfile"
                )
            );


        if (savedProfile) {

            savedProfile.fullName = name;
            savedProfile.email = email;

            localStorage.setItem(
                "brainCareProfile",
                JSON.stringify(savedProfile)
            );
        }


        alert(
            "Settings saved successfully!"
        );
    }
);


// =========================================
// CANCEL SETTINGS
// =========================================

cancelSettingsBtn.addEventListener(
    "click",
    function () {

        loadSettings();

        alert(
            "Changes have been cancelled."
        );
    }
);


// =========================================
// CHANGE PASSWORD
// =========================================

changePasswordBtn.addEventListener(
    "click",
    function () {

        const current =
            currentPassword.value.trim();

        const newPass =
            newPassword.value.trim();

        const confirmPass =
            confirmPassword.value.trim();


        // Validation

        if (current === "") {

            alert(
                "Please enter your current password."
            );

            currentPassword.focus();

            return;
        }


        if (newPass === "") {

            alert(
                "Please enter a new password."
            );

            newPassword.focus();

            return;
        }


        if (newPass.length < 6) {

            alert(
                "New password must contain at least 6 characters."
            );

            newPassword.focus();

            return;
        }


        if (confirmPass === "") {

            alert(
                "Please confirm your new password."
            );

            confirmPassword.focus();

            return;
        }


        if (newPass !== confirmPass) {

            alert(
                "New password and confirmation password do not match."
            );

            confirmPassword.focus();

            return;
        }


        /*
            Frontend demo only.

            Real password verification and password
            storage will be implemented in the backend.
        */

        alert(
            "Password change request submitted successfully!"
        );


        // Clear password fields

        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
    }
);


// =========================================
// NOTIFICATION SETTINGS
// =========================================

scanNotification.addEventListener(
    "change",
    function () {

        console.log(
            "Scan notifications:",
            this.checked
        );
    }
);


reportNotification.addEventListener(
    "change",
    function () {

        console.log(
            "Report notifications:",
            this.checked
        );
    }
);


emailNotification.addEventListener(
    "change",
    function () {

        console.log(
            "Email notifications:",
            this.checked
        );
    }
);


// =========================================
// PRIVATE ACCOUNT
// =========================================

privateAccount.addEventListener(
    "change",
    function () {

        console.log(
            "Private account:",
            this.checked
        );
    }
);


// =========================================
// UPDATE PROFILE NAME IN TOP BAR
// =========================================

function updatePatientName() {

    const patientName =
        document.querySelector(
            ".patient-profile strong"
        );


    if (patientName) {

        patientName.textContent =
            accountName.value ||
            "Bhaskar Roy";
    }
}


updatePatientName();


// =========================================
// UPDATE NAME WHEN SAVING
// =========================================

saveSettingsBtn.addEventListener(
    "click",
    function () {

        setTimeout(
            function () {

                updatePatientName();

            },
            100
        );
    }
);