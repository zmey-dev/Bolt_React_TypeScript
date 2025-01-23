import React from 'react';
import { X, Search, Heart, PenLine, Send, Info, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      icon: Search,
      title: "Browse the Gallery",
      description: "Explore our curated collection of LED light display designs. Filter by gallery type and tags to find the perfect lighted designs for your project."
    },
    {
      icon: Wand2,
      title: "Generate Similar Designs (Optional)",
      description: "See a design you like? Add to the wishlist or use our AI-powered generator to create variations and custom designs based on your preferences."
    },
    {
      icon: Heart,
      title: "Build Your Wishlist",
      description: "Add your favorite designs to your wishlist. You can save multiple designs to compare and consider. You can also upload your own design or use the 'Generate New Design' button for AI-generated custom options."
    },
    {
      icon: PenLine,
      title: "Add Notes",
      description: "Add notes for each lighting design in your wishlist, including sizes, colors, customizations, or special requests, to help us provide an accurate quote."
    },
    {
      icon: Send,
      title: "Request a Quote",
      description: "When you're ready, submit a quote request with your selected designs. Our team will review your preferences and provide a detailed quote estimate within 1-2 weeks."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ position: 'fixed', zIndex: 9999 }}>
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
            className="relative w-full max-w-3xl bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20 m-4 z-10"
          >
            <div className="flex items-center justify-center p-6 border-b border-yellow-400/20">
              <div className="flex items-center gap-2">
                <Info className="w-8 h-8 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">How It Works</h2>
              </div>
              <button
                onClick={onClose}
                className="absolute right-6 p-2 hover:bg-[#3b0000] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-white mb-2">
                        Step {index + 1}: {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-[#1f1f1f] border border-yellow-400/20 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  Need help? Our team is here to assist you throughout the process. Feel free to reach out with any questions about our designs or customization options.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}