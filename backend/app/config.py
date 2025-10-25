import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    @staticmethod
    def validate():
        """Check if required API keys are present"""
        warnings = []
        
        if not Config.GOOGLE_API_KEY:
            warnings.append("⚠️  GOOGLE_API_KEY not set - AI features will be disabled")
        else:
            print("✅ Google API key loaded successfully")
        
        return warnings

# Validate on import
warnings = Config.validate()
for warning in warnings:
    print(warning)
