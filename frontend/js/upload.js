// =========================================
// BRAINCARE AI
// UPLOAD MRI PAGE JAVASCRIPT
// Database-integrated version
// =========================================


// Get HTML elements
const uploadArea = document.getElementById("uploadArea");
const mriInput = document.getElementById("mriInput");
const chooseBtn = document.getElementById("chooseBtn");

const previewSection = document.getElementById("previewSection");
const mriPreview = document.getElementById("mriPreview");
const fileName = document.getElementById("fileName");
const removeBtn = document.getElementById("removeBtn");

const analyzeSection = document.getElementById("analyzeSection");
const analyzeBtn = document.getElementById("analyzeBtn");


// =========================================
// GET LOGGED-IN USER
// =========================================

function getLoggedInUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch (error) {
        console.error("Unable to read logged-in user:", error);
        return null;
    }
}


// =========================================
// CHOOSE MRI IMAGE
// =========================================

if (chooseBtn && mriInput) {
    chooseBtn.addEventListener("click", function () {
        mriInput.click();
    });
}


// =========================================
// WHEN FILE IS SELECTED
// =========================================

if (mriInput) {
    mriInput.addEventListener("change", function () {
        const file = mriInput.files[0];

        if (file) {
            handleFile(file);
        }
    });
}


// =========================================
// HANDLE FILE
// =========================================

function handleFile(file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
        alert("Please upload a JPG, JPEG, or PNG image.");
        mriInput.value = "";
        return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (file.size > maxSize) {
        alert("File size must be less than 10 MB.");
        mriInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        mriPreview.src = event.target.result;
        fileName.textContent = file.name;

        previewSection.style.display = "block";
        analyzeSection.style.display = "block";
    };

    reader.readAsDataURL(file);
}


// =========================================
// REMOVE IMAGE
// =========================================

if (removeBtn) {
    removeBtn.addEventListener("click", function () {
        mriInput.value = "";
        mriPreview.src = "";
        fileName.textContent = "";

        previewSection.style.display = "none";
        analyzeSection.style.display = "none";
    });
}


// =========================================
// DRAG & DROP
// =========================================

if (uploadArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    ["dragenter", "dragover"].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, function () {
            uploadArea.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, function () {
            uploadArea.classList.remove("dragover");
        }, false);
    });

    uploadArea.addEventListener("drop", function (event) {
        const files = event.dataTransfer.files;

        if (files.length > 0) {
            const file = files[0];

            const transfer = new DataTransfer();
            transfer.items.add(file);
            mriInput.files = transfer.files;

            handleFile(file);
        }
    }, false);
}


// =========================================
// ANALYZE MRI WITH REAL AI MODEL
// =========================================

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async function () {

        if (!mriInput || !mriInput.files.length) {
            alert("Please select an MRI image first.");
            return;
        }

        // Get logged-in patient
        const user = getLoggedInUser();

        if (!user || !user.id) {
            alert("Please log in before analyzing an MRI.");
            window.location.href = "login.html";
            return;
        }

        const file = mriInput.files[0];
        const formData = new FormData();

        formData.append("image", file);

        // Send patient ID to backend
        formData.append("user_id", String(user.id));

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing MRI...";

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/predict",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            console.log("Backend response:", data);

            if (!response.ok || !data.success) {
                alert(
                    "Prediction failed:\n" +
                    (data.error || data.message || "Unknown error")
                );
                return;
            }

            // Clear old result-save flag
            sessionStorage.removeItem("resultSaved");

            // Store image and file name
            sessionStorage.setItem("mriImage", mriPreview.src);
            sessionStorage.setItem("mriFileName", file.name);

            // Store prediction and confidence
            sessionStorage.setItem("mriPrediction", data.prediction);
            sessionStorage.setItem(
                "mriConfidence",
                String(data.confidence)
            );

            // Store database scan ID
            if (data.scan_id !== null && data.scan_id !== undefined) {
                sessionStorage.setItem(
                    "mriScanId",
                    String(data.scan_id)
                );
            } else {
                sessionStorage.removeItem("mriScanId");
            }

            // Store database report ID
            if (data.report_id !== null && data.report_id !== undefined) {
                sessionStorage.setItem(
                    "mriReportId",
                    String(data.report_id)
                );
            } else {
                sessionStorage.removeItem("mriReportId");
            }

            sessionStorage.setItem(
                "mriSavedToDatabase",
                String(data.saved === true)
            );

            console.log("Prediction:", data.prediction);
            console.log("Confidence:", data.confidence);
            console.log("Saved to database:", data.saved);
            console.log("Scan ID:", data.scan_id);
            console.log("Report ID:", data.report_id);

            // Check whether scan was saved
            if (data.saved !== true) {
                alert(
                    "Prediction completed, but the scan was not saved " +
                    "to the patient database. Please log in again and retry."
                );
                return;
            }

            // Open result page
            window.location.href = "result.html";

        } catch (error) {
            console.error("Backend connection error:", error);

            alert(
                "Could not connect to BrainCare AI backend.\n\n" +
                "Please make sure Flask server is running."
            );

        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "🧠 Analyze MRI";
        }
    });
}