
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ExpertNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found in expert dashboard</p>
      <Button onClick={() => navigate('/expert')}>
        Return to Expert Dashboard
      </Button>
    </div>
  );
};

export default ExpertNotFound;
