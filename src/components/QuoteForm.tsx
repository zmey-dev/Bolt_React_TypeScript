import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Heart, Loader2, AlertCircle } from 'lucide-react';
import { QuoteRequest, QuoteRequestImage } from '../types';
import { FormField } from './forms/FormField';
import { FormSelect } from './forms/FormSelect';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData(e.currentTarget);
      
      const data: QuoteRequest = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        timeline: formData.get('timeline') as string,
        budget: formData.get('budget') as string,
        notes: formData.get('notes') as string,
        selectedImages
      };

      await onSubmit(data);
      navigate('/quote-success');
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit quote request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
          <Heart className="w-5 h-5" />
          <span className="text-sm">Wishlist Quote Request</span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Request a Quote for Your Selected Designs
        </h2>
        <p className="text-gray-400 mt-2">
          Fill out the form below to get a custom quote for the {selectedImages.length} item{selectedImages.length !== 1 ? 's' : ''} in your wishlist
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Name"
            name="name"
            type="text"
            required
          />
          
          <FormField
            label="Email"
            name="email"
            type="email"
            required
          />
        </div>

        <PhoneInput required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Project Timeline"
            name="timeline"
            options={TIMELINE_OPTIONS}
            required
          />

          <FormSelect
            label="Budget Range"
            name="budget"
            options={BUDGET_OPTIONS}
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Quote Request
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}