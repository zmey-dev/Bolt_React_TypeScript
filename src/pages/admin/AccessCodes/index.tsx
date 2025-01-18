import React from 'react';
import { AdminNav } from '../../../components/AdminNav';
import { AccessCodesTable } from './components/AccessCodesTable';
import { useAccessCodes } from './hooks/useAccessCodes';

export function AccessCodes() {
  const {
    codes,
    loading,
    error,
    isGenerating,
    handleGenerateCode,
    handleDeleteCode,
    handleUpdateCode
  } = useAccessCodes();

  return (
    <div className="min-h-screen bg-black">
      <AdminNav />
      <AccessCodesTable
        codes={codes}
        loading={loading}
        error={error}
        isGenerating={isGenerating}
        onGenerateCode={handleGenerateCode}
        onDeleteCode={handleDeleteCode}
        onUpdateCode={handleUpdateCode}
      />
    </div>
  );
}