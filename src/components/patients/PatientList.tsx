import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { patients } from '@/data/mockData';
import type { PatientStatus } from '@/types';

const statusConfig: Record<PatientStatus, { label: string; color: string; bgColor: string }> = {
  referral_received: {
    label: 'Referral Received',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  evaluation_scheduled: {
    label: 'Evaluation Scheduled',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  evaluation_complete: {
    label: 'Evaluation Complete',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  waitlisted: {
    label: 'Waitlisted',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  transplanted: {
    label: 'Transplanted',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
};

type FilterOption = 'all' | PatientStatus;

export function PatientList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients
    .filter((p) => (filter === 'all' ? true : p.status === filter))
    .filter((p) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query)
      );
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-1">View and manage transplant referral patients</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Status:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground border-0 focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Patients</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg text-sm bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary w-64"
            />
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Patient
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MRN</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Referral Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Referring Provider
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => {
              const status = statusConfig[patient.status];

              return (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">
                      {patient.firstName} {patient.lastName}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground font-mono">{patient.mrn}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(patient.referralDate)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {patient.referringProvider?.name || '—'}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No patients found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>
    </div>
  );
}
