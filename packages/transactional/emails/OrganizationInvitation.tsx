import { Text } from "@react-email/components";

import { EmailAction, EmailFallbackUrl, EmailSupportNote, EmailTitle, bodyText } from "./EmailComponents";
import { EmailLayout } from "./EmailLayout";

interface OrganizationInvitationProps { inviterName?: string; organizationName?: string; inviteLink?: string; }

const OrganizationInvitation = ({ inviterName = "Un membre de l’équipe", organizationName = "Biume", inviteLink = "https://biume.com/invite" }: OrganizationInvitationProps) => <EmailLayout tone="security" preview={`Rejoignez ${organizationName} sur Biume`}><EmailTitle eyebrow="Invitation">Vous êtes invité(e) à rejoindre {organizationName}.</EmailTitle><Text style={bodyText}>Bonjour,</Text><Text style={bodyText}>{inviterName} vous invite à rejoindre son espace {organizationName} sur Biume afin de collaborer sur le suivi de son activité.</Text><EmailAction href={inviteLink} tone="ink">Rejoindre {organizationName}</EmailAction><EmailFallbackUrl href={inviteLink} /><EmailSupportNote>Vous ne reconnaissez pas cette invitation ? Vous pouvez ignorer cet email.</EmailSupportNote></EmailLayout>;

export default OrganizationInvitation;
