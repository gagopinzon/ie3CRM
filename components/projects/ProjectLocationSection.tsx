'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const LocationMap = dynamic(() => import('@/components/projects/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-lg border-2 border-gray-200 bg-gray-100 animate-pulse flex items-center justify-center text-gray-500 text-sm">
      Cargando mapa...
    </div>
  ),
});

interface ProjectLocationSectionProps {
  projectId: string;
  initialLocation?: {
    address?: string | null;
    lat?: number;
    lng?: number;
  };
  /** Solo consulta: no buscador ni edición (p. ej. en la vista de detalle del proyecto) */
  readOnly?: boolean;
}

/**
 * Apartado de Ubicación para la columna "Información del Proyecto".
 * readOnly: solo mapa y dirección; sin readOnly: buscador y pin arrastrable para editar.
 */
export default function ProjectLocationSection({
  projectId,
  initialLocation,
  readOnly = false,
}: ProjectLocationSectionProps) {
  const router = useRouter();
  const hasLocation =
    (initialLocation?.lat != null && initialLocation?.lng != null) || !!initialLocation?.address;

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2">
        <MapPin size={14} />
        Ubicación
      </label>
      <div className="mt-2">
        {readOnly && !hasLocation ? (
          <p className="text-sm text-gray-500 py-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
            Sin ubicación definida. Configúrala al editar el proyecto.
          </p>
        ) : (
          <LocationMap
            className="w-full"
            projectId={readOnly ? undefined : projectId}
            initialLocation={initialLocation}
            onSaved={readOnly ? undefined : () => router.refresh()}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );
}
