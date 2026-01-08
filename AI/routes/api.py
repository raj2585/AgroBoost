import json
import os
from flask import Blueprint, request, jsonify
import logging
import traceback
from models.model import extract_text_from_image


api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

@api_bp.route('/signup', methods=['POST'])
def signup():
    try:
        # Get the image from the request
        image = request.files.get('aadhaarImage')
        prompt = "PLease parse this aadhar card image and extract the details as a JSON string, only fetch the name, aadharID, date of birth, and city name in address (understand the address and only give the city name in location) example: {\"name\": \"John Doe\", \"aadharID\": \"1234 5678 9012\", \"dob\": \"01/01/2000\", \"location\": \"New York\"}, these are the default value of any are missing do not write anything except of the fromat of the json"
        if not image:
            return jsonify({"error": "No image provided"}), 400
        
        # Save the image to a temporary file
        image_path = "temp_image.jpg"
        image.save(image_path)
        
        # Call the LLaMA model to analyze the image
        result = extract_text_from_image(image_path, prompt)
        
        if result:
            logger.info(f"Analyzed image: {result}")
            return jsonify(result), 200
        else:
            return jsonify({"error": "Failed to analyze image"}), 500
    
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route('/schemes', methods=['GET'])
def schemes():
    try:
        # Get query parameters for filtering
        state = request.args.get('state', '').lower()
        category = request.args.get('category', '').lower()
        income_group = request.args.get('income', '').lower()
        gender = request.args.get('gender', '').lower()
        
        # Load schemes from JSON file
        json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                'utilities', 'schemes.json')
        
        with open(json_path, 'r', encoding='utf-8') as f:
            all_schemes = json.load(f)
        
        # Clean and process schemes
        processed_schemes = []
        for scheme in all_schemes:
            if 'Scheme Name' not in scheme or not scheme['Scheme Name'] or 'Details' not in scheme:
                continue
                
            scheme_name = scheme['Scheme Name'].strip()
            details = scheme['Details'].strip()
            
            if not scheme_name and not details:
                continue
                
            # Skip header row
            if scheme_name == "Name       of       the Scheme" and details == "Purpose":
                continue
                
            # Create cleaned scheme object
            cleaned_scheme = {
                "name": scheme_name,
                "description": details,
                "category": "agriculture",  # Default category
            }
            
            # Categorize schemes (you can expand this based on keywords)
            lower_name = scheme_name.lower()
            lower_details = details.lower()
            
            if "kisan" in lower_name:
                cleaned_scheme["category"] = "farmer support"
            elif "fasal bima" in lower_name:
                cleaned_scheme["category"] = "insurance"
            elif "infrastructure" in lower_name or "fund" in lower_name:
                cleaned_scheme["category"] = "infrastructure"
            elif "irrigation" in lower_name or "water" in lower_details:
                cleaned_scheme["category"] = "irrigation"
            elif "organic" in lower_name:
                cleaned_scheme["category"] = "organic farming"
            elif "digital" in lower_name:
                cleaned_scheme["category"] = "technology"
            
            # Apply filters if specified
            if category and category not in cleaned_scheme["category"].lower():
                continue
                
            # Add eligibility info based on scheme details
            cleaned_scheme["eligibility"] = {
                "states": ["All States"],  # Default
                "income_groups": ["All"],  # Default
                "gender": ["All"]         # Default
            }
            
            # Northeast specific schemes
            if "north eastern region" in lower_name or "north east" in lower_details:
                cleaned_scheme["eligibility"]["states"] = [
                    "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", 
                    "Mizoram", "Nagaland", "Sikkim", "Tripura"
                ]
                
            # Check for gender specific schemes
            if "women" in lower_name or "women" in lower_details or "namo drone didi" in lower_name.lower():
                cleaned_scheme["eligibility"]["gender"] = ["Female"]
                
            # Income group specific (if mentioned)
            if "small and marginal farmers" in lower_details:
                cleaned_scheme["eligibility"]["income_groups"] = ["Low", "Lower Middle"]
                
            # Add to processed list
            processed_schemes.append(cleaned_scheme)
            
        # Apply additional filters
        filtered_schemes = processed_schemes
        if state:
            filtered_schemes = [
                s for s in filtered_schemes if 
                "All States" in s["eligibility"]["states"] or 
                any(state in st.lower() for st in s["eligibility"]["states"])
            ]
            
        if gender:
            filtered_schemes = [
                s for s in filtered_schemes if 
                "All" in s["eligibility"]["gender"] or 
                gender in [g.lower() for g in s["eligibility"]["gender"]]
            ]
            
        if income_group:
            filtered_schemes = [
                s for s in filtered_schemes if 
                "All" in s["eligibility"]["income_groups"] or 
                any(income_group in ig.lower() for ig in s["eligibility"]["income_groups"])
            ]
            
        # Add an ID for easier frontend referencing
        for i, scheme in enumerate(filtered_schemes):
            scheme["id"] = i + 1
            
        return jsonify({
            "count": len(filtered_schemes),
            "schemes": filtered_schemes
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching schemes: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Error fetching schemes",
            "schemes": [
                {"name": "PM Kisan Yojana", "description": "Agricultural scheme to provide financial assistance to farmers"},
                {"name": "PM Awas Yojana", "description": "Housing scheme to provide affordable housing to all"},
                {"name": "PM Jan Dhan Yojana", "description": "Financial scheme to provide banking services to all"},
                {"name": "PM Ujjwala Yojana", "description": "LPG scheme to provide clean cooking fuel to all"},
            ]
        }), 500