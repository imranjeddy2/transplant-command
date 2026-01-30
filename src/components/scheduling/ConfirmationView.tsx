import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Phone, HelpCircle } from 'lucide-react';
import type { TransplantCenterConfig } from '@/config/transplantCenters';

interface ConfirmationViewProps {
  scheduledTime: string;
  patientPhone: string;
  center: TransplantCenterConfig;
}

export function ConfirmationView({ scheduledTime, patientPhone, center }: ConfirmationViewProps) {
  const date = new Date(scheduledTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Your Call is Scheduled!
        </h2>
        <p className="text-gray-600">
          We look forward to speaking with you.
        </p>
      </motion.div>

      {/* Appointment Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 rounded-xl p-6 text-left space-y-4"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${center.primaryColor}15` }}
          >
            <Calendar className="h-5 w-5" style={{ color: center.primaryColor }} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-semibold text-gray-900">{formattedDate}</p>
            <p className="font-semibold text-gray-900">{formattedTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${center.primaryColor}15` }}
          >
            <Phone className="h-5 w-5" style={{ color: center.primaryColor }} />
          </div>
          <div>
            <p className="text-sm text-gray-500">We will call you at</p>
            <p className="font-semibold text-gray-900">{patientPhone}</p>
          </div>
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left"
      >
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• You will receive a confirmation text message shortly</li>
          <li>• We will call you at your scheduled time</li>
          <li>• Please have your medication list ready</li>
          <li>• The call will take about 15-20 minutes</li>
        </ul>
      </motion.div>

      {/* Need to Reschedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-3 text-left bg-white border border-gray-200 rounded-xl p-4"
      >
        <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-600">
            Need to reschedule? Contact us at{' '}
            <a
              href={`tel:${center.contactPhone.replace(/[^0-9]/g, '')}`}
              className="font-medium hover:underline"
              style={{ color: center.primaryColor }}
            >
              {center.contactPhone}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
