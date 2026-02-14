import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

// Web version - uses Stripe.js instead of native module
export const StripePaymentWeb = ({ 
  amount, 
  onSuccess,
  onError 
}: { 
  amount: number; 
  onSuccess: () => void;
  onError: (error: string) => void;
}) => {
  
  const handlePayment = () => {
    // For web, you would integrate Stripe.js here
    // For now, simulate payment
    Alert.alert(
      'Web Payment',
      'On web, you would be redirected to Stripe checkout.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Success', 
          onPress: () => {
            Alert.alert('Success!', 'Payment completed (simulated)');
            onSuccess();
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#39FF14',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center'
        }}
        onPress={handlePayment}
      >
        <Text style={{ color: '#000', fontWeight: 'bold' }}>
          Pay ${amount} (Web Demo)
        </Text>
      </TouchableOpacity>
    </View>
  );
};