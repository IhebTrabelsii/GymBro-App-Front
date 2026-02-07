import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Clock from '@/components/clock';

const BACKEND_URL = 'http://localhost:3000/api/admin/dashboard';
 // <-- your backend URL here

export default function AdminDashboard() {
  const router = useRouter();
const [stats, setStats] = useState({ users: 0, plans: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    // TODO: Add logout logic here (e.g., clear token)
    router.push('/admin/login');
  };

  // Fetch stats on component mount
useEffect(() => {
  fetch('http://localhost:3000/api/admin/dashboard')
    .then(res => res.json())
    .then(data => {
      setStats(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load stats:', err);
      setLoading(false);
    });
}, []);


  if (loading) {
    return (
      <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
        <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 50 }} />
      </LinearGradient>
    );
  }

  if (!stats) {
    return (
      <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
        <Text style={{ color: 'white', marginTop: 50, textAlign: 'center' }}>
          Failed to load stats.
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0E0E0E', '#1A1A1A', '#0E0E0E']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>GymBro Admin</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#D0FF00" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
      </View>
      <View style={styles.header}>
  <Text style={styles.logo}>Admin</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Clock style={{ marginRight: 12 }} />
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
</View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.card, { borderColor: '#39FF14' }]}>
          <Text style={styles.cardTitle}>Users</Text>
          <Text style={styles.cardValue}>{stats.users}</Text>
        </View>
        <View style={[styles.card, { borderColor: '#00F0FF' }]}>
          <Text style={styles.cardTitle}>Plans</Text>
          <Text style={styles.cardValue}>{stats.plans}</Text>
        </View>
        <View style={[styles.card, { borderColor: '#FF10F0' }]}>
          <Text style={styles.cardTitle}>Admins</Text>
          <Text style={styles.cardValue}>{stats.admins}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    color: '#39FF14',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#D0FF00',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#D0FF00',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
/*
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TodoProvider, useTodos } from '../../context/TodoContext';
import { CategoryProvider } from '../../context/CategoryContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutList, Clock, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import AddTodoForm from './AddTodoForm';
import DraggableTodoList from './DraggableTodoList';
import { StatsCardSkeleton } from '../UI/Skeleton';
import AnimatedPage from '../UI/AnimatedPage';
import CategoryManager from './CategoryManager';
import NotificationSettings from '../UI/NotificationSettings';
import Button from '../UI/Button';
import { motion } from 'framer-motion';
import { startNotificationScheduler } from '../../utils/notificationService';

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { stats, loading: statsLoading, todos:  allTodos } = useTodos();
  const navigate = useNavigate();
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    const cleanup = startNotificationScheduler(() => allTodos);
    return cleanup;
  }, [allTodos]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AnimatedPage>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
     
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
       
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.025em',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome back, {user?.full_name?.split(' ')[0] || user?.username}! 👋
              </h1>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
                }} />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NotificationSettings />
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryManager(true)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-accent) 0%, var(--bg-accent-dark, var(--color-accent)) 100%)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <FolderOpen size={18} />
                <span className="desktop-only">Manage Categories</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--color-error)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <LogOut size={18} />
                <span className="desktop-only">Sign Out</span>
              </motion.button>
            </motion.div>
          </motion.div>

      
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}
          >
            {statsLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <EnhancedStatsCard
                  title="Total Tasks"
                  value={stats.total || 0}
                  icon={LayoutList}
                  delay={0}
                />
                <EnhancedStatsCard
                  title="In Progress"
                  value={stats.active || 0}
                  icon={Clock}
                  delay={0.1}
                />
                <EnhancedStatsCard
                  title="Completed"
                  value={stats.completed || 0}
                  icon={CheckCircle2}
                  delay={0.2}
                />
                <EnhancedStatsCard
                  title="Overdue"
                  value={stats.overdue || 0}
                  icon={AlertCircle}
                  delay={0.3}
                />
              </>
            )}
          </motion.div>

     
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
            style={{ marginBottom: '2rem' }}
          >
            <AddTodoForm />
          </motion.div>

      
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
          >
            <DraggableTodoList />
          </motion.div>
        </div>
      </div>

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </AnimatedPage>
  );
};

// Enhanced Stats Card with modern design
const EnhancedStatsCard = ({ title, value, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-secondary)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)';
      }}
    >

      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '150%',
        height: '150%',
        background: 'radial-gradient(circle, var(--bg-tertiary) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {title}
          </span>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-secondary)'
            }}
          >
            <Icon size={20} color="var(--text-secondary)" strokeWidth={2.5} />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 400, damping: 15 }}
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1',
            letterSpacing: '-0.02em'
          }}
        >
          {value}
        </motion.div>
        
   
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeOut" }}
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, var(--text-muted) 0%, var(--border-secondary) 100%)',
            borderRadius: '2px',
            marginTop: '1rem'
          }}
        />
      </div>
    </motion.div>
  );
};

// Minimal Stats Card (keeping for backward compatibility)
const MinimalStatsCard = ({ title, value, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)';
        e.currentTarget.style.borderColor = 'var(--border-secondary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)';
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </span>
        <Icon size={18} color="var(--text-muted)" strokeWidth={2} />
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        lineHeight: '1'
      }}>
        {value}
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  return (
    <CategoryProvider>
      <TodoProvider>
        <DashboardContent />
      </TodoProvider>
    </CategoryProvider>
  );
};

export default Dashboard;*/
