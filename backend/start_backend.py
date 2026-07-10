"""
Backend Startup Script
Verifies configuration and starts the FastAPI server

Usage: python start_backend.py
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath: str, description: str) -> bool:
    """Check if a required file exists"""
    if not Path(filepath).exists():
        print(f"❌ Missing {description}: {filepath}")
        return False
    print(f"✓ Found {description}: {filepath}")
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\n🔍 Checking dependencies...")
    required = ['fastapi', 'uvicorn', 'pandas', 'numpy', 'sklearn']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"❌ {package} is NOT installed")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("Install them with: pip install -r requirements.txt")
        return False
    
    return True

def check_data_files():
    """Check if required data files exist"""
    print("\n🔍 Checking data files...")
    
    files = {
        'districts.csv': 'Districts data',
        'associations.csv': 'Criminal associations data',
    }
    
    optional_files = {
        'criminals_enriched.csv': 'Enriched criminals data (falls back to criminals.csv)',
        'incidents_time_engineered.csv': 'Time-engineered incidents (falls back to incidents.csv)',
    }
    
    fallback_files = {
        'criminals.csv': 'Original criminals data',
        'incidents.csv': 'Original incidents data',
    }
    
    all_good = True
    
    # Check required files
    for file, desc in files.items():
        if not check_file_exists(file, desc):
            all_good = False
    
    # Check optional files with fallbacks
    for file, desc in optional_files.items():
        if not Path(file).exists():
            print(f"⚠️  Missing {desc}: {file}")
            # Check for fallback
            fallback = file.replace('_enriched', '').replace('_time_engineered', '')
            if Path(fallback).exists():
                print(f"   Will use fallback: {fallback}")
            else:
                print(f"❌ Fallback file also missing: {fallback}")
                all_good = False
        else:
            print(f"✓ Found {desc}: {file}")
    
    return all_good

def check_ml_model():
    """Check if ML model exists"""
    print("\n🔍 Checking ML model...")
    
    model_file = 'random_forest_model.joblib'
    
    if not Path(model_file).exists():
        print(f"⚠️  ML model not found: {model_file}")
        print("   The /api/v1/predict-risk endpoint will not be available")
        print("   Run 'python ml_pipeline.py' to train the model")
        return False
    
    print(f"✓ Found ML model: {model_file}")
    return True

def main():
    """Main startup routine"""
    print("="*70)
    print("🚀 KSP Crime Analytics Backend - Startup Check")
    print("="*70)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Dependency check failed. Please install required packages.")
        sys.exit(1)
    
    # Check data files
    if not check_data_files():
        print("\n❌ Data file check failed.")
        print("\nTo generate enriched data files, run:")
        print("  python ml_pipeline.py")
        sys.exit(1)
    
    # Check ML model (warning only, not critical)
    check_ml_model()
    
    print("\n" + "="*70)
    print("✅ All checks passed! Starting FastAPI server...")
    print("="*70)
    print("\nServer will be available at:")
    print("  • API: http://localhost:8000")
    print("  • Docs: http://localhost:8000/docs")
    print("  • ReDoc: http://localhost:8000/redoc")
    print("\nPress CTRL+C to stop the server")
    print("="*70 + "\n")
    
    # Import and run the FastAPI app
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting server: {str(e)}")
        sys.exit(1)
