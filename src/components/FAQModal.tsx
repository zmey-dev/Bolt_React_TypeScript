import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
  {
    question: "How closely do the factories follow the designs in your main gallery?",
    answer: "Our manufacturing partners strive to replicate the designs in our main gallery as closely as possible. In most cases, they not only match the designs but also enhance them for better aesthetics, durability, and functionality. Any necessary adjustments are made to ensure the final product meets the highest standards of quality and safety while staying true to the original design vision."
  },
  {
    question: "What materials are used to produce the displays?",
    answer: "Our displays are typically made of a steel frame for durability, PVC mesh netting outer layer, and IP-rated string lights (like IP65 or IP67) to ensure they're waterproof and suitable for outdoor use. The lights themselves are energy-efficient LEDs, and the whole setup is designed to be weather-resistant and long-lasting. The combination of PVC netting and high-quality materials ensures the most aesthetically pleasing final designs, while also providing structural integrity and durability. Other materials available upon request."
  },
  {
    question: "How accurate are the AI-generated designs to the final product?",
    answer: "Our manufacturing partners strive to create LED displays that closely match the designs while adhering to engineering and safety standards. While some adjustments may be necessary for structural integrity or technical feasibility, we work closely with manufacturers to maintain the core aesthetic and creative elements of your chosen design. Any significant modifications needed will be discussed during the quote process."
  },
  {
    question: "What factors affect the final quote price?",
    answer: "Several factors influence the cost: size of the display, complexity of the design, number of LED lights required, custom color requirements, animation capabilities (if desired), installation requirements, and timeline. We provide detailed breakdowns in our quotes to help you understand the pricing structure."
  },
  {
    question: "How long does it take to manufacture and deliver a custom light display?",
    answer: "Typical manufacturing time ranges from 3-8 weeks, depending on design complexity, quantity of displays, and current production schedules. Shipping usually takes an additional 4-6 weeks. During peak seasons (like pre-Christmas), timelines may be longer, so we recommend planning ahead."
  },
  {
    question: "Do you offer installation services?",
    answer: "Yes, we can coordinate professional installation through our network of certified installers. Installation services can be included in your quote request, and we'll match you with installers in your area who specialize in commercial light displays."
  },
  {
    question: "What type of warranty or guarantee do you offer?",
    answer: "Our LED displays typically come with a 2-year manufacturer's warranty covering defects in materials and workmanship. Extended warranties are available. All electronics are weather-resistant and built to withstand outdoor conditions."
  },
  {
    question: "Can designs be customized with specific colors or animations?",
    answer: "Yes! Most designs can be customized with your preferred colors and animation sequences. During the quote process, you can specify your color preferences and whether you'd like static or animated displays. Our team will work with you to achieve your vision while ensuring technical feasibility."
  },
  {
    question: "What about maintenance and repairs?",
    answer: "Our LED displays are designed for durability and low maintenance. However, we provide detailed maintenance guides and can connect you with local technicians for any repairs needed. Many common issues can be resolved through our remote support team."
  },
  {
    question: "Do you offer bulk discounts for multiple displays?",
    answer: "Yes, we offer scaled pricing for multiple display orders. This is particularly beneficial for businesses looking to create coordinated holiday displays or themed installations across multiple locations. Include all desired pieces in your quote request for the best pricing."
  }
];
  if (!isOpen) return null;

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
                <HelpCircle className="w-8 h-8 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
              </div>
              <button
                onClick={onClose}
                className="absolute right-6 p-2 hover:bg-[#3b0000] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#1f1f1f] rounded-lg hover:bg-[#3b0000] transition-colors cursor-pointer border border-yellow-400/10"
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-white font-medium">{faq.question}</h3>
                    {activeIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-300 text-sm p-4 pt-0 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="mt-8 p-4 bg-[#1f1f1f] border border-yellow-400/20 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  Have a question not answered here? Feel free to include it in your quote request, and our team will be happy to help!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}