import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService, type UserProfile } from '../lib/auth';

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { full_name?: string; username?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  resendEmailVerification: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedAssessment: boolean;
  refreshProfile: () => Promise<void>;
  refreshAssessmentStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // Set a timeout to prevent infinite loading
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
            await checkAssessmentStatus(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
          await checkAssessmentStatus(session.user.id);
        } else {
          setProfile(null);
          setHasCompletedAssessment(false);
        }
        
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const userProfile = await authService.getUserProfile(userId);
      console.log('User profile loaded:', userProfile?.email || 'No profile');
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkAssessmentStatus = async (userId: string) => {
    try {
      console.log('Checking assessment status for user:', userId);
      
      const { data, error } = await supabase
        .from('skin_assessments')
        .select('id, skin_type, hydration_level, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Assessment check result:', { data, error });

      if (data && !error) {
        console.log('User has completed assessment:', data);
        setHasCompletedAssessment(true);
      } else {
        console.log('User has not completed assessment');
        setHasCompletedAssessment(false);
      }
    } catch (error) {
      console.error('Error checking assessment status:', error);
      setHasCompletedAssessment(false);
    }
  };

  const refreshAssessmentStatus = async () => {
    if (user) {
      console.log('Refreshing assessment status for user:', user.id);
      await checkAssessmentStatus(user.id);
    }
  };

  const signUp = async (email: string, password: string, userData?: { full_name?: string; username?: string }) => {
    try {
      setLoading(true);
      await authService.signUp(email, password, userData);
    } catch (error: any) {
      console.error('SignUp error in context:', error);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
    } catch (error: any) {
      console.error('SignIn error in context:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
      // Note: Don't set loading to false here as the redirect will handle the state
    } catch (error: any) {
      setLoading(false);
      console.error('Google sign in error in context:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      setLoading(true);
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      setHasCompletedAssessment(false);
      
      // Call the auth service to sign out
      await authService.signOut();
      
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('SignOut error in context:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      setProfile(null);
      setSession(null);
      setHasCompletedAssessment(false);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      console.error('Reset password error in context:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error: any) {
      console.error('Update password error in context:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProfile = await authService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
    } catch (error: any) {
      console.error('Update profile error in context:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const avatarUrl = await authService.uploadAvatar(user.id, file);
      await refreshProfile();
      return avatarUrl;
    } catch (error: any) {
      console.error('Upload avatar error in context:', error);
      throw new Error(error.message || 'Failed to upload avatar');
    }
  };

  const resendEmailVerification = async () => {
    try {
      await authService.resendEmailVerification();
    } catch (error: any) {
      console.error('Resend verification error in context:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        uploadAvatar,
        resendEmailVerification,
        isAuthenticated: !!user,
        hasCompletedAssessment,
        refreshProfile,
        refreshAssessmentStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};