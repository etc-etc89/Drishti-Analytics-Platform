from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import uvicorn
import math
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Initialize the FastAPI App
app = FastAPI(
    title="KSP Crime Analytics API",
    description="Backend API for the Datathon 2026 AI-Driven Analytics Platform",
    version="1.0.0"
)

# Enable CORS so the React frontend can talk to this API
# Configure allowed origins based on environment
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    # Add your production frontend URL here
    # "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
    max_age=3600,
)

# --- IN-MEMORY DATABASE ---
# For the hackathon prototype, we will load the CSVs into Pandas DataFrames on startup.
# In a real production environment, these would be PostgreSQL/PostGIS queries.
DB = {}

# --- ML MODEL ---
# Random Forest model for threat prediction
rf_model = None

# --- PYDANTIC SCHEMAS ---
class SuspectProfile(BaseModel):
    age: int
    base_risk_score: int
    connections: int

@app.on_event("startup")
async def load_data():
    """Loads the enriched CSV files into memory when the server starts."""
    global rf_model
    
    print("Initializing In-Memory Database...")
    try:
        DB['districts'] = pd.read_csv('districts.csv')
        DB['associations'] = pd.read_csv('associations.csv')
        
        # Load the enriched files if they exist (generated from EDA), fallback to original if not
        try:
            DB['criminals'] = pd.read_csv('criminals_enriched.csv')
            print("✓ Loaded criminals_enriched.csv")
        except FileNotFoundError:
            DB['criminals'] = pd.read_csv('criminals.csv')
            print("⚠️  Warning: criminals_enriched.csv not found, falling back to criminals.csv")
            
        try:
            DB['incidents'] = pd.read_csv('incidents_time_engineered.csv')
            print("✓ Loaded incidents_time_engineered.csv")
        except FileNotFoundError:
            DB['incidents'] = pd.read_csv('incidents.csv')
            DB['incidents']['timestamp'] = pd.to_datetime(DB['incidents']['timestamp'])
            print("⚠️  Warning: incidents_time_engineered.csv not found, falling back to incidents.csv")

        print("✅ Database loaded successfully.")
    except Exception as e:
        print(f"❌ CRITICAL ERROR loading CSV files: {str(e)}")
        print("Please ensure your CSV files are in the same directory as main.py")
    
    # --- LOAD ML MODEL ---
    print("\n🧠 Loading Machine Learning Model...")
    try:
        rf_model = joblib.load('random_forest_model.joblib')
        print("✅ ML Risk Prediction Model loaded successfully.")
        print(f"   Model Type: Random Forest Classifier")
        print(f"   Features: age, base_risk_score, connections")
        print(f"   Classes: {rf_model.classes_}")
    except FileNotFoundError:
        rf_model = None
        print("⚠️  Warning: ML model not found. Did you run ml_pipeline.py?")
        print("   The /api/v1/predict-risk endpoint will not be available.")
    except Exception as e:
        rf_model = None
        print(f"❌ Error loading ML model: {str(e)}")


# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "operational", "node": "KRN-01", "service": "KSP Analytics API"}

