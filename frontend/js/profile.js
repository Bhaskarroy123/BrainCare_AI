// =========================================
// BrainCare AI - Dynamic Profile JavaScript
// =========================================


// =========================================
// DEFAULT PROFILE
// =========================================

const defaultProfile = {

    fullName: "Bhaskar Roy",

    email: "bhaskar@example.com",

    phone: "+91 98765 43210",

    dob: "2004-01-15",

    gender: "male",

    bloodGroup: "B+",

    address: "Noida, Uttar Pradesh, India",

    patientId: "P0005",

    accountCreated: "September 2026",

    accountStatus: "Active"

};


// =========================================
// GET FORM ELEMENTS
// =========================================

const profileForm =
    document.getElementById("profileForm");


const fullName =
    document.getElementById("fullName");


const email =
    document.getElementById("email");


const phone =
    document.getElementById("phone");


const dob =
    document.getElementById("dob");


const gender =
    document.getElementById("gender");


const bloodGroup =
    document.getElementById("bloodGroup");


const address =
    document.getElementById("address");


const cancelBtn =
    document.getElementById("cancelBtn");


// =========================================
// GET DISPLAY ELEMENTS
// =========================================

const profileName =
    document.getElementById("profileName");


const topPatientName =
    document.getElementById("topPatientName");


const profileAvatar =
    document.getElementById("profileAvatar");


const topAvatar =
    document.getElementById("topAvatar");


const patientId =
    document.getElementById("patientId");


const accountPatientId =
    document.getElementById("accountPatientId");


const accountCreated =
    document.getElementById("accountCreated");


const accountStatus =
    document.getElementById("accountStatus");


// =========================================
// LOAD PROFILE
// =========================================

function loadProfile() {

    const storedProfile =
        localStorage.getItem("brainCareProfile");


    let profile =
        { ...defaultProfile };


    if (storedProfile) {

        try {

            const savedProfile =
                JSON.parse(storedProfile);


            profile = {
                ...defaultProfile,
                ...savedProfile
            };

        } catch (error) {

            console.error(
                "Unable to load profile:",
                error
            );

        }

    }


    // =====================================
    // LOAD FORM VALUES
    // =====================================

    fullName.value =
        profile.fullName || "";


    email.value =
        profile.email || "";


    phone.value =
        profile.phone || "";


    dob.value =
        profile.dob || "";


    gender.value =
        profile.gender || "";


    bloodGroup.value =
        profile.bloodGroup || "";


    address.value =
        profile.address || "";


    // =====================================
    // UPDATE DISPLAY
    // =====================================

    updateProfileDisplay(profile);

}


// =========================================
// UPDATE PROFILE DISPLAY
// =========================================

function updateProfileDisplay(profile) {

    const name =
        profile.fullName || "Bhaskar Roy";


    // -------------------------------------
    // Header name
    // -------------------------------------

    if (profileName) {

        profileName.textContent =
            name;

    }


    if (topPatientName) {

        topPatientName.textContent =
            name;

    }


    // -------------------------------------
    // Avatar initials
    // -------------------------------------

    const initials =
        getInitials(name);


    if (profileAvatar) {

        profileAvatar.textContent =
            initials;

    }


    if (topAvatar) {

        topAvatar.textContent =
            initials;

    }


    // -------------------------------------
    // Patient ID
    // -------------------------------------

    if (patientId) {

        patientId.textContent =
            profile.patientId ||
            defaultProfile.patientId;

    }


    if (accountPatientId) {

        accountPatientId.textContent =
            profile.patientId ||
            defaultProfile.patientId;

    }


    // -------------------------------------
    // Account information
    // -------------------------------------

    if (accountCreated) {

        accountCreated.textContent =
            profile.accountCreated ||
            defaultProfile.accountCreated;

    }


    if (accountStatus) {

        accountStatus.textContent =
            profile.accountStatus ||
            defaultProfile.accountStatus;

    }

}


// =========================================
// GET INITIALS
// =========================================

function getInitials(name) {

    if (!name) {

        return "BR";

    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =========================================
// SAVE PROFILE
// =========================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // =================================
            // GET FORM DATA
            // =================================

            const profileData = {

                fullName:
                    fullName.value.trim(),

                email:
                    email.value.trim(),

                phone:
                    phone.value.trim(),

                dob:
                    dob.value,

                gender:
                    gender.value,

                bloodGroup:
                    bloodGroup.value,

                address:
                    address.value.trim(),

                patientId:
                    defaultProfile.patientId,

                accountCreated:
                    defaultProfile.accountCreated,

                accountStatus:
                    defaultProfile.accountStatus

            };


            // =================================
            // VALIDATION
            // =================================

            if (
                profileData.fullName === "" ||
                profileData.email === ""
            ) {

                alert(
                    "Please enter your name and email address."
                );

                return;

            }


            // =================================
            // SAVE TO LOCAL STORAGE
            // =================================

            localStorage.setItem(
                "brainCareProfile",
                JSON.stringify(profileData)
            );


            // =================================
            // UPDATE PAGE
            // =================================

            updateProfileDisplay(
                profileData
            );


            // =================================
            // UPDATE DASHBOARD PATIENT NAME
            // =================================

            updateDashboardPatientName(
                profileData.fullName
            );


            // =================================
            // SUCCESS
            // =================================

            alert(
                "Profile updated successfully!"
            );

        }
    );

}


// =========================================
// CANCEL CHANGES
// =========================================

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            loadProfile();

        }
    );

}


// =========================================
// UPDATE DASHBOARD PATIENT NAME
// =========================================

function updateDashboardPatientName(name) {

    const storedDashboard =
        localStorage.getItem(
            "brainCareDashboard"
        );


    if (!storedDashboard) {

        return;

    }


    try {

        const dashboardData =
            JSON.parse(storedDashboard);


        dashboardData.patientName =
            name;


        localStorage.setItem(
            "brainCareDashboard",
            JSON.stringify(
                dashboardData
            )
        );

    } catch (error) {

        console.error(
            "Unable to update dashboard patient name:",
            error
        );

    }

}


// =========================================
// INITIALIZE PROFILE
// =========================================

loadProfile();


// =========================================
// DEBUG
// =========================================

console.log(
    "BrainCare AI - Profile loaded"
);