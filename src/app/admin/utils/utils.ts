import { Match } from "../interface/adminInterface";

/**
 * Valida que las fechas estén en formato ISO correcto
 */
export function validateISODate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Formatea una fecha para mostrar
 */
export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("es-EC", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Ordena matches por fecha de creación (más recientes primero)
 */
export function sortMatchesByDate(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
}

/**
 * Verifica si un correo es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Obtiene estadísticas de los matches
 */
export function getMatchStats(matches: Match[]) {
  const total = matches.length;
  const complete = matches.filter((m) => m.santa && m.recipient).length;
  const incomplete = total - complete;

  return {
    total,
    complete,
    incomplete,
    completionRate: total > 0 ? Math.round((complete / total) * 100) : 0,
  };
}
