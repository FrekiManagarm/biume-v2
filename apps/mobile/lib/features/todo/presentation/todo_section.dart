import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../../core/lifecycle/foreground_refresh.dart';
import '../domain/todo_item.dart';
import 'todo_cubit.dart';

/// « À traiter » : la première chose que l'ostéopathe lit en ouvrant
/// l'application. Un `BlocProvider<TodoCubit>` doit exister au-dessus.
class TodoSection extends StatelessWidget {
  const TodoSection({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return BlocBuilder<TodoCubit, TodoState>(
      builder: (context, state) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('À traiter', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            if (state.offlineMessage != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: palette.warningSurface,
                  border: Border.all(color: palette.warningBorder),
                  borderRadius: BorderRadius.circular(14),
                ),
                // Le message dit « ces données peuvent dater », jamais
                // « il n'y a rien » : la liste reste affichée.
                child: Text(
                  "${state.offlineMessage} Voici la dernière liste connue.",
                  style: TextStyle(color: palette.ink),
                ),
              ),
            if (state.items.isEmpty)
              Text(
                'Rien à traiter.',
                style: TextStyle(color: palette.inkMuted),
              )
            else
              ...state.items.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Card(
                    child: ListTile(
                      title: Text(item.patientName ?? 'Capture libre'),
                      subtitle: Text(item.label),
                      trailing: item.route == null
                          ? null
                          : const Icon(Icons.chevron_right),
                      onTap: item.kind == TodoKind.uploadBlocked
                          ? () => unawaited(refreshForeground())
                          : item.route == null
                          ? null
                          : () => context.push(item.route!),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
