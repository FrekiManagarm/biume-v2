"use client";

import { Button, Chip, Modal, Tabs } from "@heroui/react";

const stages = [
  {
    id: "preparation",
    label: "Préparation",
    title: "Une version claire attend votre relecture.",
    body: "Luma a retrouvé plus de liberté dans ses mouvements.",
  },
  {
    id: "consultation",
    label: "Consultation",
    title: "Votre observation, sans détour.",
    body: "Mobilité plus libre à droite. Marche douce aujourd’hui.",
  },
  {
    id: "report",
    label: "Compte rendu",
    title: "La décision vous appartient.",
    body: "Rien ne part sans votre accord explicite.",
  },
] as const;

export function V4SessionConsole() {
  return (
    <aside aria-label="Aperçu de séance" className="v4-console">
      <div className="v4-console-header">
        <div>
          <p className="v4-console-kicker">Séance de Luma</p>
          <p className="v4-console-date">Aujourd’hui · 14:30</p>
        </div>
        <Chip className="v4-console-chip">Préparation en cours</Chip>
      </div>

      <Tabs className="v4-console-tabs" defaultSelectedKey="preparation">
        <Tabs.ListContainer className="v4-console-tabs-list-container">
          <Tabs.List aria-label="Étapes d’une séance" className="v4-console-tabs-list">
            {stages.map((stage) => (
              <Tabs.Tab className="v4-console-tab" id={stage.id} key={stage.id}>
                <Tabs.Indicator className="v4-console-tab-indicator" />
                {stage.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {stages.map((stage) => (
          <Tabs.Panel className="v4-console-panel" id={stage.id} key={stage.id}>
            <p className="v4-console-panel-label">{stage.label}</p>
            <h2>{stage.title}</h2>
            <p>{stage.body}</p>
          </Tabs.Panel>
        ))}
      </Tabs>

      <Modal>
        <Modal.Trigger className="v4-console-preview-trigger">
          Prévisualiser le compte rendu
        </Modal.Trigger>
        <Modal.Backdrop className="v4-console-modal-backdrop" variant="blur">
          <Modal.Container className="v4-console-modal-container" size="md">
            <Modal.Dialog className="v4-console-modal-dialog">
              <Modal.CloseTrigger className="v4-console-modal-close" />
              <Modal.Header className="v4-console-modal-header">
                <Modal.Heading className="v4-console-modal-heading">
                  Compte rendu propriétaire — Luma
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="v4-console-modal-body">
                <p>Luma a retrouvé plus de liberté dans ses mouvements.</p>
                <p>
                  Vous pourrez relire et adapter cette version avant tout
                  partage.
                </p>
              </Modal.Body>
              <Modal.Footer className="v4-console-modal-footer">
                <Button className="v4-console-modal-button" slot="close">
                  Fermer l’aperçu
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </aside>
  );
}
