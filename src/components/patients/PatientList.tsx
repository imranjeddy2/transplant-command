import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, Users } from 'lucide-react';
import { patients, getRiskAssessmentByPatientId } from '@/data/mockData';
import type { PatientStatus, RiskLevel } from '@/types';
import { RiskBadge } from '@/components/risk';
import { getPatientState, type PatientStateResponse } from '@/services/callService';

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
  const [serverStates, setServerStates] = useState<Record<string, PatientStateResponse>>({});

  useEffect(() => {
    Promise.all(
      patients.map((p) =>
        getPatientState(p.id).then((state) => (state ? { id: p.id, state } : null))
      )
    ).then((results) => {
      const stateMap: Record<string, PatientStateResponse> = {};
      results.forEach((r) => {
        if (r) stateMap[r.id] = r.state;
      });
      setServerStates(stateMap);
    });
  }, []);

  const filteredPatients = patients
    .filter((p) => {
      if (filter === 'all') return true;
      const effectiveStatus = (serverStates[p.id]?.status as PatientStatus) ?? p.status;
      return effectiveStatus === filter;
    })
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
        </div>
        <p className="text-muted-foreground mt-1">View and manage transplant referral patients</p>
      </motion.div>

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
                Risk
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
              const serverState = serverStates[patient.id];
              const effectiveStatus = (serverState?.status as PatientStatus) ?? patient.status;
              const status = statusConfig[effectiveStatus] ?? statusConfig[patient.status];
              const riskAssessment = getRiskAssessmentByPatientId(patient.id);
              const serverRiskLevel = serverState?.riskAssessment?.level as RiskLevel | undefined;
              const effectiveRisk = serverRiskLevel || riskAssessment?.overrideLevel || riskAssessment?.calculatedLevel;

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
                    {effectiveRisk ? (
                      <RiskBadge
                        level={effectiveRisk}
                        size="sm"
                        showLabel={false}
                        isOverridden={!!riskAssessment?.overrideLevel}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No patients found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No patients match "${searchQuery}". Try adjusting your search.`
                : 'No patients match the selected filter. Try selecting "All Patients".'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>
    </div>
  );
}
