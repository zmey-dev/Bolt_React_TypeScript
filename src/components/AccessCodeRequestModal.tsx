import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Loader2,
  Send,
  AlertCircle,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  KeyRound,
  Mail,
  Phone,
  ClipboardList,
} from 'lucide-react';
import { submitAccessCodeRequest } from '../lib/api/access-codes';

interface AccessCodeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessCodeRequestModal({ isOpen, onClose }: AccessCodeRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const data = {
        companyName: formData.get('companyName') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        projectType: formData.get('projectType') as string,
        estimatedBudget: formData.get('estimatedBudget') as string,
        timeline: formData.get('timeline') as string,
        additionalInfo: formData.get('additionalInfo') as string,
      };

      await submitAccessCodeRequest(data);
      setSuccess(true);

      // Reset form
      e.currentTarget.reset();

      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20"
        >
          <div className="flex items-center justify-between p-6 border-b border-yellow-400/20">
            <div className="flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Request Access Code</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#3b0000] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Request Submitted!</h3>
                <p className="text-gray-300">
                  Thank you for your interest. We'll review your request and get back to you within a few days.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-900/30 border-2 border-red-500 rounded-lg flex items-center gap-2 text-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        required
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Contact Name
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="contactName"
                        required
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                        placeholder="(Optional)"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Project Type
                  </label>
                  <div className="relative">
                    <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="projectType"
                      required
                      className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                    >
                      <option value="">Select project type</option>
                      <option value="commercial">Christmas Light Show</option>
                      <option value="commercial">Commercial Property</option>
                      <option value="residential">Residential Property</option>
                      <option value="event">Special Event</option>
                      <option value="municipal">Municipal/City Project</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Estimated Budget
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="estimatedBudget"
                        required
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                      >
                        <option value="">Select budget range</option>
                        <option value="5k-10k">$5,000 - $10,000</option>
                        <option value="10k-25k">$10,000 - $25,000</option>
                        <option value="25k-50k">$25,000 - $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="50k-100k">$100,000 - $250,000</option>
                         <option value="50k-100k">$250,000 - $500,000</option>
                        <option value="100k+">$500,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Project Timeline
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="timeline"
                        required
                        className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                      >
                        <option value="">Select timeline</option>
                        <option value="1-2_months">1-2 months</option>
                        <option value="3-6_months">3-6 months</option>
                        <option value="6+_months">6+ months</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    rows={4}
                    className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                    placeholder="Tell us more about your project and specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-400/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#260000]" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-[#260000]" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}