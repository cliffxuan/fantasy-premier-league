import 'package:intl/intl.dart';

String formatCost(int rawCost) {
  final cost = rawCost / 10;
  return '£${cost.toStringAsFixed(1)}m';
}

String formatDate(String? isoDate) {
  if (isoDate == null) return 'TBD';
  try {
    final date = DateTime.parse(isoDate);
    return DateFormat('EEE d MMM, HH:mm').format(date);
  } catch (_) {
    return isoDate;
  }
}

String formatShortDate(String? isoDate) {
  if (isoDate == null) return 'TBD';
  try {
    final date = DateTime.parse(isoDate);
    return DateFormat('d MMM HH:mm').format(date);
  } catch (_) {
    return isoDate;
  }
}

String formatPercent(String? value) {
  if (value == null) return '0%';
  return '$value%';
}
