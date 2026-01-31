import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour vérifier les permissions
 */
export function usePermissions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.custom_role_id],
    queryFn: () => base44.entities.Role.filter({ id: user.custom_role_id }),
    enabled: !!user?.custom_role_id
  });

  const role = userRole?.[0];

  const hasPermission = (module, action) => {
    // Admin a tous les droits
    if (user?.role === 'admin') return true;

    // Vérifier les permissions du rôle personnalisé
    if (role?.permissions?.[module]?.[action]) {
      return true;
    }

    return false;
  };

  const canView = (module) => hasPermission(module, 'view');
  const canCreate = (module) => hasPermission(module, 'create');
  const canEdit = (module) => hasPermission(module, 'edit');
  const canDelete = (module) => hasPermission(module, 'delete');

  return {
    user,
    role,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin: user?.role === 'admin'
  };
}

/**
 * Composant pour protéger l'affichage selon les permissions
 */
export function PermissionGuard({ module, action, children, fallback = null }) {
  const { hasPermission } = usePermissions();

  if (hasPermission(module, action)) {
    return <>{children}</>;
  }

  return fallback;
}

/**
 * HOC pour protéger une page entière
 */
export function withPermission(Component, module, action = 'view') {
  return function ProtectedComponent(props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(module, action)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Accès Refusé
            </h1>
            <p className="text-slate-500">
              Vous n'avez pas la permission d'accéder à cette page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}