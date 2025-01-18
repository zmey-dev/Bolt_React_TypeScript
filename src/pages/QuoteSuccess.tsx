import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calendar, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuoteSuccess() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Quote Request Received!
          </h1>
          
          <div className="space-y-4 mb-8">
            <p className="text-gray-300">
              Thank you for your interest in our lighting designs.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Calendar className="w-5 h-5" />
              <p>We'll get back to you within a week</p>
            </div>

            <p className="text-gray-400 text-sm">
              Our team will review your request and prepare a detailed quote based on your selected designs and requirements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Link>
            
            <a
              href="mailto:support@lightshowvault.com"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}