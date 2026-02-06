import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../network/dio_client.dart';

part 'dio_provider.g.dart';

@Riverpod(keepAlive: true)
DioClient dioClient(Ref ref) {
  return DioClient.create();
}
