import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthModal } from './AuthModal';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      setShowModal(true);
    }
  }, [user]);

  return (
    <>
      {children}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}