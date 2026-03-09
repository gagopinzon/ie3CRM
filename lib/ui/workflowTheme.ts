export const WORKFLOW_PALETTE = {
  midnightViolet: '#1e152a',
  granite: '#4e6766',
  pacificBlue: '#5ab1bb',
  willowGreen: '#a5c882',
  jasmine: '#f7dd72',
} as const;

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'todo':
      return 'Por hacer';
    case 'in_progress':
      return 'En progreso';
    case 'review':
      return 'En revisión';
    case 'done':
      return 'Completado';
    default:
      return status;
  }
}

export function getStatusHexColor(status: string): string {
  switch (status) {
    case 'todo':
      return WORKFLOW_PALETTE.granite;
    case 'in_progress':
      return WORKFLOW_PALETTE.pacificBlue;
    case 'review':
      return WORKFLOW_PALETTE.jasmine;
    case 'done':
      return WORKFLOW_PALETTE.willowGreen;
    default:
      return WORKFLOW_PALETTE.midnightViolet;
  }
}

export function getStatusRowClasses(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-[#4e6766]/12 border border-[#4e6766]/25';
    case 'in_progress':
      return 'bg-[#5ab1bb]/20 border border-[#5ab1bb]/35';
    case 'review':
      return 'bg-[#f7dd72]/28 border border-[#f7dd72]/45';
    case 'done':
      return 'bg-[#a5c882]/28 border border-[#a5c882]/45';
    default:
      return 'bg-[#4e6766]/12 border border-[#4e6766]/25';
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-[#4e6766]/20 text-[#1e152a]';
    case 'in_progress':
      return 'bg-[#5ab1bb]/30 text-[#1e152a]';
    case 'review':
      return 'bg-[#f7dd72]/45 text-[#1e152a]';
    case 'done':
      return 'bg-[#a5c882]/45 text-[#1e152a]';
    default:
      return 'bg-[#4e6766]/20 text-[#1e152a]';
  }
}

export function getCalendarEventColors(status: string, isNote = false): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  if (isNote) {
    return {
      backgroundColor: `${WORKFLOW_PALETTE.midnightViolet}22`,
      color: WORKFLOW_PALETTE.midnightViolet,
      borderColor: `${WORKFLOW_PALETTE.midnightViolet}55`,
    };
  }

  switch (status) {
    case 'todo':
      return {
        backgroundColor: `${WORKFLOW_PALETTE.granite}33`,
        color: WORKFLOW_PALETTE.midnightViolet,
        borderColor: `${WORKFLOW_PALETTE.granite}88`,
      };
    case 'in_progress':
      return {
        backgroundColor: `${WORKFLOW_PALETTE.pacificBlue}4D`,
        color: WORKFLOW_PALETTE.midnightViolet,
        borderColor: `${WORKFLOW_PALETTE.pacificBlue}B3`,
      };
    case 'review':
      return {
        backgroundColor: `${WORKFLOW_PALETTE.jasmine}66`,
        color: WORKFLOW_PALETTE.midnightViolet,
        borderColor: `${WORKFLOW_PALETTE.jasmine}CC`,
      };
    case 'done':
      return {
        backgroundColor: `${WORKFLOW_PALETTE.willowGreen}66`,
        color: WORKFLOW_PALETTE.midnightViolet,
        borderColor: `${WORKFLOW_PALETTE.willowGreen}CC`,
      };
    default:
      return {
        backgroundColor: `${WORKFLOW_PALETTE.granite}33`,
        color: WORKFLOW_PALETTE.midnightViolet,
        borderColor: `${WORKFLOW_PALETTE.granite}88`,
      };
  }
}

export function getTaskCardPalette(status: string): {
  card: string;
  icon: string;
  meta: string;
  handle?: string;
} {
  switch (status) {
    case 'todo':
      return {
        card: 'bg-[#4e6766]/15 border-[#4e6766]/35 hover:bg-[#4e6766]/25',
        icon: 'bg-[#4e6766]/35 text-[#1e152a]',
        meta: 'text-[#1e152a]',
        handle: 'bg-[#4e6766]/25 border-[#4e6766]/40',
      };
    case 'in_progress':
      return {
        card: 'bg-[#5ab1bb]/30 border-[#5ab1bb]/60 hover:bg-[#5ab1bb]/40',
        icon: 'bg-[#5ab1bb]/45 text-[#1e152a]',
        meta: 'text-[#1e152a]',
        handle: 'bg-[#5ab1bb]/35 border-[#5ab1bb]/65',
      };
    case 'review':
      return {
        card: 'bg-[#f7dd72]/35 border-[#f7dd72]/70 hover:bg-[#f7dd72]/45',
        icon: 'bg-[#f7dd72]/55 text-[#1e152a]',
        meta: 'text-[#1e152a]',
        handle: 'bg-[#f7dd72]/45 border-[#f7dd72]/75',
      };
    case 'done':
      return {
        card: 'bg-[#a5c882]/35 border-[#a5c882]/70 hover:bg-[#a5c882]/45',
        icon: 'bg-[#a5c882]/55 text-[#1e152a]',
        meta: 'text-[#1e152a]',
        handle: 'bg-[#a5c882]/45 border-[#a5c882]/70',
      };
    default:
      return {
        card: 'bg-[#4e6766]/15 border-[#4e6766]/35 hover:bg-[#4e6766]/25',
        icon: 'bg-[#4e6766]/35 text-[#1e152a]',
        meta: 'text-[#1e152a]',
        handle: 'bg-[#4e6766]/25 border-[#4e6766]/40',
      };
  }
}

export const KANBAN_COLUMN_THEME = {
  todo: 'bg-[#4e6766]/20 border-[#4e6766]/45',
  in_progress: 'bg-[#5ab1bb]/30 border-[#5ab1bb]/60',
  review: 'bg-[#f7dd72]/35 border-[#f7dd72]/70',
  done: 'bg-[#a5c882]/35 border-[#a5c882]/70',
} as const;
