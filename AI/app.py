import os
import logging
import traceback
from flask import Flask, jsonify
from flask_cors import CORS

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('agroboost_ai.log')  # Log to file as well
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def home():
    return "AgroBoost API is running"

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error"}), 500

try:
    # Check if routes directory exists
    if not os.path.exists(os.path.join(os.path.dirname(__file__), 'routes')):
        logger.error("routes directory is missing")
        raise FileNotFoundError("routes directory not found")
    
    # Import API blueprint
    from routes.api import api_bp
    
    # Register API routes
    app.register_blueprint(api_bp, url_prefix="/api")
    logger.info("API routes registered successfully")
    
except ImportError as e:
    logger.error(f"Import error: {e}")
    logger.error(traceback.format_exc())
    # Don't raise here, let the app continue with limited functionality
except Exception as e:
    logger.error(f"Setup error: {e}")
    logger.error(traceback.format_exc())
    # Don't raise here, let the app continue with limited functionality

if __name__ == "__main__":
    try:
        logger.info("Starting Flask application...")
        # Bind to all interfaces (0.0.0.0) to allow external connections
        app.run(debug=True, use_reloader=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logger.error(f"Application error: {e}")
        logger.error(traceback.format_exc())