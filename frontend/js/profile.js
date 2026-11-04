// =========================================
// BRAINCARE AI - PATIENT-WISE PROFILE
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch (error) {
        console.error("Unable to read user session:", error);
        return null;
    }
}


// =========================================
// GET CURRENT USER
// =========================================

const currentUser = getLoggedInUser();

if (!currentUser || !currentUser.id) {
    alert("Please log in to access your profile.");
    window.location.href = "login.html";
}


// =========================================
// USER-SPECIFIC STORAGE KEY
// =========================================

const profileStorageKey = currentUser
    ? `brainCareProfile_${currentUser.id}`
    : null;


// =========================================
// GET FORM ELEMENTS
// =========================================

const profileForm = document.getElementById("profileForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const dob = document.getElementById("dob");
const gender = document.getElementById("gender");
const bloodGroup = document.getElementById("bloodGroup");
const address = document.getElementById("address");

const cancelBtn = document.getElementById("cancelBtn");


// =========================================
// GET DISPLAY ELEMENTS
// =========================================

const profileName = document.getElementById("profileName");
const topPatientName = document.getElementById("topPatientName");

const profileAvatar = document.getElementById("profileAvatar");
const topAvatar = document.getElementById("topAvatar");

const patientId = document.getElementById("patientId");
const accountPatientId = document.getElementById("accountPatientId");

const accountCreated = document.getElementById("accountCreated");
const accountStatus = document.getElementById("accountStatus");


// =========================================
// GET INITIALS
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
// LOAD PROFILE
// =========================================

function loadProfile() {
    if (!currentUser || !profileStorageKey) return;

    let savedProfile = {};

    try {
        savedProfile = JSON.parse(
            localStorage.getItem(profileStorageKey) || "{}"
        );
    } catch (error) {
        console.error("Unable to load saved profile:", error);
    }

    // Account name and email come from logged-in account.
    // Other details are stored separately for each user.

    const profile = {
        fullName: currentUser.name || "",
        email: currentUser.email || "",
        phone: savedProfile.phone || "",
        dob: savedProfile.dob || "",
        gender: savedProfile.gender || "",
        bloodGroup: savedProfile.bloodGroup || "",
        address: savedProfile.address || ""
    };

    if (fullName) fullName.value = profile.fullName;
    if (email) email.value = profile.email;
    if (phone) phone.value = profile.phone;
    if (dob) dob.value = profile.dob;
    if (gender) gender.value = profile.gender;
    if (bloodGroup) bloodGroup.value = profile.bloodGroup;
    if (address) address.value = profile.address;

    updateProfileDisplay(profile);
}


// =========================================
// UPDATE PROFILE DISPLAY
// =========================================

function updateProfileDisplay(profile) {
    const name = profile.fullName || "Patient";
    const initials = getInitials(name);

    if (profileName) {
        profileName.textContent = name;
    }

    if (topPatientName) {
        topPatientName.textContent = name;
    }

    if (profileAvatar) {
        profileAvatar.textContent = initials;
    }

    if (topAvatar) {
        topAvatar.textContent = initials;
    }

    // Generate a patient reference from the account ID.
    const generatedPatientId =
        "P" + String(currentUser.id).padStart(4, "0");

    if (patientId) {
        patientId.textContent = generatedPatientId;
    }

    if (accountPatientId) {
        accountPatientId.textContent = generatedPatientId;
    }

    if (accountCreated) {
        accountCreated.textContent =
            currentUser.created_at
                ? new Date(currentUser.created_at).toLocaleDateString()
                : "Not available";
    }

    if (accountStatus) {
        accountStatus.textContent = "Active";
    }
}


// =========================================
// SAVE PROFILE
// =========================================

if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!currentUser || !profileStorageKey) return;

        const profileData = {
            phone: phone ? phone.value.trim() : "",
            dob: dob ? dob.value : "",
            gender: gender ? gender.value : "",
            bloodGroup: bloodGroup ? bloodGroup.value : "",
            address: address ? address.value.trim() : ""
        };

        try {
            localStorage.setItem(
                profileStorageKey,
                JSON.stringify(profileData)
            );

            alert("Profile details saved successfully!");

            loadProfile();

        } catch (error) {
            console.error("Unable to save profile:", error);
            alert("Unable to save profile details.");
        }
    });
}


// =========================================
// CANCEL CHANGES
// =========================================

if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
        loadProfile();
    });
}


// =========================================
// INITIALIZE PROFILE
// =========================================

if (currentUser && currentUser.id) {
    loadProfile();
}

console.log("BrainCare AI - Patient-specific profile loaded.");