@app.get("/api/v1/overview/stats")
def get_global_stats():
    """Returns high-level metrics for the overview dashboard."""
    if not DB: raise HTTPException(status_code=503, detail="Database not initialized")
    
    crime_counts = DB['incidents']['crime_type'].value_counts().to_dict()
    
    # Count unique districts
    districts_monitored = DB['incidents']['district_id'].nunique() if 'district_id' in DB['incidents'].columns else len(DB['districts'])
    
    # Count anomalies in recent data as active alerts
    df = DB['incidents'].copy()
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    recent = df[df['timestamp'] >= df['timestamp'].max() - pd.Timedelta(days=7)]
    active_alerts = min(len(recent) // 100, 20)  # Heuristic: ~1 alert per 100 recent incidents
    
    return {
        "total_incidents": int(len(DB['incidents'])),
        "total_criminals": int(len(DB['criminals'])),
        "total_associations": int(len(DB['associations'])),
        "districts_monitored": int(districts_monitored),
        "active_alerts": int(active_alerts),
        "crime_breakdown": [{"name": str(k), "value": int(v)} for k, v in crime_counts.items()]
    }

@app.get("/api/v1/analytics/timeline")
def get_anomaly_timeline():
    """
    Advanced Anomaly Detection using Isolation Forest ML Algorithm.
    Detects multidimensional anomalies in crime incident patterns over time.
    """
    if 'incidents' not in DB: 
        raise HTTPException(status_code=503, detail="Incidents data not available")
    
    df = DB['incidents'].copy()
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    # Group by Month (YYYY-MM) and extract temporal features
    df['month'] = df['timestamp'].dt.to_period('M')
    df['month_str'] = df['month'].astype(str)
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['hour'] = df['timestamp'].dt.hour
    
    # Create rich feature set for each month
    monthly_features = df.groupby('month_str').agg({
        'incident_id': 'count',  # Total incidents
        'day_of_week': ['mean', 'std'],  # Average day pattern
        'hour': ['mean', 'std'],  # Average hour pattern
        'crime_type': lambda x: x.mode()[0] if len(x.mode()) > 0 else x.iloc[0]  # Most common crime type
    }).reset_index()
    
    # Flatten multi-level columns
    monthly_features.columns = ['month', 'incidents', 'avg_day', 'std_day', 'avg_hour', 'std_hour', 'dominant_crime']
    
    # Fill NaN standard deviations (for months with only 1 incident)
    monthly_features['std_day'] = monthly_features['std_day'].fillna(0)
    monthly_features['std_hour'] = monthly_features['std_hour'].fillna(0)
    
    # Prepare feature matrix for Isolation Forest
    feature_cols = ['incidents', 'avg_day', 'std_day', 'avg_hour', 'std_hour']
    X = monthly_features[feature_cols].values
    
    # Standardize features for better ML performance
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Isolation Forest (unsupervised ML anomaly detection)
    # contamination=0.1 means we expect ~10% of months to be anomalous
    iso_forest = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    
    # Predict anomalies: -1 = anomaly, 1 = normal
    predictions = iso_forest.fit_predict(X_scaled)
    
    # Get anomaly scores (lower = more anomalous)
    anomaly_scores = iso_forest.score_samples(X_scaled)
    
    # Normalize anomaly scores to 0-100 scale (inverted: higher = more anomalous)
    min_score = anomaly_scores.min()
    max_score = anomaly_scores.max()
    normalized_scores = 100 * (1 - (anomaly_scores - min_score) / (max_score - min_score + 1e-10))
    
    # Build response - use 'month' instead of 'date' to match frontend
    results = []
    for idx, row in monthly_features.iterrows():
        results.append({
            "month": str(row['month']),
            "incidents": int(row['incidents']),
            "isAnomaly": bool(predictions[idx] == -1),
            "anomalyScore": round(float(normalized_scores[idx]), 2),
            "avgDayOfWeek": round(float(row['avg_day']), 2),
            "avgHour": round(float(row['avg_hour']), 2),
            "dominantCrime": str(row['dominant_crime'])
        })
        
    return sorted(results, key=lambda x: x['month'])

@app.get("/api/v1/geospatial/hotspots")
def get_map_hotspots(limit: int = 2000):
    """Returns a sampled list of coordinates for the ScatterChart Map."""
    if 'incidents' not in DB: raise HTTPException(status_code=503, detail="Incidents data not available")
    
    # We sample the data to prevent overwhelming the browser's rendering engine
    df = DB['incidents'].sample(n=min(limit, len(DB['incidents'])))
    
    # Filter out any NaN coordinates
    df = df.dropna(subset=['latitude', 'longitude'])
    
    # Format response to match frontend expectations: {id, lat, lon, crime_type, district}
    results = []
    for idx, row in df.iterrows():
        # Get district name if available, otherwise use district_id or a placeholder
        district = "Unknown"
        if 'district_name' in row:
            district = str(row['district_name'])
        elif 'district_id' in row:
            # Try to find district name from districts table
            district_id = row['district_id']
            district_row = DB['districts'][DB['districts']['district_id'] == district_id]
            if not district_row.empty and 'name' in district_row.columns:
                district = str(district_row.iloc[0]['name'])
            else:
                district = f"District {district_id}"
        
        results.append({
            "id": str(row.get('incident_id', f"INC-{idx}")),
            "lat": float(row['latitude']),
            "lon": float(row['longitude']),
            "crime_type": str(row['crime_type']),
            "district": district
        })
    
    return results


@app.get("/api/v1/network/kingpins")
def get_network_kingpins(top_n: int = 10):
    """Calculates Degree Centrality to find the top targets."""
    if 'associations' not in DB or 'criminals' not in DB:
        raise HTTPException(status_code=503, detail="Network data not available")
    
    # Calculate degrees (connections) per criminal
    assoc_df = DB['associations']
    all_nodes = pd.concat([assoc_df['source_id'], assoc_df['target_id']])
    degree_counts = all_nodes.value_counts().to_dict()
    
    criminals_df = DB['criminals'].copy()
    
    # Map connections back to profiles
    criminals_df['connections'] = criminals_df['criminal_id'].map(degree_counts).fillna(0)
    
    # Sort and take top N
    kingpins = criminals_df.sort_values(by='connections', ascending=False).head(top_n)
    
    # Format for JSON response matching frontend Kingpin interface
    results = []
    for _, row in kingpins.iterrows():
        # Handle NaN values safely for JSON serialization
        age = row.get('age', 0)
        risk_score = row.get('base_risk_score', 0)
        
        # Determine threat level based on risk score if not present
        threat_level = row.get('threat_level', None)
        if threat_level is None or (isinstance(threat_level, float) and math.isnan(threat_level)):
            if risk_score > 80:
                threat_level = "Critical"
            elif risk_score > 65:
                threat_level = "High"
            elif risk_score > 45:
                threat_level = "Medium"
            else:
                threat_level = "Low"
        
        results.append({
            "criminal_id": str(row['criminal_id']),
            "name": str(row['name']),
            "age": int(age) if not (isinstance(age, float) and math.isnan(age)) else 30,
            "base_risk_score": int(risk_score) if not (isinstance(risk_score, float) and math.isnan(risk_score)) else 0,
            "threat_level": str(threat_level),
            "connections": int(row['connections'])
        })
        
    return results


@app.options("/api/v1/predict-risk")
async def predict_risk_options():
    """Handle OPTIONS preflight for predict-risk endpoint"""
    return {}


@app.post("/api/v1/predict-risk")
def predict_suspect_risk(suspect: SuspectProfile):
    """
    🧠 AI-Powered Threat Prediction Endpoint
    
    Takes live suspect features and runs them through the Random Forest Classifier
    to predict their operational threat level.
    
    Features analyzed:
    - Age: Suspect's age
    - Base Risk Score: Initial risk assessment (0-100)
    - Connections: Number of known criminal associations
    
    Returns:
    - Predicted threat level (Critical, High, Medium, Low)
    - AI confidence score (0-100%)
    - Input features analyzed
    """
    if rf_model is None:
        raise HTTPException(
            status_code=503, 
            detail="Machine Learning model is not available. Please run ml_pipeline.py to train the model."
        )
    
    try:
        # Scikit-learn expects a 2D array: [[age, risk, connections]]
        features = np.array([[suspect.age, suspect.base_risk_score, suspect.connections]])
        
        # Run prediction
        prediction = rf_model.predict(features)[0]  # e.g., "Critical", "High", "Medium", "Low"
        
        # Calculate confidence score by extracting prediction probabilities
        probabilities = rf_model.predict_proba(features)[0]
        confidence = round(max(probabilities) * 100, 1)
        
        # Get all class probabilities for detailed analysis
        # Frontend expects: { Low: number, Medium: number, High: number, Critical: number }
        class_probabilities = {}
        for cls, prob in zip(rf_model.classes_, probabilities):
            class_probabilities[cls] = round(prob, 4)
        
        # Ensure all required classes are present
        for level in ["Low", "Medium", "High", "Critical"]:
            if level not in class_probabilities:
                class_probabilities[level] = 0.0
        
        # Format response to match frontend PredictionResult interface
        return {
            "prediction": prediction,
            "confidence": int(confidence),
            "probabilities": class_probabilities,
            "model": f"RandomForestClassifier v2.4 (n_estimators={rf_model.n_estimators})"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    print("Starting KSP Analytics API Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)