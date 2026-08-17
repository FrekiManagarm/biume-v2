import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const disabled = pending || !online;

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Biume
      </Text>

      <TextInput
        accessibilityLabel="Adresse e-mail"
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        onChangeText={setEmail}
        style={styles.input}
        value={email}
      />

      <TextInput
        accessibilityLabel="Mot de passe"
        autoCapitalize="none"
        autoComplete="current-password"
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {online ? null : (
        <Text style={styles.notice}>
          Reconnectez-vous à Internet pour vous connecter.
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => onSignIn({ email, password })}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Se connecter</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '600', textAlign: 'center' },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  error: { fontWeight: '500' },
  notice: { opacity: 0.8 },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    padding: 12,
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
});
