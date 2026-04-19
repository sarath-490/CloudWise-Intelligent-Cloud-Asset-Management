import { useEffect, useMemo, useState } from 'react';
import { QrCode, Link as LinkIcon, Copy, UploadCloud, ShieldCheck, DownloadCloud } from 'lucide-react';
import transferService from '../../services/transferService';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

const TransferHub = () => {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTransfers, setActiveTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const { showToast } = useToast();

  const transferUrl = useMemo(() => session?.transfer_url || '', [session]);
  const autoDeleteAt = useMemo(() => session?.auto_delete_at || session?.expires_at || null, [session]);

  const formatIst = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return date.toLocaleString();
    }
  };

  const loadMyTransfers = async () => {
    try {
      setLoadingTransfers(true);
      const res = await transferService.getMySessions();
      if (res.success) {
        setActiveTransfers(res.data?.items || []);
      }
    } catch {
      // Keep sender flow usable even if listing fails.
    } finally {
      setLoadingTransfers(false);
    }
  };

  useEffect(() => {
    loadMyTransfers();
  }, []);

  const endSession = async (sessionId) => {
    if (!sessionId) return;
    if (!window.confirm('End this transfer session? This will revoke access.')) return;

    try {
      const res = await transferService.endSession({ session_id: sessionId });
      if (!res.success) {
        showToast({ type: 'error', message: res.error || 'Failed to end transfer session.', duration: 7000 });
        return;
      }

      showToast({ type: 'success', message: 'Transfer session ended.', duration: 6000 });
      setActiveTransfers((prev) => prev.filter((item) => item.session_id !== sessionId));
      if (session?.session_id === sessionId) {
        setSession(null);
        setStep(1);
      }
    } catch (e) {
      showToast({ type: 'error', message: e?.response?.data?.error || 'Failed to end transfer session.', duration: 7000 });
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await transferService.createSession({ max_downloads: 1, expiry_minutes: 10 });
      if (!res.success) {
        setError(res.error || 'Failed to create session');
        showToast({ type: 'error', message: res.error || 'Failed to create transfer session.', duration: 7000 });
        return;
      }
      setSession(res.data);
      setStep(2);
      loadMyTransfers();
      showToast({ type: 'success', message: 'Transfer session created.', duration: 6000 });
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create session');
      showToast({ type: 'error', message: e?.response?.data?.error || 'Failed to create transfer session.', duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  const uploadAndFinalize = async () => {
    if (!file || !session?.session_id) return;

    try {
      setLoading(true);
      setError('');

      const uploadMeta = await transferService.getUploadUrl({
        session_id: session.session_id,
        filename: file.name,
        file_size: file.size,
        content_type: file.type || 'application/octet-stream',
      });

      if (!uploadMeta.success) {
        setError(uploadMeta.error || 'Could not prepare upload');
        showToast({ type: 'error', message: uploadMeta.error || 'Could not prepare upload.', duration: 7000 });
        return;
      }

      await transferService.uploadToPresignedUrl({
        uploadUrl: uploadMeta.data.upload_url,
        file,
        contentType: file.type,
        signedHeaders: uploadMeta.data.upload_headers,
      });

      const completed = await transferService.completeUpload({
        session_id: session.session_id,
        file_key: uploadMeta.data.file_key,
      });

      if (!completed.success) {
        setError(completed.error || 'Upload completion failed');
        showToast({ type: 'error', message: completed.error || 'Upload completion failed.', duration: 7000 });
        return;
      }

      setSession((prev) => ({ ...prev, ...completed.data }));
      setStep(3);
      loadMyTransfers();
      showToast({ type: 'success', message: 'Transfer ready to share.', duration: 7000 });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Upload failed');
      showToast({ type: 'error', message: e?.response?.data?.error || e?.message || 'Upload failed.', duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    showToast({ type: 'success', message: 'Link copied to clipboard.', duration: 4000 });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 px-1 sm:px-0">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <ShieldCheck className="text-sky-600 dark:text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Secure Transfer</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium mt-1">Send a file to another device with QR/link + mandatory PIN verification.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`rounded-2xl p-3 sm:p-4 border ${step >= n ? 'border-sky-300 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-700' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
          >
            <div className="text-xs font-black uppercase tracking-wider text-slate-500">Step {n}</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">{n === 1 ? 'Create session' : n === 2 ? 'Upload file' : 'Share + Receive'}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 shadow-sm space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">Create a one-time secure transfer session.</p>
            <Button variant="primary" onClick={createSession} disabled={loading}>
              {loading ? 'Creating...' : 'Create Secure Session'}
            </Button>
          </div>
        )}

        {step >= 2 && session && (
          <div className="space-y-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">PIN (share separately)</div>
            <div className="text-3xl md:text-4xl font-black tracking-widest text-amber-900 dark:text-amber-200">{session.pin}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300">Never include this PIN in messages containing the transfer link.</p>
            {autoDeleteAt && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This transfer is auto-deleted from AWS S3 at {formatIst(autoDeleteAt)} (IST).
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Choose file</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-sm"
            />
            <Button variant="primary" onClick={uploadAndFinalize} disabled={!file || loading}>
              <UploadCloud size={16} className="mr-2" />
              {loading ? 'Uploading...' : 'Upload & Generate Share Link'}
            </Button>
          </div>
        )}

        {step === 3 && session && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <div className="text-sm font-black uppercase tracking-wider text-slate-500">Transfer link</div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 break-all text-sm">
                {transferUrl}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => copyText(transferUrl)}
                  className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                >
                  <Copy size={16} className="mr-2" /> Copy Link
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => endSession(session.session_id)}
                  className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                >
                  End Session
                </Button>
                <a href={transferUrl} target="_blank" rel="noreferrer" className="inline-flex">
                  <Button
                    variant="secondary"
                    size="small"
                    className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                  >
                    <LinkIcon size={16} className="mr-2" /> Open
                  </Button>
                </a>
              </div>
              <p className="text-xs text-slate-500">Recipient opens link, enters PIN, and downloads securely.</p>
              {autoDeleteAt && (
                <p className="text-xs text-slate-500">Auto cleanup: backend expires the session and then removes file + session at {formatIst(autoDeleteAt)} (IST).</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-black uppercase tracking-wider text-slate-500">QR code</div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 inline-block">
                {session.qr_code ? (
                  <img src={session.qr_code} alt="Transfer QR" className="w-52 h-52" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                    <QrCode />
                  </div>
                )}
              </div>
              <div>
                <a href={transferUrl} className="text-sm text-sky-600 dark:text-sky-400 font-semibold inline-flex items-center gap-1">
                  <DownloadCloud size={14} /> Receiver page
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">My Active Transfers</h2>
          <Button
            variant="secondary"
            size="small"
            onClick={loadMyTransfers}
            disabled={loadingTransfers}
            className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
          >
            {loadingTransfers ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {activeTransfers.length === 0 && !loadingTransfers && (
          <p className="text-sm text-slate-500">No active transfers found.</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {activeTransfers.map((item) => (
            <div key={item.session_id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">Session</div>
              <div className="text-sm font-semibold break-all text-slate-700 dark:text-slate-200">{item.session_id}</div>
              <div className="text-xs text-slate-500">Status: {item.status}</div>
              <div className="text-xs text-slate-500">PIN: <span className="font-black tracking-widest text-amber-700 dark:text-amber-300">{item.pin}</span></div>
              <div className="text-xs text-slate-500">Expires: {formatIst(item.expires_at)} (IST)</div>
              <div className="text-xs text-slate-500">Downloads: {item.downloads_count}/{item.max_downloads}</div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => copyText(item.transfer_url)}
                  className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                >
                  <Copy size={14} className="mr-1" /> Copy Link
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => endSession(item.session_id)}
                  className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                >
                  End Session
                </Button>
                <a href={item.transfer_url} target="_blank" rel="noreferrer" className="inline-flex">
                  <Button
                    variant="secondary"
                    size="small"
                    className="bg-gradient-to-b from-white to-slate-100 border-slate-300 shadow-sm shadow-slate-200/60 hover:from-white hover:to-slate-200"
                  >
                    <LinkIcon size={14} className="mr-1" /> Open
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransferHub;
