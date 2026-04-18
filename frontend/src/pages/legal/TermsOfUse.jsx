import { FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center">
            <Shield className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Terms of Use</h1>
            <p className="text-sm text-muted-foreground mt-2">Last updated: April 18, 2026</p>
          </div>
        </div>

        <div className="space-y-10 text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Acceptance</h2>
            <p className="text-sm leading-relaxed">
              By using CloudWise, you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Your Responsibilities</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-2">
              <li>Keep your account credentials secure.</li>
              <li>Upload only content you have rights to store and share.</li>
              <li>Do not use the service for illegal or abusive activity.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Service Availability</h2>
            <p className="text-sm leading-relaxed">
              We strive for high availability, but downtime may occur for maintenance or unexpected issues. We may
              update features and limits to keep the platform secure and performant.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Termination</h2>
            <p className="text-sm leading-relaxed">
              We may suspend or terminate accounts that violate these terms or pose security risks. You can
              close your account at any time.
            </p>
          </section>

         
        </div>

        <div className="mt-12 flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <FileText size={16} />
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
