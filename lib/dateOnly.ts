/**
 * Fechas solo-día (input type="date" → "YYYY-MM-DD").
 * `new Date("2026-04-17")` en JS es medianoche UTC → en zonas como México
 * es aún el día 16 en local y el calendario muestra un día menos.
 */

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Convierte valor de input `YYYY-MM-DD` (o ISO completo) a Date para guardar en Mongo. */
export function commitDateOnlyToStorage(value: string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const trimmed = String(value).trim();
  if (YMD.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Día de calendario local coherente con la fecha elegida en el input:
 * usa la parte Y-M-D del instante en UTC (igual que `toISOString().slice(0,10)`).
 */
export function localCalendarDayFromStored(isoOrDate: string | Date): Date {
  const iso =
    typeof isoOrDate === 'string' ? isoOrDate.trim() : new Date(isoOrDate).toISOString();
  const part = iso.slice(0, 10);
  const [y, m, d] = part.split('-').map(Number);
  if (!y || !m || !d) return new Date(isoOrDate);
  return new Date(y, m - 1, d);
}

/** Valor para `input type="date"` a partir de lo guardado en API/Mongo. */
export function storedDueDateToInputValue(isoOrDate: string | Date | null | undefined): string {
  if (isoOrDate == null || isoOrDate === '') return '';
  const iso =
    typeof isoOrDate === 'string' ? isoOrDate.trim() : new Date(isoOrDate).toISOString();
  return iso.slice(0, 10);
}

/**
 * Valor para `input[type=datetime-local]`: hora local, no `toISOString()` (eso mete UTC y desfasa la hora).
 */
export function toDatetimeLocalValue(isoOrDate: string | Date | null | undefined): string {
  if (isoOrDate == null || isoOrDate === '') return '';
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
