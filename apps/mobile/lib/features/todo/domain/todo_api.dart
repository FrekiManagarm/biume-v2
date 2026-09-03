import '../../../core/result.dart';
import 'todo_item.dart';

/// Ce qui attend un geste, vu du serveur. Derrière cette interface pour que
/// le cubit ne connaisse jamais dio.
abstract class TodoApi {
  Future<Result<List<TodoItem>>> list();
}
