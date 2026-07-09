import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';
import 'onboarding_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _profile;

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

      final userRes = await http.get(
        Uri.parse('http://13.60.192.118:3001/auth/me'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (userRes.statusCode == 200) {
        final userData = jsonDecode(userRes.body);
        
        final role = userData['role'];
        final endpoint = role == 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
        
        final profRes = await http.get(
          Uri.parse('http://13.60.192.118:3001$endpoint'),
          headers: {'Authorization': 'Bearer $token'},
        );

        if (profRes.statusCode == 200) {
          setState(() {
            _user = userData;
            _profile = jsonDecode(profRes.body);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    if (!mounted) return;
    Navigator.of(context, rootNavigator: true).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  Widget _buildSeekerProfile() {
    final name = '${_profile?['firstName'] ?? ''} ${_profile?['lastName'] ?? ''}'.trim();
    final location = '${_profile?['residenceCity'] ?? ''} ${_profile?['residenceCountry'] ?? ''}'.trim();
    final profession = _profile?['profession'] ?? 'Job Seeker';
    final picUrl = _profile?['profilePicture'];
    final isSkilled = _profile?['isSkilledProfessional'] == true;
    
    final education = _profile?['education'] as List<dynamic>? ?? [];
    final experience = _profile?['experience'] as List<dynamic>? ?? [];
    final certificates = _profile?['certificates'] as List<dynamic>? ?? [];
    final achievements = _profile?['achievements'] as List<dynamic>? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: CircleAvatar(
            radius: 60,
            backgroundColor: Colors.white.withOpacity(0.1),
            backgroundImage: (picUrl != null && picUrl.isNotEmpty) ? NetworkImage(picUrl) : null,
            child: (picUrl == null || picUrl.isEmpty) ? const Icon(Icons.person, size: 60, color: Colors.white) : null,
          ),
        ),
        const SizedBox(height: 16),
        Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white), textAlign: TextAlign.center),
        Text(profession, style: const TextStyle(fontSize: 18, color: Color(0xFF00F0FF)), textAlign: TextAlign.center),
        if (location.isNotEmpty)
          Text(location, style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7)), textAlign: TextAlign.center),
        if (isSkilled)
          Text('Skilled Professional: ${_profile?['skilledProfession'] ?? 'Yes'}', style: const TextStyle(fontSize: 14, color: Colors.orangeAccent), textAlign: TextAlign.center),
        
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const OnboardingScreen())).then((_) => _fetchData());
          },
          icon: const Icon(Icons.edit, color: Colors.white),
          label: const Text('Edit Profile', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366F1),
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        
        const SizedBox(height: 32),
        _buildSectionTitle('Personal Details'),
        _buildInfoRow('Gender', _profile?['gender'] ?? 'Not specified'),
        if (_profile?['dateOfBirth'] != null)
          _buildInfoRow('Date of Birth', (_profile?['dateOfBirth'] as String).split('T')[0]),
        _buildInfoRow('Citizenship', _profile?['citizenshipCountry'] ?? 'Not specified'),

        if (education.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Education'),
          ...education.map((e) => _buildCardItem(e['school'], e['course'], 'Dates: ${e['dates']} • Grad: ${e['yearGraduated']}')),
        ],

        if (experience.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Experience'),
          ...experience.map((e) => _buildCardItem(e['company'], e['role'], 'Dates: ${e['dates']}')),
        ],

        if (certificates.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Certifications'),
          ...certificates.map((e) => _buildCardItem(e['name'], null, 'Date: ${e['date']}')),
        ],

        if (achievements.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Achievements & Awards'),
          ...achievements.map((e) => _buildCardItem(e['title'], null, 'Date: ${e['date']}')),
        ],
      ],
    );
  }

  Widget _buildCardItem(String? title, String? subtitle1, String? subtitle2) {
    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title != null) Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            if (subtitle1 != null) ...[const SizedBox(height: 4), Text(subtitle1, style: const TextStyle(color: Colors.white, fontSize: 14))],
            if (subtitle2 != null) ...[const SizedBox(height: 4), Text(subtitle2, style: const TextStyle(color: Colors.white70, fontSize: 14))],
          ],
        ),
      ),
    );
  }

  Widget _buildEmployerProfile() {
    final name = _profile?['companyName'] ?? 'Employer';
    final location = '${_profile?['locationCity'] ?? ''} ${_profile?['locationCountry'] ?? ''}'.trim();
    final picUrl = _profile?['profilePicture'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: CircleAvatar(
            radius: 60,
            backgroundColor: Colors.white.withOpacity(0.1),
            backgroundImage: (picUrl != null && picUrl.isNotEmpty) ? NetworkImage(picUrl) : null,
            child: (picUrl == null || picUrl.isEmpty) ? const Icon(Icons.business, size: 60, color: Colors.white) : null,
          ),
        ),
        const SizedBox(height: 16),
        Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white), textAlign: TextAlign.center),
        if (location.isNotEmpty)
          Text(location, style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7)), textAlign: TextAlign.center),
        
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const OnboardingScreen())).then((_) => _fetchData());
          },
          icon: const Icon(Icons.edit, color: Colors.white),
          label: const Text('Edit Profile', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366F1),
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        
        const SizedBox(height: 32),
        _buildSectionTitle('About the Company'),
        Text(_profile?['description'] ?? 'No description provided.', style: TextStyle(color: Colors.white.withOpacity(0.8), height: 1.5)),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 16)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF120B1C),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_user == null || _profile == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF120B1C),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Profile incomplete', style: TextStyle(color: Colors.white, fontSize: 18)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const OnboardingScreen())),
                child: const Text('Complete Profile'),
              ),
              const SizedBox(height: 16),
              TextButton(onPressed: _logout, child: const Text('Logout', style: TextStyle(color: Colors.redAccent))),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF120B1C),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_user!['role'] == 'JOB_SEEKER') _buildSeekerProfile() else _buildEmployerProfile(),
              const SizedBox(height: 48),
              OutlinedButton.icon(
                onPressed: _logout,
                icon: const Icon(Icons.logout, color: Colors.redAccent),
                label: const Text('Logout', style: TextStyle(color: Colors.redAccent)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Colors.redAccent),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
