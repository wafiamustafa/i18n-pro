import { describe, it, expect } from 'vitest';
import { validateNoStructuralConflict } from '../../src/core/key-validator.js';

describe('key-validator', () => {
  describe('validateNoStructuralConflict', () => {
    it('should not throw for non-conflicting key', () => {
      const flatObject = {
        'existing.key': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'new.key')).not.toThrow();
    });

    it('should not throw when adding to empty object', () => {
      const flatObject = {};
      expect(() => validateNoStructuralConflict(flatObject, 'any.key')).not.toThrow();
    });

    it('should throw when parent key exists as value', () => {
      const flatObject = {
        'auth': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login.title')).toThrow(
        'Structural conflict detected:\n\nCannot create key "auth.login.title" because "auth" is already defined as a non-object value.'
      );
    });

    it('should throw when intermediate parent exists as value', () => {
      const flatObject = {
        'auth.login': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login.title')).toThrow(
        'Structural conflict detected:\n\nCannot create key "auth.login.title" because "auth.login" is already defined as a non-object value.'
      );
    });

    it('should throw when key would overwrite nested keys', () => {
      const flatObject = {
        'auth.login.title': 'value',
        'auth.login.button': 'click'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login')).toThrow(
        'Structural conflict detected:\n\nCannot create key "auth.login" because it would overwrite nested keys like "auth.login.title".'
      );
    });

    it('should throw when key would overwrite deeply nested keys', () => {
      const flatObject = {
        'a.b.c.d': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'a')).toThrow(
        'Structural conflict detected:\n\nCannot create key "a" because it would overwrite nested keys like "a.b.c.d".'
      );
    });

    it('should not throw for sibling keys', () => {
      const flatObject = {
        'auth.login.title': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth.logout.title')).not.toThrow();
    });

    it('should not throw for unrelated keys', () => {
      const flatObject = {
        'user.name': 'John',
        'user.email': 'john@example.com'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'settings.theme')).not.toThrow();
    });

    it('should handle single-segment keys', () => {
      const flatObject = {
        'existing': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'new')).not.toThrow();
    });

    it('should throw when single-segment key would overwrite nested keys', () => {
      const flatObject = {
        'auth.login': 'value'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth')).toThrow(
        'Structural conflict detected:\n\nCannot create key "auth" because it would overwrite nested keys like "auth.login".'
      );
    });

    it('should handle keys with similar prefixes', () => {
      const flatObject = {
        'authentication': 'value'
      };
      // 'auth' is a prefix of 'authentication' but not a parent path
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login')).not.toThrow();
    });

    it('should handle multiple levels of nesting', () => {
      const flatObject = {
        'a.b.c.d.e': 'value'
      };
      
      // All these should throw parent conflicts
      expect(() => validateNoStructuralConflict(flatObject, 'a')).toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'a.b')).toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'a.b.c')).toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'a.b.c.d')).toThrow();
      
      // This should not throw (same key)
      expect(() => validateNoStructuralConflict(flatObject, 'a.b.c.d.e')).not.toThrow();
    });

    it('should detect child conflicts across multiple keys', () => {
      const flatObject = {
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In',
        'auth.register.title': 'Register'
      };
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login')).toThrow(
        'Structural conflict detected:\n\nCannot create key "auth.login" because it would overwrite nested keys like "auth.login.title".'
      );
    });

    it('should not throw for exact same key', () => {
      const flatObject = {
        'auth.login.title': 'value'
      };
      // This should not throw - the caller should check for key existence separately
      expect(() => validateNoStructuralConflict(flatObject, 'auth.login.title')).not.toThrow();
    });

    it('should handle empty string key', () => {
      const flatObject = {};
      // Empty string key is unusual but should not throw
      expect(() => validateNoStructuralConflict(flatObject, '')).not.toThrow();
    });

    it('should handle keys with dots only', () => {
      const flatObject = {};
      expect(() => validateNoStructuralConflict(flatObject, '...')).not.toThrow();
    });

    it('should handle complex nested structure', () => {
      const flatObject = {
        'app.header.title': 'My App',
        'app.header.logo': 'logo.png',
        'app.footer.copyright': '2024',
        'app.footer.links': ['about', 'contact']
      };
      
      // These should throw
      expect(() => validateNoStructuralConflict(flatObject, 'app')).toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'app.header')).toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'app.footer')).toThrow();
      
      // These should not throw
      expect(() => validateNoStructuralConflict(flatObject, 'app.sidebar')).not.toThrow();
      expect(() => validateNoStructuralConflict(flatObject, 'other.key')).not.toThrow();
    });
  });
});
