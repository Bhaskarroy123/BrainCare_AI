// =========================================
// BRAINCARE AI
// UPLOAD MRI PAGE JAVASCRIPT
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
// CHOOSE MRI IMAGE
// =========================================

chooseBtn.addEventListener("click", function () {

    mriInput.click();

});


// =========================================
// WHEN FILE IS SELECTED
// =========================================

mriInput.addEventListener("change", function () {

    const file = mriInput.files[0];

    if (file) {

        handleFile(file);

    }

});


// =========================================
// HANDLE FILE
// =========================================

function handleFile(file) {

    // Allowed file types
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];


    // Check file type
    if (!allowedTypes.includes(file.type)) {

        alert(
            "Please upload a JPG, JPEG, or PNG image."
        );

        mriInput.value = "";

        return;
    }


    // Check file size
    const maxSize =
        10 * 1024 * 1024; // 10 MB


    if (file.size > maxSize) {

        alert(
            "File size must be less than 10 MB."
        );

        mriInput.value = "";

        return;
    }


    // Create image preview
    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            mriPreview.src =
                event.target.result;

            fileName.textContent =
                file.name;


            // Show preview
            previewSection.style.display =
                "block";


            // Show analyze button
            analyzeSection.style.display =
                "block";

        };


    reader.readAsDataURL(file);
}


// =========================================
// REMOVE IMAGE
// =========================================

removeBtn.addEventListener(
    "click",
    function () {

        // Clear input
        mriInput.value = "";


        // Remove preview
        mriPreview.src = "";


        // Clear file name
        fileName.textContent = "";


        // Hide preview
        previewSection.style.display =
            "none";


        // Hide analyze section
        analyzeSection.style.display =
            "none";

    }
);


// =========================================
// DRAG & DROP
// =========================================


// Prevent browser default behavior
[
    "dragenter",
    "dragover",
    "dragleave",
    "drop"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        preventDefaults,
        false
    );

});


function preventDefaults(event) {

    event.preventDefault();

    event.stopPropagation();

}


// =========================================
// DRAG OVER EFFECT
// =========================================

[
    "dragenter",
    "dragover"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        function () {

            uploadArea.classList.add(
                "dragover"
            );

        },
        false
    );

});


// =========================================
// REMOVE DRAG EFFECT
// =========================================

[
    "dragleave",
    "drop"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        function () {

            uploadArea.classList.remove(
                "dragover"
            );

        },
        false
    );

});


// =========================================
// DROP FILE
// =========================================

uploadArea.addEventListener(
    "drop",
    function (event) {

        const files =
            event.dataTransfer.files;


        if (files.length > 0) {

            const file =
                files[0];


            // Put dropped file into input
            mriInput.files =
                files;


            handleFile(file);

        }

    },
    false
);


// =========================================
// ANALYZE MRI WITH REAL AI MODEL
// =========================================

analyzeBtn.addEventListener(
    "click",
    async function () {


        // -----------------------------
        // Check MRI Selection
        // -----------------------------

        if (!mriInput.files.length) {

            alert(
                "Please select an MRI image first."
            );

            return;
        }


        const file =
            mriInput.files[0];


        // -----------------------------
        // Create FormData
        // -----------------------------

        const formData =
            new FormData();


        formData.append(
            "image",
            file
        );


        // -----------------------------
        // Disable Analyze Button
        // -----------------------------

        analyzeBtn.disabled =
            true;


        analyzeBtn.textContent =
            "Analyzing MRI...";


        try {

            // =========================================
            // SEND IMAGE TO FLASK BACKEND
            // =========================================

            const response =
                await fetch(
                    "http://127.0.0.1:5000/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // -----------------------------
            // Get Backend Response
            // -----------------------------

            const data =
                await response.json();


            console.log(
                "Backend response:",
                data
            );


            // =========================================
            // CHECK BACKEND RESULT
            // =========================================

            if (!data.success) {

                alert(
                    "Prediction failed:\n" +
                    (
                        data.error ||
                        "Unknown error"
                    )
                );

                return;
            }


            // =========================================
            // NEW MRI RESULT
            // CLEAR OLD SAVE FLAG
            // =========================================

            sessionStorage.removeItem(
                "resultSaved"
            );


            // =========================================
            // SAVE MRI IMAGE
            // =========================================

            sessionStorage.setItem(
                "mriImage",
                mriPreview.src
            );


            // =========================================
            // SAVE FILE NAME
            // =========================================

            sessionStorage.setItem(
                "mriFileName",
                file.name
            );


            // =========================================
            // SAVE REAL AI PREDICTION
            // =========================================

            sessionStorage.setItem(
                "mriPrediction",
                data.prediction
            );


            // =========================================
            // SAVE REAL AI CONFIDENCE
            // =========================================

            sessionStorage.setItem(
                "mriConfidence",
                data.confidence
            );


            // =========================================
            // DEBUG
            // =========================================

            console.log(
                "Prediction:",
                data.prediction
            );

            console.log(
                "Confidence:",
                data.confidence
            );


            // =========================================
            // OPEN RESULT PAGE
            // =========================================

            window.location.href =
                "result.html";

        }


        // =========================================
        // BACKEND CONNECTION ERROR
        // =========================================

        catch (error) {

            console.error(
                "Backend connection error:",
                error
            );


            alert(
                "Could not connect to BrainCare AI backend.\n\n" +
                "Please make sure Flask server is running."
            );

        }


        // =========================================
        // RESTORE BUTTON
        // =========================================

        finally {

            analyzeBtn.disabled =
                false;


            analyzeBtn.textContent =
                "🧠 Analyze MRI";

        }

    }
);