import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0A1024] border border-[#4F7CFF]/40 p-5 sm:p-10 shadow-2xl my-8 space-y-6 glow-blue">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-[#AAB2C8] hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <div className="p-3 rounded-xl bg-[#4F7CFF]/20 text-[#5B8CFF] border border-[#4F7CFF]/30">
            {isPrivacy ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white">
              {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
            <span className="text-xs text-[#AAB2C8] font-mono">
              WINGS Marketing® • Effective 2026
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#AAB2C8] leading-relaxed max-h-96 overflow-y-auto pr-2 scrollbar-thin">
          {isPrivacy ? (
            <>
              <p>
                <strong className="text-white">1. Data Collection & Usage:</strong> WINGS Marketing respects your brand privacy. Information collected through our contact forms (Name, Email, Phone, Website) is strictly used for performance consultations and ROI strategy audits.
              </p>
              <p>
                <strong className="text-white">2. First-Party Analytics:</strong> We utilize first-party tracking pixels and server-side Conversion API (CAPI) protocols to optimize media campaigns on behalf of our client partners. We never sell or share client data with unauthorized third parties.
              </p>
              <p>
                <strong className="text-white">3. Confidentiality:</strong> All store metrics, campaign performance figures, and proprietary sales data shared during partnerships remain strictly confidential under non-disclosure standards.
              </p>
              <p>
                <strong className="text-white">4. Direct Inquiries:</strong> For any privacy inquiries, reach us at retail@wings-marketing.com or +91 92306 28052 (Kolkata, WB, India).
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-white">1. Performance Assurance:</strong> Projections made on the WINGS Marketing platform (including the ROI estimator) are based on historical client portfolio averages and campaign benchmarks. Actual store performance varies based on product quality, inventory availability, and market demand.
              </p>
              <p>
                <strong className="text-white">2. Intellectual Property:</strong> All brand assets, campaign creative frameworks, and custom software architectures developed by WINGS Marketing® are protected under trademark and copyright regulations.
              </p>
              <p>
                <strong className="text-white">3. Partnership Agreements:</strong> Official client engagements are governed by bespoke Master Service Agreements (MSA) outlining deliverables, media spend ownership, and revenue share terms.
              </p>
              <p>
                <strong className="text-white">4. Jurisdiction:</strong> WINGS Marketing operates out of Kolkata, West Bengal, India. All legal terms are interpreted in accordance with applicable Indian trade regulations.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#4F7CFF] hover:bg-[#5B8CFF] text-white font-semibold text-xs cursor-pointer transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
