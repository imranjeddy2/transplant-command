import { motion } from 'framer-motion';

interface PatientGreetingProps {
  firstName: string;
  welcomeMessage?: string;
}

export function PatientGreeting({ firstName, welcomeMessage }: PatientGreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Hi {firstName},
      </h2>
      {welcomeMessage && (
        <p className="text-gray-600 text-lg">
          {welcomeMessage}
        </p>
      )}
    </motion.div>
  );
}
