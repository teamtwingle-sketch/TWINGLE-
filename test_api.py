#!/usr/bin/env python3
"""
Quick API test script for Mallu Match
Tests all major endpoints to ensure they're working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_register():
    """Test user registration"""
    print("\n🧪 Testing Registration...")
    data = {
        "email": "testuser@example.com",
        "password": "testpass123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/register/", json=data)
        if response.status_code == 201:
            print("✅ Registration successful")
            return True
        elif response.status_code == 400:
            print("⚠️  User already exists (this is okay)")
            return True
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_login():
    """Test user login and return token"""
    print("\n🧪 Testing Login...")
    data = {
        "email": "anjali@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=data)
        if response.status_code == 200:
            result = response.json()
            if 'access' in result and 'user_id' in result:
                print("✅ Login successful")
                print(f"   User ID: {result['user_id']}")
                return result['access']
            else:
                print("❌ Login response missing required fields")
                return None
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_profile(token):
    """Test profile retrieval"""
    print("\n🧪 Testing Profile...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/profile/", headers=headers)
        if response.status_code == 200:
            profile = response.json()
            print("✅ Profile retrieved successfully")
            print(f"   Name: {profile.get('first_name', 'Not set')}")
            print(f"   Age: {profile.get('age', 'Not set')}")
            print(f"   District: {profile.get('district', 'Not set')}")
            return True
        else:
            print(f"❌ Profile retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_discovery(token):
    """Test discovery endpoint"""
    print("\n🧪 Testing Discovery...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/discovery/", headers=headers)
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Discovery successful - Found {len(users)} potential matches")
            if users:
                print(f"   First match: {users[0].get('first_name', 'Unknown')}")
            return True
        else:
            print(f"❌ Discovery failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_matches(token):
    """Test matches endpoint"""
    print("\n🧪 Testing Matches...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/matches/", headers=headers)
        if response.status_code == 200:
            matches = response.json()
            print(f"✅ Matches retrieved - {len(matches)} matches found")
            return True
        else:
            print(f"❌ Matches retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_plans(token):
    """Test subscription plans endpoint"""
    print("\n🧪 Testing Subscription Plans...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/plans/", headers=headers)
        if response.status_code == 200:
            plans = response.json()
            print(f"✅ Plans retrieved - {len(plans)} plans available")
            for plan in plans:
                print(f"   - {plan['name']}: ₹{plan['price']} for {plan['duration_days']} days")
            return True
        else:
            print(f"❌ Plans retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chats(token):
    """Test chat list endpoint"""
    print("\n🧪 Testing Chat List...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/chats/", headers=headers)
        if response.status_code == 200:
            chats = response.json()
            print(f"✅ Chats retrieved - {len(chats)} conversations found")
            return True
        else:
            print(f"❌ Chats retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 Mallu Match API Test Suite")
    print("=" * 60)
    
    # Test registration (optional, might already exist)
    test_register()
    
    # Test login and get token
    token = test_login()
    if not token:
        print("\n❌ Cannot proceed without valid token")
        return
    
    # Test authenticated endpoints
    results = []
    results.append(("Profile", test_profile(token)))
    results.append(("Discovery", test_discovery(token)))
    results.append(("Matches", test_matches(token)))
    results.append(("Plans", test_plans(token)))
    results.append(("Chats", test_chats(token)))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print("=" * 60)
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
