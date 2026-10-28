
import os
import numpy as np
import keras

from keras.layers import Dense
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

# =====================================
# KERAS COMPATIBILITY WORKAROUND
# =====================================

# The saved model contains a Dense-layer configuration key
# that this installed Keras version does not recognize.
_original_dense_from_config = Dense.from_config.__func__

@classmethod
def _compatible_dense_from_config(cls, config):
    config = dict(config)
    config.pop("quantization_config", None)
    return _original_dense_from_config(cls, config)

Dense.from_config = _compatible_dense_from_config


# =====================================
# PATHS AND MODEL CONFIGURATION
# =====================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "models",
        "brain_tumor_model.keras"
    )
)

CLASS_NAMES = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary"
]

model = None


# =====================================
# LOAD ORIGINAL TRAINED MODEL
# =====================================

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
            f"Expected 2D classification output, got {model.output_shape}"
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


# =====================================
# HOME AND HEALTH CHECK
# =====================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "BrainCare AI backend is running",
        "model_loaded": model is not None
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_input_shape": str(model.input_shape) if model else None,
        "model_output_shape": str(model.output_shape) if model else None
    }), 200 if model is not None else 503


# =====================================
# IMAGE PREPROCESSING
# =====================================

def prepare_image(file):
    if model is None:
        raise RuntimeError("Model is not loaded.")

    input_shape = model.input_shape

    if isinstance(input_shape, list):
        raise ValueError("Multiple-input models are not supported.")

    if len(input_shape) != 4:
        raise ValueError(
            f"Expected input shape (batch, height, width, channels), got {input_shape}"
        )

    height = input_shape[1] or 224
    width = input_shape[2] or 224
    channels = input_shape[3]

    if channels != 3:
        raise ValueError(
            f"Expected 3 RGB channels, got {channels}."
        )

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

    # Assumption: original training used pixel values scaled to [0, 1].
    # Verify this against the original training notebook.
    image_array = image_array / 255.0

    return np.expand_dims(image_array, axis=0)


# =====================================
# PREDICTION
# =====================================

def make_prediction():
    if model is None:
        return jsonify({
            "error": "Original model is not loaded. Check backend terminal."
        }), 503

    uploaded_file = request.files.get("file")

    if uploaded_file is None:
        uploaded_file = request.files.get("image")

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({
            "error": "Upload an MRI image using the 'file' or 'image' field."
        }), 400

    try:
        image_array = prepare_image(uploaded_file)

        predictions = model.predict(
            image_array,
            verbose=0
        )

        predictions = np.asarray(predictions)

        if predictions.shape != (1, len(CLASS_NAMES)):
            return jsonify({
                "error": f"Unexpected prediction shape: {predictions.shape}"
            }), 500

        scores = predictions[0]

        if not np.all(np.isfinite(scores)):
            return jsonify({
                "error": "Model returned invalid prediction scores."
            }), 500

        # Verify that the output looks like probabilities.
        if (
            np.any(scores < 0)
            or np.any(scores > 1)
            or not np.isclose(np.sum(scores), 1.0, atol=0.02)
        ):
            return jsonify({
                "error": (
                    "Outputs do not look like probabilities. "
                    "Verify the model's final activation."
                )
            }), 500

        predicted_index = int(np.argmax(scores))
        confidence = float(scores[predicted_index]) * 100

        all_scores = {
            CLASS_NAMES[i]: round(float(scores[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

        return jsonify({
            "success": True,
            "prediction": CLASS_NAMES[predicted_index],
            "class_index": predicted_index,
            "confidence": round(confidence, 2),
            "all_scores": all_scores,
            "warning": (
                "Experimental prediction only, not a medical diagnosis. "
                "Training preprocessing and class order must be verified."
            )
        }), 200

    except Exception as e:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/predict", methods=["POST"])
def predict():
    return make_prediction()


@app.route("/predict-new", methods=["POST"])
def predict_new():
    return make_prediction()


# =====================================
# START SERVER
# =====================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )
