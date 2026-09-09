// ==============================================================================
// FILTRO DE MODERACIÓN Y CONTENIDO OFENSIVO PARA DEDICATORIAS (ESPAÑOL / INGLÉS)
// Archivo: client/src/utils/profanityFilter.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

const BANNED_PATTERNS = [
  /put[ao]s?/i, /mierda/i, /hdp/i, /hij[ao]s?\s*de\s*put[ao]/i,
  /conch[ao]/i, /chup[ae]l[ao]/i, /verga/i, /pito/i, /pene/i, /vagina/i,
  /cul[ao]/i, /maric[ao]n/i, /maric[ao]nes/i, /trolo/i, /negro\s*de\s*m/i,
  /pelotud[ao]/i, /bolud[ao]/i, /tarad[ao]/i, /estupíd[ao]/i, /imbecil/i,
  /fuck/i, /shit/i, /bitch/i, /asshole/i, /dick/i, /pussy/i,
  /malparid[ao]/i, /gonorrea/i, /carechimba/i, /pendej[ao]/i, /chinga/i,
  /cabron/i, /cabrón/i, /weon/i, /weón/i, /aweona[do]/i, /ctm/i,
  /nazi/i, /hitler/i, /muerte\s*a/i, /violador/i, /pedofil/i,
];

// Normaliza sustituciones tipo leetspeak: @ -> a, 1 -> i, 0 -> o, 3 -> e, $ -> s
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[\s\.\-_,;:]+/g, ' ');
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errorReason?: string;
}

export const MAX_DEDICATION_LENGTH = 70;

export function validateDedication(rawText: string | undefined | null): ValidationResult {
  if (!rawText || rawText.trim() === '') {
    return { isValid: true, sanitized: '' };
  }

  const trimmed = rawText.trim();

  if (trimmed.length > MAX_DEDICATION_LENGTH) {
    return {
      isValid: false,
      sanitized: trimmed.slice(0, MAX_DEDICATION_LENGTH),
      errorReason: `La dedicatoria no puede superar los ${MAX_DEDICATION_LENGTH} caracteres.`,
    };
  }

  const normalized = normalizeText(trimmed);

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(trimmed)) {
      return {
        isValid: false,
        sanitized: trimmed,
        errorReason: 'La dedicatoria contiene lenguaje no permitido. Por favor usa un mensaje amigable para toda la fiesta.',
      };
    }
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}
