"""
Quick CORS Test for /api/v1/predict-risk endpoint
Tests OPTIONS preflight request
"""

import requests

API_BASE = "http://localhost:8000"

def test_options_preflight():
    """Test OPTIONS preflight for POST /api/v1/predict-risk"""
    
    print("Testing OPTIONS preflight request...")
    print(f"URL: {API_BASE}/api/v1/predict-risk")
    
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    
    try:
        response = requests.options(
            f"{API_BASE}/api/v1/predict-risk",
            headers=headers,
            timeout=5
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print("\nResponse Headers:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'allow' in key.lower():
                print(f"  {key}: {value}")
        
        if response.status_code == 200:
            print("\n✅ OPTIONS preflight PASSED")
            return True
        else:
            print(f"\n❌ OPTIONS preflight FAILED with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_actual_post():
    """Test actual POST request"""
    
    print("\n" + "="*60)
    print("Testing actual POST request...")
    print(f"URL: {API_BASE}/api/v1/predict-risk")
    
    payload = {
        "age": 32,
        "base_risk_score": 75,
        "connections": 18
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/api/v1/predict-risk",
            json=payload,
            headers=headers,
            timeout=5
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\nResponse:")
            print(f"  Prediction: {data.get('prediction')}")
            print(f"  Confidence: {data.get('confidence')}%")
            print(f"  Model: {data.get('model')}")
            print("\n✅ POST request PASSED")
            return True
        else:
            print(f"\n❌ POST request FAILED")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("CORS Testing for AI Threat Prediction Endpoint")
    print("="*60)
    
    # Test OPTIONS preflight
    options_pass = test_options_preflight()
    
    # Test actual POST
    post_pass = test_actual_post()
    
    print("\n" + "="*60)
    print("Summary:")
    print(f"  OPTIONS preflight: {'✅ PASS' if options_pass else '❌ FAIL'}")
    print(f"  POST request:      {'✅ PASS' if post_pass else '❌ FAIL'}")
    print("="*60)
    
    if options_pass and post_pass:
        print("\n✅ All CORS tests passed!")
        exit(0)
    else:
        print("\n❌ Some tests failed. Please restart backend and try again.")
        exit(1)
