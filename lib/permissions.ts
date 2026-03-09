/**
 * Permisos del rol, tal como se guardan en la sesión tras el login.
 * Si se cambia el rol del usuario, debe volver a iniciar sesión para actualizar permisos.
 */
export interface SessionPermissions {
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManageClients: boolean;
  canManageDocuments: boolean;
  canManageCategories: boolean;
  canManageDocumentTypes: boolean;
  canViewAllProjects: boolean;
  canEditAllProjects: boolean;
}

export function hasPermission(
  permissions: SessionPermissions | null | undefined,
  key: keyof SessionPermissions
): boolean {
  return !!permissions?.[key];
}
