import os
import sqlite3
import uuid
import numpy as np
import keras

from keras.layers import Dense
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


# =========================================
# FLASK CONFIGURATION
# =========================================

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

DATABASE_DIR = os.path.join(PROJECT_DIR, "database")
UPLOAD_DIR = os.path.join(PROJECT_DIR, "uploads")

os.makedirs(DATABASE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE = os.path.join(DATABASE_DIR, "users.db")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# =========================================
# KERAS COMPATIBILITY
# =========================================

_original_dense_from_config = Dense.from_config.__func__


@classmethod
def _compatible_dense_from_config(cls, config):
    config = dict(config)
    config.pop("quantization_config", None)
    return _original_dense_from_config(cls, config)


Dense.from_config = _compatible_dense_from_config


# =========================================
# DATABASE CONNECTION
# =========================================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# =========================================
# INITIALIZE DATABASE
# =========================================

def initialize_database():
    conn = get_db_connection()

    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                file_name TEXT NOT NULL,
                stored_file TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL NOT NULL,
                scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_id INTEGER NOT NULL UNIQUE,
                user_id INTEGER NOT NULL,
                report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (scan_id) REFERENCES scans(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create report records for older scans that do not have one yet.
        # The UNIQUE constraint on reports.scan_id prevents duplicates.
        conn.execute("""
            INSERT INTO reports (scan_id, user_id)
            SELECT scans.id, scans.user_id
            FROM scans
            LEFT JOIN reports ON reports.scan_id = scans.id
            WHERE reports.id IS NULL
        """)

        conn.commit()
        print("EXISTING SCAN REPORTS CHECKED/GENERATED")
        print("DATABASE INITIALIZED SUCCESSFULLY")

    finally:
        conn.close()


initialize_database()


# =========================================
# LOAD TRAINED MODEL
# =========================================

MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "models", "brain_tumor_model.keras")
)

CLASS_NAMES = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary"
]

model = None

print("\n========== BRAINCARE AI ==========")
print("Loading original trained model...")
print("Model path:", MODEL_PATH)

try:
    if not os.path.isfile(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    model = keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    if isinstance(model.output_shape, list):
        raise ValueError("Multiple-output models are not supported.")

    if len(model.output_shape) != 2:
        raise ValueError(
            f"Expected 2D output, got {model.output_shape}"
        )

    if model.output_shape[-1] != len(CLASS_NAMES):
        raise ValueError(
            f"Expected 4 output classes, got {model.output_shape[-1]}"
        )

    print("MODEL LOADED SUCCESSFULLY")
    print("Input shape:", model.input_shape)
    print("Output shape:", model.output_shape)

except Exception as e:
    model = None
    print("MODEL LOADING FAILED:", repr(e))

print("==================================\n")


# =========================================
# HELPER FUNCTIONS
# =========================================

def get_user_id(value):
    try:
        user_id = int(value)
        return user_id if user_id > 0 else None

    except (TypeError, ValueError):
        return None


def user_exists(user_id):
    if user_id is None:
        return False

    conn = get_db_connection()

    try:
        result = conn.execute(
            "SELECT id FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

        return result is not None

    finally:
        conn.close()


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# =========================================
# HOME ROUTE
# =========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "BrainCare AI backend is running",
        "model_loaded": model is not None
    })


# =========================================
# HEALTH CHECK
# =========================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "database_path": DATABASE,
        "upload_directory": UPLOAD_DIR,
        "model_input_shape": str(model.input_shape) if model else None,
        "model_output_shape": str(model.output_shape) if model else None
    }), 200 if model is not None else 503


