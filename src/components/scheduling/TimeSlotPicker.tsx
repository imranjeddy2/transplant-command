import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onConfirm: () => void;
  isConfirming: boolean;
  primaryColor: string;
}

interface DateGroup {
  date: Date;
  dateKey: string;
  displayDate: string;
  displayDay: string;
  slots: TimeSlot[];
}

function groupSlotsByDate(slots: TimeSlot[]): DateGroup[] {
  const groups: Record<string, DateGroup> = {};

  slots.forEach((slot) => {
    const date = new Date(slot.datetime);
    const dateKey = date.toISOString().split('T')[0];

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date,
        dateKey,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        displayDay: date.toLocaleDateString('en-US', { weekday: 'short' }),
        slots: [],
      };
    }

    groups[dateKey].slots.push(slot);
  });

  return Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
}

function formatTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  onConfirm,
  isConfirming,
  primaryColor,
}: TimeSlotPickerProps) {
  const dateGroups = useMemo(() => groupSlotsByDate(slots), [slots]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const selectedDateGroup = dateGroups[selectedDateIndex];
  const availableSlots = selectedDateGroup?.slots.filter((s) => s.available) || [];

  const canGoPrev = selectedDateIndex > 0;
  const canGoNext = selectedDateIndex < dateGroups.length - 1;

  const handlePrevDate = () => {
    if (canGoPrev) setSelectedDateIndex(selectedDateIndex - 1);
  };

  const handleNextDate = () => {
    if (canGoNext) setSelectedDateIndex(selectedDateIndex + 1);
  };

  const selectedSlotFormatted = selectedSlot
    ? `${new Date(selectedSlot.datetime).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })} at ${formatTime(selectedSlot.datetime)}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
        <h3 className="text-lg font-semibold text-gray-900">
          Select a Date & Time
        </h3>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevDate}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max px-2">
            {dateGroups.map((group, index) => {
              const isSelected = index === selectedDateIndex;
              const hasAvailable = group.slots.some((s) => s.available);

              return (
                <button
                  key={group.dateKey}
                  onClick={() => setSelectedDateIndex(index)}
                  disabled={!hasAvailable}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl transition-all min-w-[72px] ${
                    isSelected
                      ? 'text-white shadow-md'
                      : hasAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  style={isSelected ? { backgroundColor: primaryColor } : undefined}
                >
                  <span className="text-xs font-medium">{group.displayDay}</span>
                  <span className="text-lg font-semibold">{group.displayDate}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleNextDate}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Time Slots Grid */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-3">
          Available times for{' '}
          <span className="font-medium">
            {selectedDateGroup?.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </p>

        {availableSlots.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No available times on this date. Please select another date.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  style={isSelected ? { backgroundColor: primaryColor } : undefined}
                >
                  {formatTime(slot.datetime)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Summary & Confirm Button */}
      <div className="space-y-4">
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4"
          >
            <p className="text-sm text-purple-800">
              <span className="font-medium">Selected:</span> {selectedSlotFormatted}
            </p>
          </motion.div>
        )}

        <button
          onClick={onConfirm}
          disabled={!selectedSlot || isConfirming}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {isConfirming ? 'Scheduling...' : 'Schedule My Call'}
        </button>
      </div>
    </motion.div>
  );
}
