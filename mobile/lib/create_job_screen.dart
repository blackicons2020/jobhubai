import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CreateJobScreen extends StatefulWidget {
  const CreateJobScreen({super.key});

  @override
  State<CreateJobScreen> createState() => _CreateJobScreenState();
}

class _CreateJobScreenState extends State<CreateJobScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _salaryController = TextEditingController();
  bool _isRemote = false;
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _createJob() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          _errorMessage = 'You must be logged in as an Employer.';
          _isLoading = false;
        });
        return;
      }

      final response = await http.post(
        Uri.parse('http://13.60.192.118:3001/jobs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'title': _titleController.text,
          'description': _descriptionController.text,
          'location': _locationController.text,
          'salary': _salaryController.text,
          'isRemote': _isRemote,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Job posted successfully!')),
        );
        Navigator.pop(context); // Go back to Job Board
      } else {
        setState(() {
          _errorMessage = 'Failed to post job. Make sure you are an Employer.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Post a New Job'),
        backgroundColor: const Color(0xFF120B1C),
        elevation: 0,
      ),
      body: Container(
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.5,
            colors: [Color(0xFF120B1C), Color(0xFF0A0A0A)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 24),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.withOpacity(0.5)),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.redAccent),
                      textAlign: TextAlign.center,
                    ),
                  ),
                
                TextField(
                  controller: _titleController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Job Title',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
                const SizedBox(height: 16),
                
                TextField(
                  controller: _descriptionController,
                  style: const TextStyle(color: Colors.white),
                  maxLines: 5,
                  decoration: InputDecoration(
                    labelText: 'Job Description',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
                const SizedBox(height: 16),
                
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _locationController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Location',
                          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.05),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _salaryController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Salary Range',
                          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.05),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                CheckboxListTile(
                  title: const Text('This is a remote position', style: TextStyle(color: Colors.white)),
                  value: _isRemote,
                  onChanged: (val) {
                    setState(() {
                      _isRemote = val ?? false;
                    });
                  },
                  activeColor: const Color(0xFF6366F1),
                  checkColor: Colors.white,
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                ),
                const SizedBox(height: 32),
                
                ElevatedButton(
                  onPressed: _isLoading ? null : _createJob,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Post Job', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
