import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LockKeyhole, Download, Clock3 } from 'lucide-react';
import transferService from '../../services/transferService';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

const TransferReceive = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const { showToast } = useToast();

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const res = await transferService.getSession(sessionId);
        if (!res.success) {
          setError(res.error || 'Session not available');
          showToast({ type: 'error', message: res.error || 'Session not available.', duration: 7000 });
          return;
        }
        setSession(res.data);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to fetch transfer session');
        showToast({ type: 'error', message: e?.response?.data?.error || 'Failed to fetch transfer session.', duration: 7000 });
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const verifyPin = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await transferService.verifyPin({ session_id: sessionId, pin });
      if (!res.success) {
        setError(res.error || 'PIN verification failed');
        showToast({ type: 'error', message: res.error || 'PIN verification failed.', duration: 7000 });
        return;
      }
      setVerificationToken(res.data.verification_token);
      setStatus('verified');
      showToast({ type: 'success', message: 'PIN verified. You can download now.', duration: 6000 });
    } catch (e) {
      setError(e?.response?.data?.error || 'PIN verification failed');
      showToast({ type: 'error', message: e?.response?.data?.error || 'PIN verification failed.', duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    try {
      setLoading(true);
      setError('');
      await transferService.downloadFileStream({
        session_id: sessionId,
        verification_token: verificationToken,
        fallback_file_name: session?.file_name,
      });
      setStatus('downloaded');
      showToast({ type: 'success', message: 'Download started.', duration: 6000 });
    } catch (e) {
      setError(e?.message || e?.response?.data?.error || 'Failed to download file');
      showToast({ type: 'error', message: e?.message || e?.response?.data?.error || 'Failed to download file.', duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 mx-auto flex items-center justify-center">
            <LockKeyhole className="text-sky-600 dark:text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Secure File Transfer</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Session: {sessionId}</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">{error}</div>}

        {loading && <div className="text-sm text-slate-500">Loading...</div>}

        {session && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <div>Status: <span className="font-bold">{session.status}</span></div>
            <div className="inline-flex items-center gap-1"><Clock3 size={14} /> Expires: {new Date(session.expires_at).toLocaleString()}</div>
            <div>Auto-delete from cloud storage: {new Date(session.auto_delete_at || session.expires_at).toLocaleString()}</div>
            <div>Downloads: {session.downloads_count}/{session.max_downloads}</div>
          </div>
        )}

        {status !== 'verified' && status !== 'downloaded' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Enter PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              placeholder="Enter transfer PIN"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <Button variant="primary" onClick={verifyPin} disabled={!pin || loading}>
              Verify PIN
            </Button>
          </div>
        )}

        {status === 'verified' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold">PIN verified. You can download now.</div>
            <Button variant="primary" onClick={downloadFile} disabled={loading}>
              <Download size={16} className="mr-2" /> Download File
            </Button>
          </div>
        )}

        {status === 'downloaded' && (
          <div className="p-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-sm font-semibold">Download started securely. This link may expire quickly.</div>
        )}
      </div>
    </div>
  );
};

export default TransferReceive;
