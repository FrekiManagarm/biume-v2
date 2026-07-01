
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
} from "lucide-react";

interface Recommendation {
  id: string;
  content: string;
}

interface RecommendationsTabProps {
  recommendations: Recommendation[];
  setRecommendations: (recommendations: Recommendation[]) => void;
}

export function RecommendationsTab({
  recommendations,
  setRecommendations,
}: RecommendationsTabProps) {
  const [newRecommendation, setNewRecommendation] = useState("");
  const [isAddingFocused, setIsAddingFocused] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleAddRecommendation = () => {
    if (!newRecommendation.trim()) return;

    const recommendation: Recommendation = {
      id: crypto.randomUUID(),
      content: newRecommendation.trim(),
    };

    setRecommendations([...recommendations, recommendation]);
    setNewRecommendation("");
  };

  const handleRemoveRecommendation = (id: string) => {
    setRecommendations(recommendations.filter((rec) => rec.id !== id));
  };

  const handleStartEdit = (id: string) => {
    const target = recommendations.find((r) => r.id === id);
    if (!target) return;
    setEditingId(id);
    setEditingContent(target.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const value = editingContent.trim();
    if (!value) return;
    setRecommendations(
      recommendations.map((r) =>
        r.id === editingId ? { ...r, content: value } : r,
      ),
    );
    setEditingId(null);
    setEditingContent("");
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    const index = recommendations.findIndex((r) => r.id === id);
    if (index === -1) return;
    const isUp = direction === "up";
    const newIndex = isUp ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= recommendations.length) return;
    const next = [...recommendations];
    const [item] = next.splice(index, 1);
    next.splice(newIndex, 0, item);
    setRecommendations(next);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4" />
          <span>
            {recommendations.length} recommandation
            {recommendations.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Astuce: Cmd/Ctrl+Entrée pour ajouter
        </div>
      </div>

      {/* Add area */}
      <div className="mb-4 rounded-md border bg-muted/20">
        <div className="p-2">
          <Textarea
            aria-label="Nouvelle recommandation"
            value={newRecommendation}
            onChange={(e) => setNewRecommendation(e.target.value)}
            onFocus={() => setIsAddingFocused(true)}
            onBlur={() => setIsAddingFocused(false)}
            placeholder="Rédigez un conseil concret, actionnable et clair..."
            className="min-h-20"
            onKeyDown={(e) => {
              const isSubmit =
                (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ||
                (e.key === "Enter" && !e.shiftKey && !isAddingFocused);
              if (isSubmit) {
                e.preventDefault();
                handleAddRecommendation();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between p-2 pt-0">
          <div className="text-[11px] text-muted-foreground">
            Utilisez Maj+Entrée pour un saut de ligne
          </div>
          <Button
            onClick={handleAddRecommendation}
            disabled={!newRecommendation.trim()}
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {recommendations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed rounded-md bg-muted/10">
            <div className="max-w-md mx-auto px-6">
              <p className="text-sm">
                Aucun conseil pour l’instant. Proposez des actions concrètes
                (ex: fréquence des exercices, recommandations d’environnement,
                suivi entre séances).
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => {
              const isEditing = editingId === recommendation.id;
              return (
                <li
                  key={recommendation.id}
                  className="group flex items-start gap-2 p-3 bg-muted/30 rounded-md border border-muted/50"
                >
                  <span className="font-medium min-w-[24px] pt-0.5 select-none">
                    {index + 1}.
                  </span>

                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          aria-label={`Modifier la recommandation ${index + 1}`}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editingContent.trim()}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-6 whitespace-pre-wrap">
                        {recommendation.content}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Monter"
                        onClick={() => handleReorder(recommendation.id, "up")}
                        disabled={index === 0}
                        className="h-7 w-7"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Descendre"
                        onClick={() => handleReorder(recommendation.id, "down")}
                        disabled={index === recommendations.length - 1}
                        className="h-7 w-7"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Modifier"
                        onClick={() => handleStartEdit(recommendation.id)}
                        className="h-7 w-7"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer"
                        onClick={() =>
                          handleRemoveRecommendation(recommendation.id)
                        }
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
