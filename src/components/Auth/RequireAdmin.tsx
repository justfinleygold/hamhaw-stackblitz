import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getProfile } from '../../lib/database';

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has admin role
    getProfile(user.id).then(profile => {
      if (!profile?.roles?.name || profile.roles.name !== 'admin') {
        navigate('/');
      }
    }).catch(() => {
      navigate('/');
    });
  }, [user, navigate]);

  return <>{children}</>;
}