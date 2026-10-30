import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

describe('K12 Hunar Frontend Core Logic & Contracts Test Suite', () => {
  const USER_TYPES = ['Parent', 'Student', 'School'];
  const CATEGORIES = ['Scholarship', 'Concert', 'Admission', 'General Query'];

  const clientInquirySchema = z.object({
    user_type: z.enum(USER_TYPES, {
      errorMap: () => ({ message: 'Please select whether you are a Parent, Student, or School' }),
    }),
    category: z.enum(CATEGORIES, {
      errorMap: () => ({ message: 'Please select an inquiry category' }),
    }),
    name: z
      .string()
      .trim()
      .min(2, 'Please enter your full name (at least 2 characters)')
      .max(150, 'Name cannot exceed 150 characters'),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .max(255, 'Email cannot exceed 255 characters'),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number (7–20 digits)'),
    message: z
      .string()
      .trim()
      .min(10, 'Please enter at least 10 characters describing your query')
      .max(3000, 'Message cannot exceed 3000 characters'),
  });

  const clientLoginSchema = z.object({
    email: z
      .string()
      .trim()
      .email('Please enter a valid administrator email address')
      .max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
  });

  test('1. Valid inquiry payload passes validation schema', () => {
    const valid = {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+91 98765 12345',
      user_type: 'Student',
      category: 'Admission',
      message: 'I would like to inquire about eligibility for 11th grade commerce stream.',
    };

    const parsed = clientInquirySchema.safeParse(valid);
    assert.equal(parsed.success, true);
  });

  test('2. Incomplete inquiry payload fails validation with appropriate errors', () => {
    const invalid = {
      name: 'R',
      email: 'not-an-email',
      phone: '12',
      user_type: 'Other',
      category: 'Unknown',
      message: 'Hi',
    };

    const parsed = clientInquirySchema.safeParse(invalid);
    assert.equal(parsed.success, false);
    const fieldErrors = parsed.error.flatten().fieldErrors;
    assert.ok(fieldErrors.name);
    assert.ok(fieldErrors.email);
    assert.ok(fieldErrors.phone);
    assert.ok(fieldErrors.user_type);
    assert.ok(fieldErrors.category);
    assert.ok(fieldErrors.message);
  });

  test('3. Admin login schema validates email and password constraints', () => {
    const validLogin = {
      email: 'admin@k12hunar.edu.in',
      password: 'HunarAdmin#2026',
    };
    assert.equal(clientLoginSchema.safeParse(validLogin).success, true);

    const invalidLogin = {
      email: 'bad-email',
      password: '123',
    };
    const parsedInvalid = clientLoginSchema.safeParse(invalidLogin);
    assert.equal(parsedInvalid.success, false);
    assert.ok(parsedInvalid.error.flatten().fieldErrors.email);
    assert.ok(parsedInvalid.error.flatten().fieldErrors.password);
  });

  test('4. Token storage interface handles in-memory fallback safely', () => {
    const memoryStore = new Map();
    const mockStorage = {
      get(key) {
        return memoryStore.get(key) ?? null;
      },
      set(key, value) {
        memoryStore.set(key, value);
      },
      clear(key) {
        memoryStore.delete(key);
      },
    };

    assert.equal(mockStorage.get('token'), null);
    mockStorage.set('token', 'jwt_test_token_123');
    assert.equal(mockStorage.get('token'), 'jwt_test_token_123');
    mockStorage.clear('token');
    assert.equal(mockStorage.get('token'), null);
  });
});
