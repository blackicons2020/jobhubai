import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'seeker_dashboard.dart';
import 'employer_dashboard.dart';
import 'package:image_picker/image_picker.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 1;
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic>? _user;
  final ImagePicker _picker = ImagePicker();

  // Seeker State
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _otherNames = TextEditingController();
  String _gender = 'Male';
  final _profession = TextEditingController();
  bool _isSkilledProfessional = false;
  final _skilledProfession = TextEditingController();
  final _residenceCountry = TextEditingController();
  final _residenceState = TextEditingController();
  final _residenceCity = TextEditingController();
  final _citizenshipCountry = TextEditingController();
  final _citizenshipState = TextEditingController();
  
  // Employer State
  final _companyName = TextEditingController();
  final _description = TextEditingController();
  final _locationCountry = TextEditingController();
  final _locationState = TextEditingController();
  final _locationCity = TextEditingController();
  
  String? _profilePicUrl;

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) {
        Navigator.pop(context);
        return;
      }
      final res = await http.get(
        Uri.parse('http://13.60.192.118:3001/auth/me'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final userData = jsonDecode(res.body);
        setState(() {
          _user = userData;
          _isLoading = false;
        });
      } else {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      // In a real app, you would upload this image immediately and get a URL.
      // For simplicity in this UI iteration, we'll pretend we got a URL or just show the name.
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Image selected for upload')));
      // _profilePicUrl = ...;
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    String endpoint = _user!['role'] == 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
    Map<String, dynamic> payload = {};

    if (_user!['role'] == 'JOB_SEEKER') {
      payload = {
        'firstName': _firstName.text,
        'lastName': _lastName.text,
        'otherNames': _otherNames.text,
        'gender': _gender,
        'profession': _profession.text,
        'isSkilledProfessional': _isSkilledProfessional,
        'skilledProfession': _skilledProfession.text,
        'residenceCountry': _residenceCountry.text,
        'residenceState': _residenceState.text,
        'residenceCity': _residenceCity.text,
        'citizenshipCountry': _citizenshipCountry.text,
        'citizenshipState': _citizenshipState.text,
        'profilePicture': _profilePicUrl ?? '',
        'skills': [],
      };
    } else {
      payload = {
        'companyName': _companyName.text,
        'description': _description.text,
        'locationCountry': _locationCountry.text,
        'locationState': _locationState.text,
        'locationCity': _locationCity.text,
        'profilePicture': _profilePicUrl ?? '',
      };
    }

    try {
      final res = await http.post(
        Uri.parse('http://13.60.192.118:3001$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: jsonEncode(payload),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        if (!mounted) return;
        if (_user!['role'] == 'EMPLOYER') {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const EmployerDashboard()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const SeekerDashboard()));
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save profile')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Widget _buildTextField(TextEditingController ctrl, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: ctrl,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        ),
      ),
    );
  }

  Widget _buildSeekerSteps() {
    switch (_currentStep) {
      case 1:
        return Column(
          children: [
            const Text('Personal Information', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_firstName, 'First Name'),
            _buildTextField(_lastName, 'Last Name'),
            _buildTextField(_otherNames, 'Other Names (Optional)'),
          ],
        );
      case 2:
        return Column(
          children: [
            const Text('Location', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_residenceCity, 'City'),
            _buildTextField(_residenceState, 'State'),
            _buildTextField(_residenceCountry, 'Country'),
          ],
        );
      case 3:
        return Column(
          children: [
            const Text('Professional Details', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_profession, 'Profession (e.g. Software Engineer)'),
            Row(
              children: [
                Checkbox(value: _isSkilledProfessional, onChanged: (v) => setState(() => _isSkilledProfessional = v ?? false)),
                const Expanded(child: Text('I am a skilled/trade professional', style: TextStyle(color: Colors.white))),
              ],
            ),
            if (_isSkilledProfessional) _buildTextField(_skilledProfession, 'Specify Skill (e.g. Baker)'),
          ],
        );
      case 4:
        return Column(
          children: [
            const Text('Profile Picture', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.white.withOpacity(0.1),
                child: const Icon(Icons.camera_alt, size: 40, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Tap to upload', style: TextStyle(color: Colors.white54)),
          ],
        );
      default:
        return Container();
    }
  }

  Widget _buildEmployerSteps() {
    switch (_currentStep) {
      case 1:
        return Column(
          children: [
            const Text('Company Details', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_companyName, 'Company Name'),
            _buildTextField(_description, 'Description'),
          ],
        );
      case 2:
        return Column(
          children: [
            const Text('Location', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            _buildTextField(_locationCity, 'City'),
            _buildTextField(_locationCountry, 'Country'),
          ],
        );
      case 3:
        return Column(
          children: [
            const Text('Company Logo', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.white.withOpacity(0.1),
                child: const Icon(Icons.camera_alt, size: 40, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Tap to upload', style: TextStyle(color: Colors.white54)),
          ],
        );
      default:
        return Container();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: Color(0xFF120B1C), body: Center(child: CircularProgressIndicator()));
    }

    int maxSteps = _user!['role'] == 'JOB_SEEKER' ? 4 : 3;

    return Scaffold(
      backgroundColor: const Color(0xFF120B1C),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Step $_currentStep of $maxSteps', style: TextStyle(color: Colors.white.withOpacity(0.5))),
              const SizedBox(height: 24),
              Expanded(
                child: SingleChildScrollView(
                  child: _user!['role'] == 'JOB_SEEKER' ? _buildSeekerSteps() : _buildEmployerSteps(),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentStep > 1)
                    TextButton(
                      onPressed: () => setState(() => _currentStep--),
                      child: const Text('Back', style: TextStyle(color: Colors.white)),
                    )
                  else
                    const SizedBox.shrink(),
                  
                  if (_currentStep < maxSteps)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F0FF)),
                      onPressed: () => setState(() => _currentStep++),
                      child: const Text('Next', style: TextStyle(color: Colors.black)),
                    )
                  else
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                      onPressed: _isSaving ? null : _saveProfile,
                      child: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Text('Complete', style: TextStyle(color: Colors.white)),
                    ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
