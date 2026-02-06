import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../api/client.dart';
import '../models/user.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final ApiClient _client = ApiClient();
  AuthStatus _status = AuthStatus.unknown;
  User? _currentUser;
  
  AuthStatus get status => _status;
  User? get currentUser => _currentUser;
  
  AuthProvider() {
    checkAuth();
  }
  
  Future<void> checkAuth() async {
    try {
      // Try to fetch profile to verify token
      final response = await _client.dio.get('/profile/');
      _currentUser = User.fromJson(response.data);
      _status = AuthStatus.authenticated;
    } catch (e) {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }
  
  Future<bool> login(String email, String password) async {
    try {
      final response = await _client.dio.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });
      
      final access = response.data['access'];
      final refresh = response.data['refresh'];
      await _client.saveTokens(access, refresh);
      
      await checkAuth();
      return true;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }
  
  Future<bool> register(String email, String password, String confirmPassword) async {
    try {
      await _client.dio.post('/auth/register/', data: {
        'email': email,
        'password': password,
        'confirm_password': confirmPassword,
      });
      return await login(email, password);
    } catch (e) {
      print('Register error: $e');
      return false;
    }
  }

  Future<bool> googleLogin(String idToken) async {
    try {
      final response = await _client.dio.post('/auth/google/', data: {
        'token': idToken, // Backend expects 'token'
      });
      
      final access = response.data['access'];
      final refresh = response.data['refresh'];
      await _client.saveTokens(access, refresh);
      
      await checkAuth();
      return true;
    } catch (e) {
       print('Google Login error: $e');
       return false;
    }
  }

  Future<void> logout() async {
    await _client.logout();
    _status = AuthStatus.unauthenticated;
    _currentUser = null;
    notifyListeners();
  }
}