# =========================================
# USER SIGNUP
# =========================================

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not isinstance(password, str):
        return jsonify({
            "success": False,
            "message": "Invalid password."
        }), 400

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters."
        }), 400

    if len(name) > 100 or len(email) > 254:
        return jsonify({
            "success": False,
            "message": "Name or email is too long."
        }), 400

    conn = get_db_connection()

    try:
        conn.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            """,
            (
                name,
                email,
                generate_password_hash(password)
            )
        )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully."
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "This email is already registered."
        }), 409

    finally:
        conn.close()


# =========================================
# USER LOGIN
# =========================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not isinstance(password, str) or not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db_connection()

    try:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user is None or not check_password_hash(
            user["password"], password
        ):
            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    finally:
        conn.close()


# =========================================
# IMAGE PREPROCESSING
# =========================================

def prepare_image(file):

    if model is None:
        raise RuntimeError("Model is not loaded.")

    input_shape = model.input_shape

    if isinstance(input_shape, list) or len(input_shape) != 4:
        raise ValueError("Unsupported model input shape.")

    height = input_shape[1] or 224
    width = input_shape[2] or 224

    if input_shape[3] != 3:
        raise ValueError("Model must accept 3 RGB channels.")

    with Image.open(file) as image:

        image = image.convert("RGB")

        image = image.resize(
            (width, height),
            Image.Resampling.LANCZOS
        )

        image_array = np.asarray(
            image,
            dtype=np.float32
        )

    # Verify preprocessing against the original training notebook.
    image_array = image_array / 255.0

    return np.expand_dims(image_array, axis=0)


# =========================================
# MRI PREDICTION
# =========================================

def make_prediction():

    if model is None:
        return jsonify({
            "success": False,
            "error": "Original model is not loaded."
        }), 503

    uploaded_file = (
        request.files.get("file")
        or request.files.get("image")
    )

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({
            "success": False,
            "error": "Please upload an MRI image."
        }), 400

    original_name = secure_filename(uploaded_file.filename)

    if not original_name or not allowed_file(original_name):
        return jsonify({
            "success": False,
            "error": "Only JPG, JPEG, and PNG images are allowed."
        }), 400

    # FIXED LINE: closing quote added after user_id
    user_id = get_user_id(request.form.get("user_id"))

    try:

        image_array = prepare_image(uploaded_file)

        predictions = np.asarray(
            model.predict(image_array, verbose=0)
        )

        if predictions.shape != (1, len(CLASS_NAMES)):
            return jsonify({
                "success": False,
                "error": f"Unexpected prediction shape: {predictions.shape}"
            }), 500

        scores = predictions[0]

        if not np.all(np.isfinite(scores)):
            return jsonify({
                "success": False,
                "error": "Model returned invalid prediction scores."
            }), 500

        if (
            np.any(scores < 0)
            or np.any(scores > 1)
            or not np.isclose(np.sum(scores), 1.0, atol=0.02)
        ):
            return jsonify({
                "success": False,
                "error": "Model outputs do not look like probabilities."
            }), 500

        predicted_index = int(np.argmax(scores))

        prediction = CLASS_NAMES[predicted_index]

        confidence = round(
            float(scores[predicted_index]) * 100,
            2
        )

        all_scores = {
            CLASS_NAMES[i]: round(float(scores[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

        scan_id = None
        report_id = None

        # Save scan only if a valid user ID exists.
        if user_id is not None and user_exists(user_id):

            extension = original_name.rsplit(".", 1)[1].lower()

            stored_name = f"{uuid.uuid4().hex}.{extension}"

            stored_path = os.path.join(
                UPLOAD_DIR,
                stored_name
            )

            uploaded_file.stream.seek(0)
            uploaded_file.save(stored_path)

            conn = get_db_connection()

            try:

                cursor = conn.execute(
                    """
                    INSERT INTO scans
                    (
                        user_id,
                        file_name,
                        stored_file,
                        prediction,
                        confidence
                    )
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        original_name,
                        stored_name,
                        prediction,
                        confidence
                    )
                )

                scan_id = cursor.lastrowid

                report_cursor = conn.execute(
                    """
                    INSERT INTO reports (scan_id, user_id)
                    VALUES (?, ?)
                    """,
                    (scan_id, user_id)
                )

                report_id = report_cursor.lastrowid

                conn.commit()

            except Exception:
                conn.rollback()

                if os.path.exists(stored_path):
                    os.remove(stored_path)

                raise

            finally:
                conn.close()

        return jsonify({
            "success": True,
            "prediction": prediction,
            "class_index": predicted_index,
            "confidence": confidence,
            "all_scores": all_scores,
            "scan_id": scan_id,
            "report_id": report_id,
            "saved": scan_id is not None,
            "warning": (
                "Experimental prediction only, not a medical diagnosis. "
                "Training preprocessing and class order must be verified."
            )
        }), 200

    except Exception as e:

        app.logger.exception("Prediction failed")

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================
# PREDICTION ROUTES
# =========================================

@app.route("/predict", methods=["POST"])
def predict():
    return make_prediction()


@app.route("/predict-new", methods=["POST"])
def predict_new():
    return make_prediction()


# =========================================
# GET PATIENT SCANS
# =========================================

@app.route("/api/scans", methods=["GET"])
def get_scans():

    user_id = get_user_id(request.args.get("user_id"))

    if not user_exists(user_id):
        return jsonify({
            "success": False,
            "message": "Valid user_id is required."
        }), 400

    conn = get_db_connection()

    try:

        rows = conn.execute(
            """
            SELECT
                id,
                user_id,
                file_name,
                prediction,
                confidence,
                scan_date
            FROM scans
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()

        return jsonify({
            "success": True,
            "scans": [dict(row) for row in rows]
        }), 200

    finally:
        conn.close()


# =========================================
# GET PATIENT REPORTS
# =========================================

@app.route("/api/reports", methods=["GET"])
def get_reports():

    user_id = get_user_id(request.args.get("user_id"))

    if not user_exists(user_id):
        return jsonify({
            "success": False,
            "message": "Valid user_id is required."
        }), 400

    conn = get_db_connection()

    try:

        rows = conn.execute(
            """
            SELECT
                reports.id AS report_id,
                reports.report_date,
                scans.id AS scan_id,
                scans.file_name,
                scans.prediction,
                scans.confidence,
                scans.scan_date
            FROM reports
            JOIN scans ON reports.scan_id = scans.id
            WHERE reports.user_id = ?
            ORDER BY reports.id DESC
            """,
            (user_id,)
        ).fetchall()

        return jsonify({
            "success": True,
            "reports": [dict(row) for row in rows]
        }), 200

    finally:
        conn.close()


# =========================================
# RUN APPLICATION
# =========================================

if __name__ == "__main__":

    print("Database location:", DATABASE)
    print("Database exists:", os.path.isfile(DATABASE))
    print("Upload directory:", UPLOAD_DIR)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )