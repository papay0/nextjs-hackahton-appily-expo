import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';

import { AnimatedInput } from '../ui/AnimatedInput';
import { StyledButton } from '../ui/StyledButton';
import { useAuth } from '../../app/_layout';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    // Simple email validation
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      signIn(); // Call the authentication context's signIn method
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <AnimatedInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
        />
        
        <AnimatedInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        
        <StyledButton
          title="Log In"
          onPress={handleLogin}
          size="large"
          isLoading={isLoading}
          style={styles.loginButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  loginButton: {
    marginTop: 16,
  },
}); 