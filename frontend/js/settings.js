
// =========================================
// BRAINCARE AI - PATIENT-WISE SETTINGS
// =========================================


// =========================================
// GET LOGGED-IN USER
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(
            sessionStorage.getItem("user") || "null"
        );
    } catch (error) {
        console.error("Session error:", error);
        return null;
    }
}

const currentUser = getLoggedInUser();

if (!currentUser || !currentUser.id) {
    alert("Please log in to access settings.");
    window.location.href = "login.html";
}


// =========================================
// USER-SPECIFIC STORAGE KEY
// =========================================

const settingsStorageKey = currentUser
    ? `brainCareSettings_${currentUser.id}`
    : null;


// =========================================
// GET ELEMENTS
// =========================================

const accountName = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");

const language = document.getElementById("language");
const timezone = document.getElementById("timezone");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const scanNotification = document.getElementById("scanNotification");
const reportNotification = document.getElementById("reportNotification");
const emailNotification = document.getElementById("emailNotification");
const privateAccount = document.getElementById("privateAccount");

const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");


// =========================================
// DEFAULT SETTINGS
// =========================================

const defaultSettings = {
    language: "english",
    timezone: "IST",
    scanNotification: true,
    reportNotification: true,
    emailNotification: true,
    privateAccount: true
};


// =========================================
// GET PATIENT INITIALS
// =========================================

function getInitials(name) {

    if (!name || !name.trim()) {
        return "P";
    }

    const parts = name.trim().split(/\s+/);

    // Single name: Alex -> AL
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    // Multiple names: Bhaskar Roy -> BR
    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


// =========================================
// UPDATE TOP BAR NAME AND AVATAR
// =========================================

function updatePatientName() {

    if (!currentUser) return;

    const name = currentUser.name || "Patient";
    const initials = getInitials(name);

    const topPatientName = document.getElementById(
        "topPatientName"
    );

    const topAvatar = document.getElementById(
        "topAvatar"
    );

    const patientName = document.querySelector(
        ".patient-profile strong"
    );

    const oldAvatar = document.querySelector(
        ".patient-profile .patient-avatar"
    );

    if (topPatientName) {
        topPatientName.textContent = name;
    }

    if (topAvatar) {
        topAvatar.textContent = initials;
    }

    if (patientName) {
        patientName.textContent = name;
    }

    if (oldAvatar) {
        oldAvatar.textContent = initials;
    }

}


// =========================================
// LOAD SETTINGS
// =========================================

function loadSettings() {

    if (!currentUser || !settingsStorageKey) return;

    let savedSettings = {};

    try {

        savedSettings = JSON.parse(
            localStorage.getItem(settingsStorageKey) || "{}"
        );

    } catch (error) {

        console.error("Unable to load settings:", error);

    }

    const settings = {
        ...defaultSettings,
        ...savedSettings
    };

    // Logged-in account details

    if (accountName) {
        accountName.value = currentUser.name || "";
    }

    if (accountEmail) {
        accountEmail.value = currentUser.email || "";
    }

    // Preferences

    if (language) {
        language.value = settings.language;
    }

    if (timezone) {
        timezone.value = settings.timezone;
    }

    if (scanNotification) {
        scanNotification.checked = settings.scanNotification;
    }

    if (reportNotification) {
        reportNotification.checked = settings.reportNotification;
    }

    if (emailNotification) {
        emailNotification.checked = settings.emailNotification;
    }

    if (privateAccount) {
        privateAccount.checked = settings.privateAccount;
    }

    updatePatientName();

}


// =========================================
// COLLECT SETTINGS
// =========================================

function collectSettings() {

    return {

        language: language
            ? language.value
            : "english",

        timezone: timezone
            ? timezone.value
            : "IST",

        scanNotification: scanNotification
            ? scanNotification.checked
            : true,

        reportNotification: reportNotification
            ? reportNotification.checked
            : true,

        emailNotification: emailNotification
            ? emailNotification.checked
            : true,

        privateAccount: privateAccount
            ? privateAccount.checked
            : true

    };

}


// =========================================
// SAVE SETTINGS
// =========================================

function saveSettings() {

    if (!currentUser || !settingsStorageKey) return;

    try {

        const settings = collectSettings();

        localStorage.setItem(
            settingsStorageKey,
            JSON.stringify(settings)
        );

        alert("Settings saved successfully!");

        updatePatientName();

    } catch (error) {

        console.error("Unable to save settings:", error);

        alert("Unable to save settings.");

    }

}


// =========================================
// CANCEL SETTINGS
// =========================================

function cancelSettings() {

    loadSettings();

    alert("Changes have been cancelled.");

}


// =========================================
// CHANGE PASSWORD
// =========================================

function changePassword() {

    const current = currentPassword
        ? currentPassword.value
        : "";

    const newPass = newPassword
        ? newPassword.value
        : "";

    const confirmPass = confirmPassword
        ? confirmPassword.value
        : "";

    if (!current || !newPass || !confirmPass) {

        alert("Please fill all password fields.");

        return;

    }

    if (newPass.length < 8) {

        alert("New password must contain at least 8 characters.");

        return;

    }

    if (newPass !== confirmPass) {

        alert("New password and confirmation do not match.");

        return;

    }

    alert(
        "Password change is not connected to the backend yet. " +
        "Your password has not been changed."
    );

}


// =========================================
// EVENT LISTENERS
// =========================================

if (saveSettingsBtn) {

    saveSettingsBtn.addEventListener(
        "click",
        saveSettings
    );

}

if (cancelSettingsBtn) {

    cancelSettingsBtn.addEventListener(
        "click",
        cancelSettings
    );

}

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        changePassword
    );

}


// =========================================
// LOGOUT
// =========================================

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", function () {

        sessionStorage.removeItem("user");

    });

}


// =========================================
// INITIALIZE SETTINGS
// =========================================

if (currentUser && currentUser.id) {

    loadSettings();

}

console.log(
    "BrainCare AI - Patient-specific settings loaded."
);
