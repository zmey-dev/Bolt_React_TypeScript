import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import type { QuoteRequest, QuoteRequestImage } from '../types';
import { FormField } from './forms/FormField';
import { PhoneInput } from './forms/PhoneInput';

interface QuoteFormProps {
  selectedImages: QuoteRequestImage[];
  onSubmit: (data: QuoteRequest) => Promise<void>;
}

const TIMELINE_OPTIONS = [
  { value: '1-2_months', label: '1-2 months' },
  { value: '3-6_months', label: '3-6 months' },
  { value: '6+_months', label: '6+ months' }
];

const BUDGET_OPTIONS = [
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: '10k-25k', label: '$10,000 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k+', label: '$100,000+' }
];

export function QuoteForm({ selectedImages, onSubmit }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    console.log('QuoteForm: Starting form submission');
    
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('QuoteForm: Getting form data');
      // Get form element
      const form = e.target as HTMLFormElement;
      
      // Validate form
      if (!form.checkValidity()) {
        console.log('QuoteForm: Form validation failed');
        form.reportValidity();
        return;
      }
      
      console.log('QuoteForm: Creating request data', {
        imageCount: selectedImages.length
      });
      // Get form data
      const formData = new FormData(form);
      
      if (selectedImages.length === 0) {
        console.error('QuoteForm: No images selected');
        throw new Error('Please select at least one design for your quote request');
      }

      // Create request data
      const data: QuoteRequest = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        timeline: formData.get('timeline') as string,
        budget: formData.get('budget') as string,
        notes: formData.get('notes') as string,
        selectedImages
      };

      // Validate required fields
      if (!data.name || !data.email || !data.phone || !data.timeline || !data.budget) {
        console.error('QuoteForm: Missing required fields', {
          hasName: !!data.name,
          hasEmail: !!data.email,
          hasPhone: !!data.phone,
          hasTimeline: !!data.timeline,
          hasBudget: !!data.budget
        });
        throw new Error('Please fill in all required fields');
      }

      console.log('QuoteForm: Submitting request');
      // Submit request
      await onSubmit(data);
      console.log('QuoteForm: Submission successful');
      navigate('/quote-success');
    } catch (error) {
      console.error('QuoteForm: Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('QuoteForm: Submission process completed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-[#260000] rounded-lg"
    >
      <div className="text-center -mt-6"> 
        <h2 className="text-2xl font-bold text-white">
          Request a Quote for Your Selected Designs
        </h2>
        <p className="text-gray-300 mt-2">
          Fill out the form below to get a custom quote for the {selectedImages.length} item{selectedImages.length !== 1 ? 's' : ''} in your wishlist
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pt-6"> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
            />
          </div>
        </div>

        <PhoneInput required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-200 mb-2">
              Project Timeline
            </label>
            <select
              id="timeline"
              name="timeline"
              required
              className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
            >
              <option value="">Select Timeline</option>
              {TIMELINE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-200 mb-2">
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              required
              className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
            >
              <option value="">Select Budget</option>
              {BUDGET_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#260000]" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-[#260000]" />
              Submit Quote Request
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}