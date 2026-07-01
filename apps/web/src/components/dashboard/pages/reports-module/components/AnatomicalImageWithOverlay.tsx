import React from "react";
import type { AnatomicalIssue } from "../types";

interface AnatomicalImageWithOverlayProps {
  anatomicalView: "gauche" | "droite";
  filteredDysfunctions: AnatomicalIssue[];
  renderAnatomicalSVG: (
    dysfunctions: AnatomicalIssue[],
    side: "left" | "right",
  ) => React.ReactNode;
  animalData?: {
    name?: string | null;
    code?: string | null;
  } | null;
  isTestMode?: boolean;
  selectedAnimalType?: string;
}

export function AnatomicalImageWithOverlay({
  anatomicalView,
  filteredDysfunctions,
  renderAnatomicalSVG,
  animalData,
  isTestMode = false,
  selectedAnimalType = "dog",
}: AnatomicalImageWithOverlayProps) {
  // Fonction pour déterminer l'image à utiliser en fonction du type d'animal
  const getAnimalImage = (side: "left" | "right") => {
    // En mode test, utiliser le type d'animal sélectionné, sinon utiliser les données de l'animal
    const animalType = isTestMode
      ? selectedAnimalType
      : animalData?.code?.toLowerCase() || "dog";

    switch (animalType) {
      case "cat":
        return side === "left"
          ? "/assets/images/cat-left-side.jpg"
          : "/assets/images/cat-right-side.jpg";
      case "horse":
        return side === "left"
          ? "/assets/images/horse-left-side.png"
          : "/assets/images/horse-right-side.png";
      case "other":
      case "bird":
      case "cow":
      case "nac":
      case "dog":
      default:
        // Fallback vers chien pour tous les autres types
        return side === "left"
          ? "/assets/images/dog-left-side.jpg"
          : "/assets/images/dog-right-side.jpg";
    }
  };

  const leftImageSrc = getAnimalImage("left");
  const rightImageSrc = getAnimalImage("right");

  return (
    <div className="max-w-5xl mx-auto relative">
      {anatomicalView === "gauche" ? (
        <>
          <img
            src={leftImageSrc}
            alt={`Vue anatomique côté gauche - ${animalData?.name || "Animal"}`}
            width={1200}
            height={900}
            className="object-contain w-full h-auto drop-shadow-lg"
          />
          {renderAnatomicalSVG(filteredDysfunctions, "left")}
        </>
      ) : (
        <>
          <img
            src={rightImageSrc}
            alt={`Vue anatomique côté droit - ${animalData?.name || "Animal"}`}
            width={1200}
            height={900}
            className="object-contain w-full h-auto drop-shadow-lg"
          />
          {renderAnatomicalSVG(filteredDysfunctions, "right")}
        </>
      )}
    </div>
  );
}
