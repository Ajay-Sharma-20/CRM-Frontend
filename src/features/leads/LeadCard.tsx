import React from 'react';
import { Lead } from '../../types';
import {
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onUpdate: (lead: Lead) => void;
  onViewDetails?: (lead: Lead) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (leadId: number) => void;
}

// Format relative time (e.g., '4 MONTHS AGO', '2 HOURS AGO', 'TODAY')
function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths >= 1) {
    return `${diffMonths} ${diffMonths === 1 ? 'MONTH' : 'MONTHS'} AGO`;
  }
  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? 'DAY' : 'DAYS'} AGO`;
  }
  if (diffHours >= 1) {
    return `${diffHours} ${diffHours === 1 ? 'HOUR' : 'HOURS'} AGO`;
  }
  if (diffMin >= 1) {
    return `${diffMin} MINS AGO`;
  }
  return 'JUST NOW';
}

// Clean phone for tel: and WhatsApp
function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

// Check if string is a URL / link
function isUrl(str: any): boolean {
  if (typeof str !== 'string') return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('wa.me/') ||
    s.startsWith('www.') ||
    s.includes('.com/') ||
    s.includes('.in/') ||
    s.includes('.pdf') ||
    s.includes('drive.google.com') ||
    s.includes('docs.google.com')
  );
}

// Normalize URL with protocol
function normalizeUrl(url: string): string {
  const s = url.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('wa.me/')) return `https://${s}`;
  return `https://${s}`;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onCall,
  onWhatsApp,
  onUpdate,
  onViewDetails,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const cleanPhone = cleanPhoneNumber(lead.phone);
  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead';
  const companyOrBusiness = lead.business?.name || lead.company || 'Direct Client';

  // Extract city/location from custom fields if available
  const customFields = lead.custom_fields || {};
  const city =
    customFields.city ||
    customFields.City ||
    customFields.location ||
    customFields.Location ||
    lead.company ||
    '';

  // Status badge style configuration (Light theme with vibrant status dots)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return {
          label: 'Fresh',
          bg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
          dot: 'bg-cyan-500',
        };
      case 'Interested':
        return {
          label: 'Interested',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
        };
      case 'Follow-up':
        return {
          label: 'Follow-up',
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          dot: 'bg-purple-600',
        };
      case 'Contacted':
        return {
          label: 'Contacted',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-600',
        };
      case 'Converted':
        return {
          label: 'Converted',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-600',
        };
      case 'Lost':
      case 'Invalid':
        return {
          label: status,
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-stone-100 border-stone-200 text-stone-700',
          dot: 'bg-stone-400',
        };
    }
  };

  const statusConfig = getStatusBadge(lead.status);

  // Collect dynamic custom attributes from business schema or lead.custom_fields
  const customAttributes: Array<{ key: string; label: string; value: any; isLink: boolean }> = [];
  if (lead.business?.custom_columns && lead.business.custom_columns.length > 0) {
    lead.business.custom_columns.forEach((col) => {
      const val = customFields[col.key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        customAttributes.push({
          key: col.key,
          label: col.label,
          value: val,
          isLink: isUrl(val),
        });
      }
    });
  } else {
    // Fallback: iterate raw custom_fields keys
    Object.entries(customFields).forEach(([key, val]) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        customAttributes.push({
          key,
          label,
          value: val,
          isLink: isUrl(val),
        });
      }
    });
  }

  return (
    <div
      className={`bg-[#FBFAF9] text-zinc-900 border rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden group ${
        isSelected
          ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
          : 'border-[#E9E6E2] hover:border-purple-300'
      }`}
    >
      {/* Subtle purple gradient background highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Selection Radio Button, User Avatar, Name, Company/City & Status Pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {selectable && onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(lead.id);
              }}
              title={isSelected ? 'Deselect lead' : 'Select lead'}
              className={`w-5 h-5 mt-2 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'border-purple-600 bg-purple-600 ring-2 ring-purple-200'
                  : 'border-zinc-300 hover:border-purple-500 bg-white'
              }`}
            >
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          )}

          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 shadow-xs">
            <User className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            {/* Lead Name */}
            <h3
              onClick={() => onViewDetails && onViewDetails(lead)}
              className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight truncate cursor-pointer hover:text-purple-700 transition-colors"
            >
              {fullName}
            </h3>

            {/* Sub-line: Business/Company & City */}
            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-zinc-700 uppercase tracking-wide text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                {companyOrBusiness}
              </span>
              {city && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500 uppercase tracking-wide">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Pill on top right */}
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </span>
      </div>

      {/* Second Row: Phone number & Relative Time */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-[#EBE8E3]">
        <div className="flex items-center gap-1.5 font-mono text-zinc-700 font-semibold">
          <Phone className="w-3.5 h-3.5 text-zinc-400" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{formatRelativeTime(lead.created_at)}</span>
        </div>
      </div>

      {/* Dynamic Business Attributes & Link Buttons */}
      {customAttributes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {customAttributes.map((attr) => {
            if (attr.isLink) {
              return (
                <a
                  key={attr.key}
                  href={normalizeUrl(attr.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold transition-colors shadow-2xs"
                  title={`${attr.label}: ${attr.value}`}
                >
                  <ExternalLink className="w-3 h-3 text-purple-600" />
                  <span>{attr.label}</span>
                </a>
              );
            }

            return (
              <div
                key={attr.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-zinc-700 text-[11px] border border-[#E9E6E2] shadow-2xs"
              >
                <span className="text-zinc-500 font-medium">{attr.label}:</span>
                <span className="font-semibold text-zinc-900">{String(attr.value)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Estimated Value if present */}
      {lead.estimated_value && Number(lead.estimated_value) > 0 && (
        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
          <span>Deal Value:</span>
          <span className="font-bold text-zinc-900">
            ₹{Number(lead.estimated_value).toLocaleString()}
          </span>
        </div>
      )}

      {/* Bottom Action Buttons: Call, WhatsApp, and Update */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EBE8E3] mt-1">
        {/* Call Button */}
        <button
          type="button"
          onClick={() => onCall(lead)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold border border-[#DCD8D2] shadow-2xs transition-all active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5 text-purple-600" />
          <span>Call</span>
        </button>

        {/* WhatsApp Button */}
        <button
          type="button"
          onClick={() => onWhatsApp(lead)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white hover:bg-emerald-50/60 text-emerald-700 text-xs font-semibold border border-[#DCD8D2] shadow-2xs transition-all active:scale-[0.98]"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </button>

        {/* Update Button */}
        <button
          type="button"
          onClick={() => onUpdate(lead)}
          className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Update</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
