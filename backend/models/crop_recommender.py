import sys
import json
import pickle
import numpy as np
import os
from pathlib import Path

# Get the directory of the current script
script_dir = Path(__file__).parent.absolute()

def load_model():
    """Load the trained model from a pickle file."""
    try:
        model_path = os.path.join(script_dir, 'crop_recommendation_model.pkl')
        # Use stderr for logging instead of stdout
        print(f"Trying to load model from: {model_path}", file=sys.stderr)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            
        print("Model loaded successfully", file=sys.stderr)
        return model
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        print(error_msg, file=sys.stderr)
        return None  # Return None instead of raising, so we can use the fallback

def predict_crop(N, P, K, temperature, humidity, ph, rainfall):
    """Make crop predictions based on input parameters."""
    try:
        # Load the model
        model = load_model()
        
        # If model loading failed, use rule-based fallback
        if model is None:
            print("Using rule-based fallback due to model loading failure", file=sys.stderr)
            return get_rule_based_recommendations(N, P, K, temperature, humidity, ph, rainfall)
        
        # Prepare input data
        input_data = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        print(f"Input data shape: {input_data.shape}", file=sys.stderr)
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        print(f"Prediction result: {prediction}", file=sys.stderr)
        
        # Try to get probability scores if model supports it
        try:
            probabilities = model.predict_proba(input_data)[0]
            class_labels = model.classes_
            
            # Create list of crops with confidence scores
            crop_confidence = [
                {"name": str(label), "confidence": round(float(prob) * 100, 2)}
                for label, prob in zip(class_labels, probabilities)
            ]
            
            # Sort by confidence
            crop_confidence.sort(key=lambda x: x["confidence"], reverse=True)
            top_recommendations = crop_confidence[:5]
            
            # Add suitability labels
            for crop in top_recommendations:
                if crop["confidence"] >= 70:
                    crop["suitability"] = "Highly Suitable"
                elif crop["confidence"] >= 40:
                    crop["suitability"] = "Suitable"
                elif crop["confidence"] >= 20:
                    crop["suitability"] = "Moderately Suitable"
                else:
                    crop["suitability"] = "Low Suitability"
                    
            return {
                "success": True,
                "predictedCrop": str(prediction),
                "recommendations": top_recommendations,
                "source": "model"
            }
            
        except Exception as prob_error:
            # If probability prediction fails, just return the basic prediction
            print(f"Probability prediction failed: {str(prob_error)}", file=sys.stderr)
            return {
                "success": True,
                "predictedCrop": str(prediction),
                "recommendations": [
                    {"name": str(prediction), "confidence": 100, "suitability": "Recommended"}
                ],
                "source": "model"
            }
            
    except Exception as e:
        print(f"Prediction error: {str(e)}", file=sys.stderr)
        # Use rule-based fallback recommendations
        return get_rule_based_recommendations(N, P, K, temperature, humidity, ph, rainfall)

def get_rule_based_recommendations(N, P, K, temperature, humidity, ph, rainfall):
    """Provide fallback recommendations when the model can't be loaded."""
    print("Using rule-based fallback recommendations", file=sys.stderr)
    
    # Simple rule-based system
    recommendations = []
    
    # High nitrogen crops
    if N > 80:
        recommendations.extend([
            {"name": "maize", "confidence": 85, "suitability": "Highly Suitable"},
            {"name": "sugarcane", "confidence": 80, "suitability": "Highly Suitable"},
        ])
    
    # Medium nitrogen crops
    elif N > 40:
        recommendations.extend([
            {"name": "rice", "confidence": 75, "suitability": "Suitable"},
            {"name": "wheat", "confidence": 70, "suitability": "Suitable"},
        ])
    
    # Low nitrogen crops
    else:
        recommendations.extend([
            {"name": "chickpea", "confidence": 65, "suitability": "Suitable"},
            {"name": "lentil", "confidence": 60, "suitability": "Suitable"},
        ])
    
    # High temperature crops
    if temperature > 30:
        recommendations.extend([
            {"name": "cotton", "confidence": 75, "suitability": "Suitable"},
            {"name": "muskmelon", "confidence": 70, "suitability": "Suitable"},
        ])
    
    # Medium temperature crops
    elif temperature > 20:
        recommendations.extend([
            {"name": "banana", "confidence": 80, "suitability": "Highly Suitable"},
            {"name": "mango", "confidence": 75, "suitability": "Suitable"},
        ])
    
    # Low temperature crops
    else:
        recommendations.extend([
            {"name": "apple", "confidence": 85, "suitability": "Highly Suitable"},
            {"name": "orange", "confidence": 70, "suitability": "Suitable"},
        ])
    
    # Sort by confidence and return top 5
    recommendations.sort(key=lambda x: x["confidence"], reverse=True)
    return {
        "success": True,
        "predictedCrop": recommendations[0]["name"],
        "recommendations": recommendations[:5],
        "source": "rule-based"
    }

# Main entry point when script is run
if __name__ == "__main__":
    try:
        # Get input data from arguments
        if len(sys.argv) < 2:
            error_result = {
                "success": False,
                "error": "Missing input data argument"
            }
            print(json.dumps(error_result))
            sys.exit(1)
            
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        # Extract parameters with defaults
        N = float(input_data.get('N', 0))
        P = float(input_data.get('P', 0))
        K = float(input_data.get('K', 0))
        temperature = float(input_data.get('temperature', 0))
        humidity = float(input_data.get('humidity', 0))
        ph = float(input_data.get('ph', 0))
        rainfall = float(input_data.get('rainfall', 0))
        
        # Get result from either prediction or fallback
        result = predict_crop(N, P, K, temperature, humidity, ph, rainfall)
        
        # Print ONLY the JSON result to stdout for Node.js to capture
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        # Log the actual error to stderr
        print(f"Python execution error: {str(e)}", file=sys.stderr)
        # Send only valid JSON to stdout
        print(json.dumps(error_result))