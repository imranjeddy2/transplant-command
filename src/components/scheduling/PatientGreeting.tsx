interface PatientGreetingProps {
  firstName: string;
  welcomeMessage?: string;
}

export function PatientGreeting({ firstName, welcomeMessage }: PatientGreetingProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Hi {firstName},
      </h2>
      {welcomeMessage && (
        <p className="text-gray-600 text-lg">
          {welcomeMessage}
        </p>
      )}
    </div>
  );
}
