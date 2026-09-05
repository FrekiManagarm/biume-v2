import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../config/app_palette.dart';
import '../../../core/format/relative_time.dart';
import '../../../core/lifecycle/foreground_refresh.dart';
import '../../../core/ui/biume_widgets.dart';
import '../domain/todo_item.dart';
import 'todo_cubit.dart';

/// « À traiter » : la première chose que l'ostéopathe lit en ouvrant
/// l'application, avant l'agenda. Un `BlocProvider<TodoCubit>` doit exister
/// au-dessus.
class TodoSection extends StatelessWidget {
  const TodoSection({this.onForegroundRefresh = refreshForeground, super.key});

  /// Ce que la reprise d'une dictée bloquée relance après l'avoir remise en
  /// file. Injectable pour que la section reste testable sans conteneur
  /// d'injection ; en production c'est le rafraîchissement de premier plan.
  final Future<void> Function() onForegroundRefresh;

  /// Le praticien décide de reprendre : la dictée retourne en file, puis la
  /// synchronisation repart. L'ordre compte — le moteur ne reprend que ce qui
  /// est en file.
  Future<void> _reprendre(BuildContext context, String captureId) async {
    final cubit = context.read<TodoCubit>();
    await cubit.retryUpload(captureId);
    await onForegroundRefresh();
  }

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return BlocBuilder<TodoCubit, TodoState>(
      builder: (context, state) => Padding(
        padding: EdgeInsets.symmetric(horizontal: AppShape.of(context).gutter),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'À traiter',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                // Le compteur dit combien, sans jamais dire quoi : le détail
                // est juste en dessous.
                if (state.items.isNotEmpty) _Counter(state.items.length),
              ],
            ),
            const SizedBox(height: 14),
            if (state.offlineMessage != null) ...[
              // Le message dit « ces données peuvent dater », jamais
              // « il n'y a rien » : la liste reste affichée.
              NoticeBanner(
                icon: Icons.wifi_off_outlined,
                message:
                    '${state.offlineMessage} Voici la dernière liste connue.',
              ),
              const SizedBox(height: 12),
            ],
            if (state.items.isEmpty)
              Text(
                'Rien à traiter.',
                style: Theme.of(context).textTheme.bodyMedium,
              )
            else
              for (final item in state.items)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppDesign.gapList),
                  child: _TodoCard(
                    item: item,
                    palette: palette,
                    onTap: item.kind == TodoKind.uploadBlocked
                        ? () => unawaited(_reprendre(context, item.captureId))
                        : item.route == null
                        ? null
                        : () => context.push(item.route!),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

class _Counter extends StatelessWidget {
  const _Counter(this.count);

  final int count;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 4),
      decoration: BoxDecoration(
        color: palette.primarySurface,
        border: Border.all(color: palette.primaryBorder),
        borderRadius: BorderRadius.circular(AppDesign.radiusPill),
      ),
      child: Text(
        '$count',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.w700,
          color: palette.primary,
        ),
      ),
    );
  }
}

class _TodoCard extends StatelessWidget {
  const _TodoCard({
    required this.item,
    required this.palette,
    required this.onTap,
  });

  final TodoItem item;
  final AppPalette palette;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final (foreground, background) = _tone(item.kind, palette);
    // Le genre en pastille, le détail en dessous : sans cette séparation, un
    // suivi qui dit « le propriétaire signale que son animal va moins bien »
    // remplacerait le seul mot qui range l'élément dans le travail du jour.
    final detail = item.detail;

    return SurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: StatusChip(
                  label: todoLabels[item.kind]!,
                  foreground: foreground,
                  background: background,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                timeAgo(item.updatedAt),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      item.patientName ?? 'Capture libre',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    if (detail != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        detail,
                        style: Theme.of(context).textTheme.bodyMedium
                            ?.copyWith(fontSize: 14),
                      ),
                    ],
                  ],
                ),
              ),
              // Le chevron ne s'affiche que sur ce qui s'ouvrira vraiment.
              if (item.route != null) ...[
                const SizedBox(width: 14),
                Icon(Icons.chevron_right, size: 22, color: palette.inkSubtle),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// Le ton dit au praticien ce qu'on attend de lui. Violet : un geste. Vert :
/// quelque chose est arrivé. Ambre : c'est dégradé, sans être cassé. Gris :
/// Biume travaille, il n'y a rien à faire.
(Color, Color) _tone(TodoKind kind, AppPalette palette) => switch (kind) {
  TodoKind.followUp => (palette.success, palette.successSurface),
  TodoKind.uploadBlocked ||
  TodoKind.inaudible ||
  TodoKind.transcriptionFailed => (palette.warning, palette.warningSurface),
  TodoKind.pendingUpload ||
  TodoKind.transcribing ||
  TodoKind.preparing => (palette.inkSubtle, palette.surfaceMuted),
  TodoKind.toAttach ||
  TodoKind.transcriptToReview ||
  TodoKind.reportToValidate ||
  TodoKind.readyToSend => (palette.primary, palette.primarySurface),
};
