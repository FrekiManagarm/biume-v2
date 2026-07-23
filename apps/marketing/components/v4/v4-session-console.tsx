"use client";

import { Button, Card, Chip, Modal, Tabs } from "@heroui/react";

const stages = [
  {
    id: "notes",
    label: "Notes",
    title: "Votre observation reste intacte.",
    body: "Restriction thoracique gauche. Mobilité améliorée après travail manuel.",
  },
  {
    id: "relecture",
    label: "Relecture",
    title: "La version propriétaire attend votre accord.",
    body: "La mobilité du thorax a été travaillée pendant la séance.",
  },
  {
    id: "suivi",
    label: "Suivi",
    title: "Le rappel est prêt, pas automatique.",
    body: "Conseiller une activité calme pendant 48 heures, puis proposer un point de suivi.",
  },
] as const;

export function V4SessionConsole() {
  return (
    <Card.Root
      aria-label="Aperçu de séance"
      className="v4-console"
      render={(props) => <aside {...props} />}
      variant="default"
    >
      <Card.Header className="v4-console-header">
        <div>
          <Card.Title className="v4-console-kicker">Séance de Luma</Card.Title>
          <Card.Description className="v4-console-date">
            Aujourd'hui · 14:30
          </Card.Description>
        </div>
        <Chip className="v4-console-chip">À valider</Chip>
      </Card.Header>

      <Card.Content className="v4-console-content">
        <Tabs className="v4-console-tabs" defaultSelectedKey="notes">
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
              <div className="v4-console-fields" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </Tabs.Panel>
          ))}
        </Tabs>

        <div className="v4-console-status">
          <span>Document lisible</span>
          <span>Envoi manuel</span>
        </div>
      </Card.Content>

      <Card.Footer className="v4-console-footer">
        <Modal>
          <Modal.Trigger className="v4-console-preview-trigger">
            Prévisualiser le compte rendu
          </Modal.Trigger>
          <Modal.Backdrop className="v4-console-modal-backdrop" variant="blur">
            <Modal.Container className="v4-console-modal-container" size="md">
              <Modal.Dialog className="v4-console-modal-dialog">
                <Modal.CloseTrigger
                  aria-label="Fermer l’aperçu"
                  className="v4-console-modal-close"
                />
                <Modal.Header className="v4-console-modal-header">
                  <Modal.Heading className="v4-console-modal-heading">
                    Compte rendu propriétaire — Luma
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="v4-console-modal-body">
                  <p>La mobilité du thorax a été travaillée pendant la séance.</p>
                  <p>
                    Une activité calme est recommandée pendant les prochaines
                    48 heures. Vous pouvez relire et adapter cette version avant
                    tout partage.
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
      </Card.Footer>
    </Card.Root>
  );
}
