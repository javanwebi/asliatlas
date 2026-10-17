import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { portalContentService } from '../../services/portalContentService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  portalType?: 'consumer' | 'high_volume';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, portalType }) => {
  const { currentUser } = useAuth();

  if (currentUser && portalType) {
    const isHighVol = portalContentService.isHighVolumeCustomer(currentUser);
    // کاربری که ثبت‌نام عادی کرده فقط به /consumer-dashboard دسترسی دارد و نباید وارد /account شود
    if (portalType === 'high_volume' && !isHighVol) {
      return <Navigate to="/consumer-dashboard" replace />;
    }
    // مشتری خرید بالا که در CRM تعریف شده فقط به /account دسترسی دارد
    if (portalType === 'consumer' && isHighVol) {
      return <Navigate to="/account" replace />;
    }
  }

  return <>{children}</>;
};
