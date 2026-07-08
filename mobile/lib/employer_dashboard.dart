import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class EmployerDashboard extends StatefulWidget {
  const EmployerDashboard({super.key});

  @override
  State<EmployerDashboard> createState() => _EmployerDashboardState();
}

class _EmployerDashboardState extends State<EmployerDashboard> {
  int _currentIndex = 0;
  List<dynamic> _jobs = [];
  List<dynamic> _inbox = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) return;

      final jobsRes = await http.get(Uri.parse('http://13.60.192.118:3001/jobs/employer/me'), headers: {'Authorization': 'Bearer $token'});
      final inboxRes = await http.get(Uri.parse('http://13.60.192.118:3001/messages/inbox'), headers: {'Authorization': 'Bearer $token'});

      setState(() {
        if (jobsRes.statusCode == 200) _jobs = jsonDecode(jobsRes.body);
        if (inboxRes.statusCode == 200) _inbox = jsonDecode(inboxRes.body);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF120B1C),
      appBar: AppBar(
        title: const Text('Employer Dashboard'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading ? const Center(child: CircularProgressIndicator()) : IndexedStack(
        index: _currentIndex,
        children: [
          _buildList(_jobs, 'No jobs posted yet.', isJobs: true),
          _buildInbox(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0A0A0A),
        selectedItemColor: const Color(0xFF00F0FF),
        unselectedItemColor: Colors.white54,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.work), label: 'My Jobs'),
          BottomNavigationBarItem(icon: Icon(Icons.message), label: 'Messages'),
        ],
      ),
    );
  }

  Widget _buildList(List<dynamic> items, String emptyMsg, {bool isJobs = false}) {
    if (items.isEmpty) return Center(child: Text(emptyMsg, style: const TextStyle(color: Colors.white)));
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return ListTile(
          title: Text(item['title'] ?? 'Job', style: const TextStyle(color: Colors.white)),
          subtitle: Text(isJobs ? 'Applications: ${item['_count']?['applications'] ?? 0}' : '', style: const TextStyle(color: Colors.white54)),
        );
      },
    );
  }

  Widget _buildInbox() {
    if (_inbox.isEmpty) return const Center(child: Text('No messages', style: TextStyle(color: Colors.white)));
    return ListView.builder(
      itemCount: _inbox.length,
      itemBuilder: (context, index) {
        final item = _inbox[index];
        return ListTile(
          title: Text('Candidate', style: const TextStyle(color: Colors.white)),
          subtitle: Text(item['latestMessage']?['content'] ?? '', style: const TextStyle(color: Colors.white54)),
        );
      },
    );
  }
}
