import { supabase } from '../config/supabase';
import { hash, compare } from 'bcrypt';
import { successResponse, errorResponse } from '../utils/response';
import type { LoginRequest, RegisterRequest, User } from '../models/types';

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export async function register(data: RegisterRequest, jwt: any) {
  const { email, password, username, full_name } = data;

  // Check if email already exists
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingEmail) {
    return { error: errorResponse('Email already registered', 'EMAIL_EXISTS'), status: 400 };
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUsername) {
    return { error: errorResponse('Username already taken', 'USERNAME_EXISTS'), status: 400 };
  }

  // Hash password
  const hashedPassword = await hash(password, SALT_ROUNDS);

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: hashedPassword,
      username,
      full_name,
      role: 'user',
      current_level: 'N5',
      streak_days: 0,
      total_xp: 0,
    })
    .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp, created_at')
    .single();

  if (error) {
    console.error('Register error:', error);
    return { error: errorResponse('Failed to create user', 'CREATE_FAILED'), status: 500 };
  }

  // Generate JWT token
  const token = await jwt.sign({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    data: successResponse(
      {
        user,
        token,
        expires_at: expiresAt.toISOString(),
      },
      'Registration successful'
    ),
    status: 201,
  };
}

/**
 * Login user
 */
export async function login(data: LoginRequest, jwt: any) {
  const { email, password } = data;

  // Get user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { error: errorResponse('Invalid email or password', 'INVALID_CREDENTIALS'), status: 401 };
  }

  // Verify password
  const isValidPassword = await compare(password, user.password_hash);

  if (!isValidPassword) {
    return { error: errorResponse('Invalid email or password', 'INVALID_CREDENTIALS'), status: 401 };
  }

  // Update last activity
  await supabase
    .from('users')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', user.id);

  // Generate JWT token
  const token = await jwt.sign({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Remove password from response
  const { password_hash, ...safeUser } = user;

  return {
    data: successResponse(
      {
        user: safeUser,
        token,
        expires_at: expiresAt.toISOString(),
      },
      'Login successful'
    ),
    status: 200,
  };
}

/**
 * Get current user
 */
export async function getCurrentUser(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp, last_activity_at, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { error: errorResponse('User not found', 'USER_NOT_FOUND'), status: 404 };
  }

  return { data: successResponse(user), status: 200 };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'username' | 'full_name' | 'avatar_url' | 'current_level'>>
) {
  // Check if username is being changed and is available
  if (updates.username) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', updates.username)
      .neq('id', userId)
      .single();

    if (existing) {
      return { error: errorResponse('Username already taken', 'USERNAME_EXISTS'), status: 400 };
    }
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, email, username, full_name, avatar_url, role, current_level, streak_days, total_xp')
    .single();

  if (error) {
    return { error: errorResponse('Failed to update profile', 'UPDATE_FAILED'), status: 500 };
  }

  return { data: successResponse(user, 'Profile updated'), status: 200 };
}

/**
 * Change password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Get current password hash
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    return { error: errorResponse('User not found', 'USER_NOT_FOUND'), status: 404 };
  }

  // Verify current password
  const isValid = await compare(currentPassword, user.password_hash);

  if (!isValid) {
    return { error: errorResponse('Current password is incorrect', 'INVALID_PASSWORD'), status: 400 };
  }

  // Hash new password
  const newHash = await hash(newPassword, SALT_ROUNDS);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    return { error: errorResponse('Failed to update password', 'UPDATE_FAILED'), status: 500 };
  }

  return { data: successResponse(null, 'Password changed successfully'), status: 200 };
}
