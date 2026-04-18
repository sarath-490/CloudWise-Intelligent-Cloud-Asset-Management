import { ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
            <ShieldCheck className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-2">Last updated: April 18, 2026</p>
          </div>
        </div>

        <div className="space-y-10 text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Summary</h2>
            <p className="text-sm leading-relaxed">
              We collect only what we need to provide secure cloud storage, AI-powered organization, and transfer services.
              We do not sell personal data. You control your content and can delete it at any time.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Information We Collect</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-2">
              <li>Account data: name, email, and authentication details.</li>
              <li>Uploaded content and metadata for storage and AI classification.</li>
              <li>Usage data such as device, IP address, and session activity for security.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">How We Use Data</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-2">
              <li>Provide and secure the storage platform.</li>
              <li>Deliver AI categorization and search features.</li>
              <li>Operate secure file transfers and audit events.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-foreground mb-3">Your Choices</h2>
            <p className="text-sm leading-relaxed">
              You can update your profile, manage notifications, and delete content at any time. If you have questions,
              contact support for data access or removal requests.
            </p>
          </section>
        </div>

        <div className="mt-12 flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <FileText size={16} />
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
