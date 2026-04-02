import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';

import Logo from '@/components/branding/Logo';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import CompanySetup from '@/components/onboarding/CompanySetup';
import InviteEmployees from '@/components/onboarding/InviteEmployees';
import DepartmentSetup from '@/components/onboarding/DepartmentSetup';
import { useToastNotification } from '@/components/shared/ToastNotification';
import { bootstrapWorkspace, inviteEmployees } from '@/services/authService';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError, notifyInfo } = useToastNotification();

  const [formData, setFormData] = useState({
    companyName: '',
    companySize: '',
    industry: '',
    employees: [{ name: '', email: '', role: '' }],
    departments: ['Engineering', 'Design', 'Marketing', 'HR', 'Sales']
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);

    try {
      await bootstrapWorkspace({
        companyName: formData.companyName,
        companySize: formData.companySize,
        industry: formData.industry,
        departments: formData.departments,
      });

      const employeesToInvite = formData.employees.filter(
        (employee) => employee.email?.trim()
      );

      if (employeesToInvite.length > 0) {
        try {
          const inviteResponse = await inviteEmployees({ employees: employeesToInvite });
          const inviteResult = inviteResponse || {};
          const invitedCount = inviteResult.invited?.length || 0;
          const failedCount = inviteResult.failed?.length || 0;
          const skippedCount = inviteResult.skipped?.length || 0;

          if (invitedCount > 0) {
            notifySuccess(
              "Welcome aboard!",
              `Your workspace is ready and ${invitedCount} invitation${invitedCount === 1 ? '' : 's'} ${invitedCount === 1 ? 'was' : 'were'} sent.`
            );
          } else {
            notifySuccess("Welcome aboard!", "Your workspace has been set up successfully.");
          }

          if (failedCount > 0 || skippedCount > 0) {
            notifyInfo(
              "Some invitations need attention",
              `${failedCount} failed and ${skippedCount} ${skippedCount === 1 ? 'was' : 'were'} skipped. You can resend them later from Settings.`
            );
          }
        } catch (inviteError) {
          notifyInfo(
            "Workspace created",
            inviteError.response?.data?.message || "Your workspace is ready, but employee invitations could not be sent right now."
          );
        }
      } else {
        notifySuccess("Welcome aboard!", "Your workspace has been set up successfully.");
      }

      queryClient.setQueryData(['current-user'], (currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          companyName: formData.companyName || currentProfile.companyName,
          workspaceInitialized: true,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      navigate('/dashboard');
    } catch (error) {
      notifyError(
        "Setup failed",
        error.response?.data?.message || "We could not finish creating your workspace."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanySetup formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 2:
        return <InviteEmployees formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={previousStep} />;
      case 3:
        return <DepartmentSetup formData={formData} updateFormData={updateFormData} onNext={completeOnboarding} onBack={previousStep} isSubmitting={isSubmitting} />;
      default:
        return <CompanySetup formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
    }
  };

  if (!isLoaded) return null; // Wait for clerk to load user data

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-sans selection:bg-primary/20">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} afterSignOutUrl="/" />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-6 mt-16 pb-24">
        <OnboardingProgress currentStep={currentStep} totalSteps={3} />
        
        <div className="w-full max-w-2xl relative">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
