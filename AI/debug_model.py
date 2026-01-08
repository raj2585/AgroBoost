import os
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('model_debug.log')
    ]
)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting model debug script")
    
    try:
        # Import and check if the packages are installed
        try:
            import torch
            logger.info(f"PyTorch version: {torch.__version__}")
            logger.info(f"CUDA available: {torch.cuda.is_available()}")
            if torch.cuda.is_available():
                logger.info(f"CUDA device: {torch.cuda.get_device_name(0)}")
        except ImportError:
            logger.error("PyTorch not installed")
        
        try:
            import transformers
            logger.info(f"Transformers version: {transformers.__version__}")
        except ImportError:
            logger.error("Transformers not installed")
        
        # Try to import our model module
        logger.info("Attempting to import model module...")
        from models.model import processor, model
        
        if model is None or processor is None:
            logger.error("Model or processor is None")
        else:
            logger.info("Model and processor loaded successfully!")
            
    except Exception as e:
        logger.error(f"Error in debug script: {e}")
        logger.exception("Exception details:")

if __name__ == "__main__":
    main()
