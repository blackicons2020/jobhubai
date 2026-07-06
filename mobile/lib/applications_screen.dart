import 'package:flutter/material.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  // Mock data until API integration
  final List<Map<String, dynamic>> _mockApplications = [
    {'id': '1', 'jobTitle': 'Senior AI Engineer', 'company': 'TechCorp AI', 'status': 'VIEWED', 'appliedDate': '2026-07-01'},
    {'id': '2', 'jobTitle': 'Frontend Developer', 'company': 'NeonGlass UI', 'status': 'SHORTLISTED', 'appliedDate': '2026-06-28'},
    {'id': '3', 'jobTitle': 'Product Manager', 'company': 'Global Innovate', 'status': 'APPLIED', 'appliedDate': '2026-07-05'},
  ];

  Color _getStatusColor(String status) {
    switch (status) {
      case 'APPLIED': return Colors.white.withOpacity(0.7);
      case 'VIEWED': return const Color(0xFFF59E0B); // Amber
      case 'SHORTLISTED': return const Color(0xFF3B82F6); // Blue
      case 'HIRED': return const Color(0xFF10B981); // Green
      case 'REJECTED': return const Color(0xFFEF4444); // Red
      default: return Colors.white.withOpacity(0.7);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.5,
            colors: [Color(0xFF120B1C), Color(0xFF0A0A0A)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),
                Text(
                  'My Applications',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    foreground: Paint()
                      ..shader = const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF00F0FF)],
                      ).createShader(const Rect.fromLTWH(0.0, 0.0, 250.0, 50.0)),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Track the status of your recent job applications.',
                  style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.7)),
                ),
                const SizedBox(height: 32),
                
                // Applications List
                Expanded(
                  child: ListView.separated(
                    itemCount: _mockApplications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final app = _mockApplications[index];
                      final statusColor = _getStatusColor(app['status']);
                      
                      return Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Text(
                                    app['jobTitle'],
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: statusColor.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: statusColor.withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    app['status'],
                                    style: TextStyle(
                                      color: statusColor,
                                      fontWeight: 'bold',
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Icon(Icons.business, size: 16, color: Colors.white.withOpacity(0.5)),
                                const SizedBox(width: 6),
                                Text(
                                  app['company'],
                                  style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14),
                                ),
                                const Spacer(),
                                Icon(Icons.calendar_today, size: 16, color: Colors.white.withOpacity(0.5)),
                                const SizedBox(width: 6),
                                Text(
                                  'Applied: ${app['appliedDate']}',
                                  style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
