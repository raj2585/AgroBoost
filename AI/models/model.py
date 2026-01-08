import logging
import os
import traceback
from google import genai
from google.genai import types # type: ignore
from pydantic import BaseModel
# Configure more detailed logging
logger = logging.getLogger(__name__)

# First, check available disk space and memory
def check_system_resources():
    try:
        import psutil
        # Check available memory
        mem_info = psutil.virtual_memory()
        available_memory_gb = mem_info.available / (1024 ** 3)
        
        # Check disk space
        disk_info = psutil.disk_usage(os.path.dirname(__file__))
        available_disk_gb = disk_info.free / (1024 ** 3)
        
        logger.info(f"System resources: {available_memory_gb:.2f} GB RAM available, {available_disk_gb:.2f} GB disk space available")
        
        if available_memory_gb < 4:
            logger.warning("Less than 4GB of RAM available, model loading may fail")
        if available_disk_gb < 5:
            logger.warning("Less than 5GB of disk space available, model download may fail")
            
        return True
    except Exception as e:
        logger.warning(f"Failed to check system resources: {e}")
        return True  # Continue anyway

# Function to extract text from an image using Tesseract OCR
def extract_text_from_image(image_path, prompt):
    try:
        
        import PIL.Image
        class schema(BaseModel):
            name :str
            aadharID :str
            dob :str
            location :str
        
        
        image = PIL.Image.open(image_path)
        client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
        response = client.models.generate_content(model="gemini-2.0-flash", contents=[prompt, image],config={
        'response_mime_type': 'application/json',
        'response_schema': list[schema],
    },)
        logger.info(f"Response: {response}")
        return response.text
    except Exception as e:
        logger.error(f"Error extracting text with Tesseract OCR: {e}")
        logger.error(traceback.format_exc())
        return None
