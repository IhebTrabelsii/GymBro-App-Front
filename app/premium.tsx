import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSimpleTheme } from '../context/SimpleThemeContext';

const { width } = Dimensions.get('window');

// Types
type PlanType = 'monthly' | 'yearly' | 'lifetime';

type Plan = {
  id: PlanType;
  name: string;
  price: number;
  priceText: string;
  priceTND?: number;
  savings?: string;
  features: string[];
  popular?: boolean;
};

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  types: string[];
  isLocal: boolean;
};

type UpgradeResponse = {
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
};

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: 4.99,
    priceTND: 15,
    priceText: '$4.99/month',
    features: [
      'Unlimited AI coaching messages',
      'Personalized workout plans',
      'Detailed analytics & progress',
      'Priority support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: 39.99,
    priceTND: 120,
    priceText: '$39.99/year',
    savings: 'Save 33%',
    popular: true,
    features: [
      'Everything in Monthly Pro',
      '3 months FREE',
      'Early access to new features',
      'Exclusive workout videos',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    price: 89.99,
    priceTND: 270,
    priceText: '$89.99 one-time',
    features: [
      'Everything in Yearly Pro',
      'Lifetime updates',
      'Never pay again',
      'VIP community access',
    ],
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { theme } = useSimpleTheme();
  const currentColors = Colors[theme];
  const isDark = theme === 'dark';

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showD17Form, setShowD17Form] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'TND'>('USD');

  // D17 Form state
  const [d17Form, setD17Form] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const primaryColor = '#39FF14';

  // Payment methods with both international and local options
  const PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit / Debit Card',
      icon: 'card-outline',
      types: ['Visa', 'Mastercard', 'American Express'],
      isLocal: false,
    },
    {
      id: 'd17',
      name: 'D17 - Poste Tunisienne',
      icon: 'mail-outline',
      types: ['Carte E-Dinar', 'Compte Courant', 'Tunisia Only'],
      isLocal: true,
    },
  ];

  const handleSubscribe = () => {
    setShowPaymentModal(true);
    setShowD17Form(false);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setShowD17Form(methodId === 'd17');
    
    if (methodId === 'card') {
      setCurrency('USD');
      // On web, simulate card payment
      Alert.alert(
        'Payment Demo',
        'This is a demo payment. In production, you would be redirected to Stripe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Simulate Success', onPress: () => handleSuccessfulPayment() }
        ]
      );
    } else if (methodId === 'd17') {
      setCurrency('TND');
    }
  };

  const handleD17Payment = async () => {
    // Validate D17 form
    if (!d17Form.cardNumber || !d17Form.expiryDate || !d17Form.cvv) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    if (d17Form.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return;
    }

    setLoading(true);

    try {
      // Simulate D17 payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await handleSuccessfulPayment();
    } catch (error) {
      console.error('D17 payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulPayment = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Upgrade user plan in backend
      const response = await fetch('http://192.168.100.143:3000/api/users/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const data = (await response.json()) as UpgradeResponse;

      if (response.ok && data.success) {
        // Update stored user data
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          user.plan = selectedPlan;
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }

        Alert.alert(
          'Success! 🎉',
          'You are now a Pro member! Enjoy all the features.',
          [{ text: 'Start Exploring', onPress: () => router.push('/') }]
        );
        setShowPaymentModal(false);
        setShowD17Form(false);
      } else {
        Alert.alert('Error', data.error || 'Upgrade failed. Please contact support.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const formatD17CardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : text;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: primaryColor + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>
          Upgrade to Pro
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroSection}>
          <View style={[styles.crownIcon, { backgroundColor: primaryColor + '20' }]}>
            <MaterialCommunityIcons name="crown" size={32} color={primaryColor} />
          </View>
          <Text style={[styles.heroTitle, { color: isDark ? '#FFF' : '#000' }]}>
            Unlock Your Full Potential
          </Text>
          <Text style={[styles.heroSubtitle, { color: isDark ? '#888' : '#666' }]}>
            Get personalized AI coaching and premium features
          </Text>
        </Animated.View>

        {/* Currency Toggle */}
        <View style={styles.currencyToggle}>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              currency === 'USD' && { backgroundColor: primaryColor + '20', borderColor: primaryColor }
            ]}
            onPress={() => setCurrency('USD')}
          >
            <Text style={[styles.currencyText, currency === 'USD' && { color: primaryColor }]}>
              USD $
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              currency === 'TND' && { backgroundColor: primaryColor + '20', borderColor: primaryColor }
            ]}
            onPress={() => setCurrency('TND')}
          >
            <Text style={[styles.currencyText, currency === 'TND' && { color: primaryColor }]}>
              TND د.ت
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan, index) => (
            <Animated.View key={plan.id} entering={FadeInUp.delay(200 + index * 100)}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDark ? '#111' : '#FFF',
                    borderColor: selectedPlan === plan.id ? primaryColor : isDark ? '#333' : '#DDD',
                  },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.7}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: primaryColor }]}>
                    <Text style={styles.popularText}>🔥 MOST POPULAR</Text>
                  </View>
                )}

                {plan.savings && (
                  <View style={[styles.savingsBadge, { backgroundColor: '#FF6B6B' }]}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planNameContainer}>
                    <Text style={[styles.planName, { color: isDark ? '#FFF' : '#000' }]}>
                      {plan.name}
                    </Text>
                  </View>
                  <View style={styles.radioButton}>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: selectedPlan === plan.id ? primaryColor : '#888' },
                      ]}
                    >
                      {selectedPlan === plan.id && (
                        <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />
                      )}
                    </View>
                  </View>
                </View>

                <Text style={[styles.planPrice, { color: primaryColor }]}>
                  {currency === 'USD' 
                    ? plan.priceText 
                    : `${plan.priceTND} TND/${plan.id === 'lifetime' ? 'one-time' : plan.id === 'monthly' ? 'month' : 'year'}`}
                </Text>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={18} color={primaryColor} />
                      <Text style={[styles.featureText, { color: isDark ? '#CCC' : '#666' }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Features Summary */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? '#111' : '#FFF',
              borderColor: primaryColor + '20',
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: isDark ? '#FFF' : '#000' }]}>
            ✨ All Pro Plans Include
          </Text>
          <View style={styles.summaryGrid}>
            {[
              { icon: 'chatbubbles', text: 'AI Coach' },
              { icon: 'barbell', text: 'Custom Plans' },
              { icon: 'stats-chart', text: 'Analytics' },
              { icon: 'shield-checkmark', text: 'Secure' },
            ].map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Ionicons name={item.icon as any} size={24} color={primaryColor} />
                <Text style={[styles.summaryText, { color: isDark ? '#CCC' : '#666' }]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Guarantee */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.guaranteeSection}>
          <Ionicons name="shield" size={20} color={primaryColor} />
          <Text style={[styles.guaranteeText, { color: isDark ? '#888' : '#666' }]}>
            30-day money-back guarantee • Cancel anytime
          </Text>
        </Animated.View>

        {/* Subscribe Button */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: primaryColor }]}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => Alert.alert('Restore', 'Restoring purchases...')}
          >
            <Text style={[styles.restoreText, { color: isDark ? '#888' : '#666' }]}>
              Restore Purchase
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>
                Select Payment Method
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: isDark ? '#888' : '#666' }]}>
              {currency === 'USD' ? 'International payments' : 'Tunisian Dinar (TND)'}
            </Text>

            {!showD17Form ? (
              <View style={styles.paymentMethods}>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      {
                        backgroundColor: isDark ? '#222' : '#F5F5F5',
                        borderColor: selectedPaymentMethod === method.id ? primaryColor : 'transparent',
                      },
                    ]}
                    onPress={() => handlePaymentMethodSelect(method.id)}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Ionicons name={method.icon} size={24} color={primaryColor} />
                      <View>
                        <Text style={[styles.paymentName, { color: isDark ? '#FFF' : '#000' }]}>
                          {method.name}
                        </Text>
                        <Text style={[styles.paymentTypes, { color: isDark ? '#888' : '#666' }]}>
                          {method.types.join(' • ')}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.paymentRadio,
                        { borderColor: selectedPaymentMethod === method.id ? primaryColor : '#888' },
                      ]}
                    >
                      {selectedPaymentMethod === method.id && (
                        <View style={[styles.paymentRadioInner, { backgroundColor: primaryColor }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.d17Form}>
                <View style={styles.d17Header}>
                  <MaterialCommunityIcons name="mailbox" size={32} color={primaryColor} />
                  <Text style={[styles.d17Title, { color: isDark ? '#FFF' : '#000' }]}>
                    Paiement par D17
                  </Text>
                  <Text style={[styles.d17Subtitle, { color: isDark ? '#888' : '#666' }]}>
                    Entrez les détails de votre carte E-Dinar
                  </Text>
                </View>

                <View style={styles.d17InputGroup}>
                  <Text style={[styles.d17Label, { color: isDark ? '#FFF' : '#000' }]}>
                    Numéro de carte
                  </Text>
                  <TextInput
                    style={[styles.d17Input, { 
                      backgroundColor: isDark ? '#222' : '#F5F5F5',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: primaryColor + '40'
                    }]}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={d17Form.cardNumber}
                    onChangeText={(text) => setD17Form({ ...d17Form, cardNumber: formatD17CardNumber(text) })}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.d17Row}>
                  <View style={[styles.d17InputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.d17Label, { color: isDark ? '#FFF' : '#000' }]}>
                      Date d'expiration
                    </Text>
                    <TextInput
                      style={[styles.d17Input, { 
                        backgroundColor: isDark ? '#222' : '#F5F5F5',
                        color: isDark ? '#FFF' : '#000',
                        borderColor: primaryColor + '40'
                      }]}
                      placeholder="MM/AA"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      value={d17Form.expiryDate}
                      onChangeText={(text) => setD17Form({ ...d17Form, expiryDate: formatExpiryDate(text) })}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>

                  <View style={[styles.d17InputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.d17Label, { color: isDark ? '#FFF' : '#000' }]}>
                      CVV
                    </Text>
                    <TextInput
                      style={[styles.d17Input, { 
                        backgroundColor: isDark ? '#222' : '#F5F5F5',
                        color: isDark ? '#FFF' : '#000',
                        borderColor: primaryColor + '40'
                      }]}
                      placeholder="123"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      value={d17Form.cvv}
                      onChangeText={(text) => setD17Form({ ...d17Form, cvv: text.replace(/\D/g, '').substring(0, 3) })}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.d17Note}>
                  <Ionicons name="information-circle" size={16} color={primaryColor} />
                  <Text style={[styles.d17NoteText, { color: isDark ? '#888' : '#666' }]}>
                    Les paiements sont sécurisés par la Poste Tunisienne
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.payButton, { 
                backgroundColor: primaryColor,
                opacity: !selectedPaymentMethod ? 0.5 : 1 
              }]}
              onPress={selectedPaymentMethod === 'd17' ? handleD17Payment : handleSuccessfulPayment}
              disabled={loading || !selectedPaymentMethod || (selectedPaymentMethod === 'd17' && (!d17Form.cardNumber || !d17Form.expiryDate || !d17Form.cvv))}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.payButtonText}>
                    {selectedPaymentMethod === 'd17' ? 'Payer avec D17' : 'Pay Now'}
                  </Text>
                  <Ionicons name="lock-closed" size={18} color="#000" />
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.secureText, { color: isDark ? '#888' : '#666' }]}>
              {selectedPaymentMethod === 'd17' 
                ? '🔒 Paiement sécurisé par la Poste Tunisienne'
                : '🔒 Demo payment (Stripe would be integrated)'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  crownIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  currencyToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  currencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planNameContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
  },
  radioButton: {
    padding: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  summaryText: {
    fontSize: 12,
    marginTop: 8,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  guaranteeText: {
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  subscribeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  paymentMethods: {
    gap: 12,
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentTypes: {
    fontSize: 12,
    marginTop: 2,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  payButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  d17Form: {
    marginBottom: 24,
  },
  d17Header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  d17Title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  d17Subtitle: {
    fontSize: 14,
  },
  d17InputGroup: {
    marginBottom: 16,
  },
  d17Label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  d17Input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  d17Row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  d17Note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  d17NoteText: {
    fontSize: 12,
  },
});