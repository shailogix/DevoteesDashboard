
export interface EncryptionConfig {
  key: string;
}

const DEFAULT_KEY = 'JAISHRIMADHAV';

export class EncryptionService {
  private static key: string = DEFAULT_KEY;

  static setKey(newKey: string) {
    this.key = newKey || DEFAULT_KEY;
  }

  static getKey(): string {
    return this.key;
  }

  static encrypt(text: string, customKey?: string): string {
    if (!text) return '';
    
    const key = customKey || this.key;
    let encrypted = '';
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = String.fromCharCode(charCode ^ keyChar);
      encrypted += encryptedChar;
    }
    
    // Convert to base64 for safe storage
    return btoa(encrypted);
  }

  static decrypt(encryptedText: string, customKey?: string): string {
    if (!encryptedText) return '';
    
    try {
      const key = customKey || this.key;
      // Decode from base64
      const encrypted = atob(encryptedText);
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const decryptedChar = String.fromCharCode(charCode ^ keyChar);
        decrypted += decryptedChar;
      }
      
      return decrypted;
    } catch (error) {
      return 'Invalid encrypted text';
    }
  }

  static generateUniqueId(dateOfBirth: string, mandalCode: string, mobileNumber: string): string {
    if (!dateOfBirth || !mandalCode || !mobileNumber) return '';
    
    const dobDate = new Date(dateOfBirth);
    const day = String(dobDate.getDate()).padStart(2, '0');
    const month = String(dobDate.getMonth() + 1).padStart(2, '0');
    const year = dobDate.getFullYear();
    const ddmmyyyy = `${day}${month}${year}`;
    
    const lastThreeDigits = mobileNumber.slice(-3);
    
    // Format: MCDDMMYYYYLTD
    return `${mandalCode}${ddmmyyyy}${lastThreeDigits}`;
  }

  static createQRIdentifier(uniqueId: string): string {
    return this.encrypt(uniqueId);
  }

  static decodeQRIdentifier(qrIdentifier: string): string {
    return this.decrypt(qrIdentifier);
  }
}
