import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import {
  Badge,
  Button,
  Field,
  Notice,
  Screen,
  ScreenHeader,
  spacing,
} from '@/design';

export type SignInScreenProps = {
  onSignIn(input: { email: string; password: string }): void | Promise<void>;
  error?: string | null;
  pending?: boolean;
  online?: boolean;
};

export function SignInScreen({
  onSignIn,
  error = null,
  pending = false,
  online = true,
}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const disabled = pending || !online;

  function submit() {
    onSignIn({ email, password });
  }

  return (
    <Screen centered scroll>
      <ScreenHeader
        align="center"
        badge={<Badge icon="secure" label="Session sécurisée" tone="done" />}
        subtitle="Vos dictées restent chiffrées sur ce téléphone tant qu’elles ne sont pas envoyées."
        title="Connectez-vous."
      />

      <View style={styles.form}>
        <Field
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          inputMode="email"
          keyboardType="email-address"
          label="Adresse e-mail"
          onChangeText={setEmail}
          onSubmitEditing={() => passwordRef.current?.focus()}
          returnKeyType="next"
          submitBehavior="submit"
          textContentType="username"
          value={email}
        />

        <Field
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          label="Mot de passe"
          onChangeText={setPassword}
          onSubmitEditing={disabled ? undefined : submit}
          ref={passwordRef}
          returnKeyType="go"
          secureTextEntry
          textContentType="password"
          value={password}
        />

        {error ? <Notice alert message={error} tone="problem" /> : null}

        {online ? null : (
          <Notice
            message="Reconnectez-vous à Internet pour vous connecter."
            tone="offline"
          />
        )}

        <Button
          accessibilityHint="Ouvre votre agenda et vos dictées"
          disabled={disabled}
          icon="signIn"
          label="Se connecter"
          loading={pending}
          onPress={submit}
          size="lg"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
