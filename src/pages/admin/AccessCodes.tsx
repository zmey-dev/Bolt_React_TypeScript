import React from 'react';
import { AdminNav } from '../../components/AdminNav';
import { AccessCodesTable } from './AccessCodes/components/AccessCodesTable';
import { useAccessCodes } from './AccessCodes/hooks/useAccessCodes';

export function AccessCodes() {
  const {
    codes,
    requests,
    loading,
    error,
    isGenerating,
    handleGenerateCode,
    handleDeleteCode,
    handleDeleteRequest,
    handleUpdateCode
  } = useAccessCodes();

  return (
    <div className="min-h-screen bg-[url('https://jpvvgmvvdfsiruthfkhb.supabase.co/storage/v1/object/public/images/Website%20Design%20Images/LightShowVault%20Darker%20Background.svg?t=2025-01-21T15%3A48%3A42.034Z')] bg-cover bg-center bg-no-repeat">
      <AdminNav />
      <AccessCodesTable
        codes={codes}
        requests={requests}
        loading={loading}
        error={error}
        isGenerating={isGenerating}
        onGenerateCode={handleGenerateCode}
        onDeleteCode={handleDeleteCode}
        onDeleteRequest={handleDeleteRequest}
        onUpdateCode={handleUpdateCode}
      />
    </div>
  );
}