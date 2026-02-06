import 'package:flutter/material.dart';
import '../../api/client.dart';

class AdminStatsScreen extends StatefulWidget {
  const AdminStatsScreen({super.key});

  @override
  State<AdminStatsScreen> createState() => _AdminStatsScreenState();
}

class _AdminStatsScreenState extends State<AdminStatsScreen> {
  final ApiClient _client = ApiClient();
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final res = await _client.dio.get('/admin/stats/');
      setState(() {
        _stats = res.data;
        _isLoading = false;
      });
    } catch (e) {
      print("Stats error: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Analytics")),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _stats == null
              ? const Center(child: Text("Failed to load stats"))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildStatCard("Total Users", _stats!['total_users'].toString(), Colors.blue),
                      _buildStatCard("New Users Today", _stats!['new_users_today'].toString(), Colors.green),
                      _buildStatCard("Revenue (Est.)", "₹${_stats!['total_revenue']}", Colors.purple),
                      
                      const SizedBox(height: 20),
                      const Text("Verification Status", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          Expanded(child: _buildStatCard("Verified", _stats!['verified_users'].toString(), Colors.teal)),
                          Expanded(child: _buildStatCard("Pending", _stats!['pending_verifications'].toString(), Colors.orange)),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      const Text("Demographics", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                       Row(
                        children: [
                          Expanded(child: _buildStatCard("Male", _stats!['gender_split']['male'].toString(), Colors.indigo)),
                          Expanded(child: _buildStatCard("Female", _stats!['gender_split']['female'].toString(), Colors.pink)),
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Card(
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
