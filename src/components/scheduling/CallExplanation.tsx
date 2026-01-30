import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, Clock, MessageSquare, ClipboardList, Shield, ChevronDown } from 'lucide-react';

interface ExplanationItem {
  icon: typeof PhoneCall;
  title: string;
  content: string;
}

const explanationItems: ExplanationItem[] = [
  {
    icon: PhoneCall,
    title: 'What is this call?',
    content:
      'This is a brief phone call with our automated assistant to collect important information before your clinical evaluation. The call helps us prepare for your visit and ensures we have everything we need.',
  },
  {
    icon: MessageSquare,
    title: 'What will we discuss?',
    content:
      'We will ask about your medical history, current medications, any allergies, your support system at home, and transportation to appointments. This helps our team understand your needs better.',
  },
  {
    icon: Clock,
    title: 'How long will it take?',
    content:
      'The call typically takes about 15-20 minutes. Please find a quiet place where you can speak comfortably.',
  },
  {
    icon: ClipboardList,
    title: 'What should I have ready?',
    content:
      'Please have a list of your current medications (names and dosages), information about any recent surgeries or hospitalizations, and any questions you might have for our team.',
  },
  {
    icon: Shield,
    title: 'Is my information secure?',
    content:
      'Yes, absolutely. All information you share is protected by HIPAA and used only for your transplant care. Your privacy is our priority.',
  },
];

function ExplanationSection({ item, isOpen, onToggle }: { item: ExplanationItem; isOpen: boolean; onToggle: () => void }) {
  const Icon = item.icon;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <span className="flex-1 font-medium text-gray-900">{item.title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-[4.25rem]">
              <p className="text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CallExplanation() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        About Your Pre-Evaluation Call
      </h3>
      {explanationItems.map((item, index) => (
        <ExplanationSection
          key={item.title}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </motion.div>
  );
}
