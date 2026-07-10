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
  int _completion = 0;
  
  bool _isAiLoading = false;
  Map<String, dynamic>? _aiScore;
  Map<String, dynamic>? _aiSalary;
  List<dynamic>? _aiSuggestions;

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
          });
        }
        
        if (role == 'JOB_SEEKER') {
          final compRes = await http.get(
            Uri.parse('http://13.60.192.118:3001/profiles/job-seeker/completion'),
            headers: {'Authorization': 'Bearer $token'},
          );
          if (compRes.statusCode == 200) {
            setState(() {
              _completion = jsonDecode(compRes.body)['completion'] ?? 0;
            });
          }
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateAiInsights() async {
    if (_profile == null) return;
    setState(() => _isAiLoading = true);
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      
      // Fetch Score
      final scoreRes = await http.post(
        Uri.parse('http://13.60.192.118:3001/ai/profile/score'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode(_profile),
      );
      
      // Fetch Salary
      final salaryRes = await http.post(
        Uri.parse('http://13.60.192.118:3001/ai/salary/estimate'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode({
          'job_title': _profile?['profession'] ?? 'Job Seeker',
          'location': _profile?['residenceCity'] ?? 'Unknown',
          'experience_years': 3,
        }),
      );
      
      // Fetch Suggestions
      final suggsRes = await http.post(
        Uri.parse('http://13.60.192.118:3001/ai/career/suggestions'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode(_profile),
      );

      setState(() {
        if (scoreRes.statusCode == 200) _aiScore = jsonDecode(scoreRes.body);
        if (salaryRes.statusCode == 200) _aiSalary = jsonDecode(salaryRes.body);
        if (suggsRes.statusCode == 200) _aiSuggestions = jsonDecode(suggsRes.body)['suggestions'];
      });
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      setState(() => _isAiLoading = false);
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
    final profession = _profile?['headline'] ?? _profile?['profession'] ?? 'Job Seeker';
    final picUrl = _profile?['profilePicture'];
    final isVerified = _profile?['verificationStatus'] == 'VERIFIED';
    
    final education = _profile?['education'] as List<dynamic>? ?? [];
    final experience = _profile?['experience'] as List<dynamic>? ?? [];
    final projects = _profile?['projects'] as List<dynamic>? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Stack(
            children: [
              CircleAvatar(
                radius: 60,
                backgroundColor: Colors.white.withOpacity(0.1),
                backgroundImage: (picUrl != null && picUrl.isNotEmpty) ? NetworkImage(picUrl) : null,
                child: (picUrl == null || picUrl.isEmpty) ? const Icon(Icons.person, size: 60, color: Colors.white) : null,
              ),
              if (isVerified)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF120B1C)),
                    child: const Icon(Icons.verified, color: Color(0xFF00F0FF), size: 30),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white), textAlign: TextAlign.center),
        Text(profession, style: const TextStyle(fontSize: 18, color: Color(0xFF00F0FF)), textAlign: TextAlign.center),
        if (location.isNotEmpty)
          Text(location, style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7)), textAlign: TextAlign.center),
        
        const SizedBox(height: 16),
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: const Color(0xFF00F0FF).withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
            child: Text('★★★★☆ Profile Strength ($_completion%)', style: const TextStyle(color: Color(0xFF00F0FF), fontWeight: FontWeight.bold)),
          ),
        ),
        
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const OnboardingScreen())).then((_) => _fetchData());
                },
                icon: const Icon(Icons.edit, color: Colors.black),
                label: const Text('Edit Profile', style: TextStyle(color: Colors.black)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00F0FF),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download, color: Colors.white),
                label: const Text('CV', style: TextStyle(color: Colors.white)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: const BorderSide(color: Colors.white),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: _isAiLoading ? null : _generateAiInsights,
          icon: const Icon(Icons.auto_awesome, color: Colors.white),
          label: Text(_isAiLoading ? 'Generating AI Insights...' : 'Generate AI Career Insights', style: const TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.indigoAccent,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),

        if (_aiScore != null || _aiSalary != null) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF00F0FF).withOpacity(0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Color(0xFF00F0FF), size: 20),
                    const SizedBox(width: 8),
                    const Text('AI Career Insights', style: TextStyle(color: Color(0xFF00F0FF), fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                
                if (_aiSalary != null) ...[
                  const Text('Estimated Market Salary', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 4),
                  Text('${_aiSalary!['currency']} ${_aiSalary!['min']} - ${_aiSalary!['max']}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(_aiSalary!['reasoning'] ?? '', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(height: 16),
                ],

                if (_aiScore != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Resume Score', style: TextStyle(color: Colors.white70, fontSize: 14)),
                      Text('${_aiScore!['score']}/100', style: TextStyle(color: _aiScore!['score'] > 80 ? Colors.greenAccent : Colors.orangeAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_aiScore!['suggestions'] != null)
                    ...(_aiScore!['suggestions'] as List<dynamic>).map((s) => Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(color: Colors.white54)),
                          Expanded(child: Text(s.toString(), style: const TextStyle(color: Colors.white54, fontSize: 12))),
                        ],
                      ),
                    )),
                  const SizedBox(height: 16),
                ],

                if (_aiSuggestions != null) ...[
                  const Text('Career Path Suggestions', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _aiSuggestions!.map((s) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                      child: Text(s.toString(), style: const TextStyle(color: Colors.white, fontSize: 12)),
                    )).toList(),
                  ),
                ],
              ],
            ),
          ),
        ],

        if (_profile?['summary'] != null && _profile!['summary'].toString().isNotEmpty) ...[
          const SizedBox(height: 32),
          _buildSectionTitle('About Me'),
          Text(_profile!['summary'], style: TextStyle(color: Colors.white.withOpacity(0.8), height: 1.5)),
        ],

        const SizedBox(height: 32),
        _buildSectionTitle('Job Preferences'),
        _buildInfoRow('Desired Title', _profile?['desiredJobTitle'] ?? 'Any'),
        _buildInfoRow('Employment Type', _profile?['employmentType'] ?? 'Any'),
        _buildInfoRow('Work Setup', _profile?['workArrangement'] ?? 'Any'),
        _buildInfoRow('Salary', _profile?['expectedSalary'] ?? 'Negotiable'),

        if (experience.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Experience'),
          ...experience.map((e) => _buildCardItem(e['role'], e['company'], 'Dates: ${e['dates']}')),
        ],

        if (education.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Education'),
          ...education.map((e) => _buildCardItem(e['school'], e['course'], 'Dates: ${e['dates'] ?? e['yearGraduated']}')),
        ],

        if (projects.isNotEmpty) ...[
          const SizedBox(height: 24),
          _buildSectionTitle('Projects'),
          ...projects.map((e) => _buildCardItem(e['title'], e['description'], e['liveLink'])),
        ],
      ],
    );
  }

  Widget _buildCardItem(String? title, String? subtitle1, String? subtitle2) {
    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 8.0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.white.withOpacity(0.1))),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title != null) Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            if (subtitle1 != null && subtitle1.isNotEmpty) ...[const SizedBox(height: 4), Text(subtitle1, style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 14))],
            if (subtitle2 != null && subtitle2.isNotEmpty) ...[const SizedBox(height: 8), Text(subtitle2, style: const TextStyle(color: Colors.white70, fontSize: 14))],
          ],
        ),
      ),
    );
  }

  Widget _buildEmployerProfile() {
    final name = _profile?['companyName'] ?? 'Employer';
    final location = '${_profile?['locationCity'] ?? ''} ${_profile?['locationCountry'] ?? ''}'.trim();
    final picUrl = _profile?['profilePicture'];
    final isVerified = _profile?['verificationStatus'] == 'VERIFIED';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Stack(
            children: [
              CircleAvatar(
                radius: 60,
                backgroundColor: Colors.white.withOpacity(0.1),
                backgroundImage: (picUrl != null && picUrl.isNotEmpty) ? NetworkImage(picUrl) : null,
                child: (picUrl == null || picUrl.isEmpty) ? const Icon(Icons.business, size: 60, color: Colors.white) : null,
              ),
              if (isVerified)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF120B1C)),
                    child: const Icon(Icons.verified, color: Color(0xFF00F0FF), size: 30),
                  ),
                ),
            ],
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
          icon: const Icon(Icons.edit, color: Colors.black),
          label: const Text('Edit Company Profile', style: TextStyle(color: Colors.black)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00F0FF),
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        
        const SizedBox(height: 32),
        _buildSectionTitle('About the Company'),
        Text(_profile?['description'] ?? 'No description provided.', style: TextStyle(color: Colors.white.withOpacity(0.8), height: 1.5)),

        const SizedBox(height: 32),
        _buildSectionTitle('Company Details'),
        _buildInfoRow('Industry', _profile?['industry'] ?? 'N/A'),
        _buildInfoRow('Company Size', _profile?['companySize'] ?? 'N/A'),
        _buildInfoRow('Founded Year', _profile?['foundedYear']?.toString() ?? 'N/A'),

        const SizedBox(height: 32),
        _buildSectionTitle('Contact HR'),
        _buildInfoRow('Name', _profile?['hrContactName'] ?? 'N/A'),
        _buildInfoRow('Email', _profile?['hrEmail'] ?? 'N/A'),
        _buildInfoRow('Phone', _profile?['hrPhone'] ?? 'N/A'),
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
