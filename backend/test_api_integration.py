"""
API Integration Test Suite
Tests all backend endpoints to ensure they work correctly with real data
and return responses in the format expected by the frontend.

Usage: python test_api_integration.py
"""

import requests
import json
import sys
from typing import Dict, Any, List
from datetime import datetime

# API Configuration
API_BASE = "http://localhost:8000"
TIMEOUT = 10

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def log_success(self, message: str):
        print(f"{GREEN}✓{RESET} {message}")
        self.passed += 1
        
    def log_error(self, message: str):
        print(f"{RED}✗{RESET} {message}")
        self.failed += 1
        
    def log_warning(self, message: str):
        print(f"{YELLOW}⚠{RESET} {message}")
        self.warnings += 1
        
    def log_info(self, message: str):
        print(f"{BLUE}ℹ{RESET} {message}")
    
    def test_endpoint(self, name: str, method: str, path: str, expected_fields: List[str], 
                     body: Dict = None, is_list: bool = False) -> bool:
        """Test a single API endpoint"""
        print(f"\n{BLUE}Testing:{RESET} {name}")
        print(f"  Endpoint: {method} {path}")
        
        try:
            url = f"{self.base_url}{path}"
            
            if method == "GET":
                response = requests.get(url, timeout=TIMEOUT)
            elif method == "POST":
                response = requests.post(url, json=body, timeout=TIMEOUT)
            else:
                self.log_error(f"Unsupported method: {method}")
                return False
            
            # Check status code
            if response.status_code != 200:
                self.log_error(f"Expected status 200, got {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                return False
            
            self.log_success(f"Status code: {response.status_code}")
            
            # Parse JSON
            try:
                data = response.json()
            except json.JSONDecodeError:
                self.log_error("Invalid JSON response")
                return False
            
            self.log_success("Valid JSON response")
            
            # Check if response is list or dict
            if is_list:
                if not isinstance(data, list):
                    self.log_error(f"Expected list, got {type(data).__name__}")
                    return False
                
                if len(data) == 0:
                    self.log_warning("Response is empty list")
                    return True
                
                self.log_success(f"Response contains {len(data)} items")
                
                # Check first item for expected fields
                item = data[0]
                missing_fields = [f for f in expected_fields if f not in item]
                if missing_fields:
                    self.log_error(f"Missing fields: {', '.join(missing_fields)}")
                    return False
                
                self.log_success(f"All required fields present in first item")
                
                # Show sample data
                print(f"  Sample item: {json.dumps(item, indent=2)[:200]}...")
                
            else:
                if not isinstance(data, dict):
                    self.log_error(f"Expected dict, got {type(data).__name__}")
                    return False
                
                # Check for expected fields
                missing_fields = [f for f in expected_fields if f not in data]
                if missing_fields:
                    self.log_error(f"Missing fields: {', '.join(missing_fields)}")
                    self.log_info(f"Available fields: {', '.join(data.keys())}")
                    return False
                
                self.log_success(f"All required fields present")
                
                # Show sample data
                sample = {k: v for k, v in list(data.items())[:5]}
                print(f"  Sample data: {json.dumps(sample, indent=2)[:200]}...")
            
            return True
            
        except requests.exceptions.ConnectionError:
            self.log_error("Connection failed - is the backend running?")
            return False
        except requests.exceptions.Timeout:
            self.log_error(f"Request timeout (>{TIMEOUT}s)")
            return False
        except Exception as e:
            self.log_error(f"Unexpected error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API integration tests"""
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}KSP Crime Analytics API Integration Test Suite{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        print(f"API Base URL: {self.base_url}")
        print(f"Timeout: {TIMEOUT}s")
        
        # Test 1: Root endpoint
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}1. Root Endpoint{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        self.test_endpoint(
            name="API Health Check",
            method="GET",
            path="/",
            expected_fields=["status", "node", "service"],
            is_list=False
        )
        
        # Test 2: Overview Stats
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}2. Overview Statistics{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        self.test_endpoint(
            name="Overview Statistics",
            method="GET",
            path="/api/v1/overview/stats",
            expected_fields=["total_incidents", "total_criminals", "total_associations", 
                           "districts_monitored", "active_alerts", "crime_breakdown"],
            is_list=False
        )
        
        # Test 3: Anomaly Timeline
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}3. Anomaly Detection Timeline{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        self.test_endpoint(
            name="Anomaly Timeline",
            method="GET",
            path="/api/v1/analytics/timeline",
            expected_fields=["month", "incidents", "isAnomaly", "anomalyScore", 
                           "avgDayOfWeek", "avgHour", "dominantCrime"],
            is_list=True
        )
        
        # Test 4: Geospatial Hotspots
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}4. Geospatial Hotspots{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        self.test_endpoint(
            name="Geospatial Hotspots (limit=100)",
            method="GET",
            path="/api/v1/geospatial/hotspots?limit=100",
            expected_fields=["id", "lat", "lon", "crime_type", "district"],
            is_list=True
        )
        
        # Test 5: Network Kingpins
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}5. Network Intelligence - Kingpins{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        self.test_endpoint(
            name="Network Kingpins (top 15)",
            method="GET",
            path="/api/v1/network/kingpins?top_n=15",
            expected_fields=["criminal_id", "name", "age", "base_risk_score", 
                           "threat_level", "connections"],
            is_list=True
        )
        
        # Test 6: AI Threat Prediction
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}6. AI Threat Prediction{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        
        # Test with different risk profiles
        test_cases = [
            {"age": 25, "base_risk_score": 85, "connections": 30, "expected": "Critical/High"},
            {"age": 40, "base_risk_score": 45, "connections": 8, "expected": "Medium"},
            {"age": 50, "base_risk_score": 20, "connections": 2, "expected": "Low"},
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n  Test Case {i}: Age={test_case['age']}, Risk={test_case['base_risk_score']}, Connections={test_case['connections']}")
            self.test_endpoint(
                name=f"AI Threat Prediction - Case {i}",
                method="POST",
                path="/api/v1/predict-risk",
                body={
                    "age": test_case['age'],
                    "base_risk_score": test_case['base_risk_score'],
                    "connections": test_case['connections']
                },
                expected_fields=["prediction", "confidence", "probabilities", "model"],
                is_list=False
            )
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}Test Summary{RESET}")
        print(f"{BLUE}{'='*70}{RESET}")
        
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"{GREEN}Passed:{RESET} {self.passed}/{total} ({pass_rate:.1f}%)")
        print(f"{RED}Failed:{RESET} {self.failed}/{total}")
        print(f"{YELLOW}Warnings:{RESET} {self.warnings}")
        
        if self.failed == 0:
            print(f"\n{GREEN}{'='*70}{RESET}")
            print(f"{GREEN}✓ All tests passed! API integration is working correctly.{RESET}")
            print(f"{GREEN}{'='*70}{RESET}")
            return 0
        else:
            print(f"\n{RED}{'='*70}{RESET}")
            print(f"{RED}✗ Some tests failed. Please check the errors above.{RESET}")
            print(f"{RED}{'='*70}{RESET}")
            return 1

def main():
    """Main test runner"""
    tester = APITester(API_BASE)
    
    try:
        exit_code = tester.run_all_tests()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Tests interrupted by user{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{RED}Unexpected error: {str(e)}{RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()
