import { supabase } from '../config/supabase';
import { User, RegisterRequest, LoginRequest } from '../models/types';
import * as bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../utils/response';
import { Context } from 'elysia';

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export async function register(context: Context) {
  const { set } = context;
  // Explicit cast to avoid "unknown" errors
  const body = context.body as RegisterRequest;
  const { email, password, username, full_name } = body;

  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, username')
      .or(`email.eq.${email},username.eq.${username}`);

    if (checkError) {
      console.error('Check user error:', checkError);
      set.status = 500;
      return errorResponse('Failed to check user existence', 'INTERNAL_ERROR');
    }

    if (existingUsers && existingUsers.length > 0) {
      const isEmailTaken = existingUsers.some((u) => u.email === email);
      const isUsernameTaken = existingUsers.some((u) => u.username === username);

      set.status = 400;
      if (isEmailTaken) {
        return errorResponse('Email already registered', 'EMAIL_EXISTS');
      }
      if (isUsernameTaken) {
        return errorResponse('Username already taken', 'USERNAME_EXISTS');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        username,
        full_name,
        role: 'user',
        current_level: 'N5',
        streak_days: 0,
        total_xp: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      set.status = 500;
      return errorResponse('Failed to create user', 'CREATE_ERROR');
    }

    set.status = 201;
    return successResponse(newUser as User, 'Registration successful');
  } catch (error) {
    console.error('Register error:', error);
    set.status = 500;
    return errorResponse('Internal server error', 'INTERNAL_ERROR');
  }
}

/**
 * Login user
 */
export async function login(context: Context) {
  const { set } = context;
  const body = context.body as LoginRequest;
  
  // Elysia injects jwt plugin into the store or helper, 
  // but here we might receive it directly if passed explicitly or attached to context.
  // In our route we pass the whole context which includes jwt decorators if configured perfectly.
  // However, safely we can assume 'jwt' is in context if using the plugin.
  // Let's cast context to any to access jwt cleanly or strict type it.
  const ctx = context as any;
  const jwt = ctx.jwt;

  // Fallback check
  if (!jwt) {
      set.status = 500;
      return errorResponse('JWT plugin not initialized', 'INTERNAL_ERROR');
  }

  const { email, password } = body;

  try {
    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      set.status = 401;
      return errorResponse('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      set.status = 401;
      return errorResponse('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate token
    const token = await jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword as User,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    set.status = 500;
    return errorResponse('Internal server error', 'INTERNAL_ERROR');
  }
}

/**
 * Get current user profile
 */
export async function getProfile(context: any) {
  const { user, set } = context;

  if (!user) {
      set.status = 401;
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
  }

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      set.status = 404;
      return errorResponse('User not found', 'NOT_FOUND');
    }

    const { password_hash, ...userWithoutPassword } = userData;

    return successResponse(userWithoutPassword as User);
  } catch (error) {
    console.error('Get profile error:', error);
    set.status = 500;
    return errorResponse('Internal server error', 'INTERNAL_ERROR');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(context: any) {
  const { user, body, set } = context;
  
   if (!user) {
      set.status = 401;
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
  }

  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      set.status = 500;
      return errorResponse('Failed to update profile', 'UPDATE_ERROR');
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    return successResponse(userWithoutPassword as User, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    set.status = 500;
    return errorResponse('Internal server error', 'INTERNAL_ERROR');
  }
}

/**
 * Change password
 */
export async function changePassword(context: any) {
  const { user, body, set } = context;

   if (!user) {
      set.status = 401;
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
  }

  const { current_password, new_password } = body as any;

  try {
    // Get user to check current password
    const { data: userData, error: findError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (findError || !userData) {
      set.status = 404;
      return errorResponse('User not found', 'NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, userData.password_hash);

    if (!isPasswordValid) {
      set.status = 400;
      return errorResponse('Invalid current password', 'INVALID_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id);

    if (updateError) {
      console.error('Change password error:', updateError);
      set.status = 500;
      return errorResponse('Failed to change password', 'UPDATE_ERROR');
    }

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    set.status = 500;
    return errorResponse('Internal server error', 'INTERNAL_ERROR');
  }
}
