import React, { useState, useEffect } from 'react';
import { AdminNav } from '../../components/AdminNav';
import { getSupabaseClient } from '../../lib/supabase';
import { Users, UserPlus, Mail, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Affiliate {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export function Affiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Failed to initialize Supabase client');

      // Load affiliates
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'affiliate'])
        .order('created_at', { ascending: false });

      if (affiliatesError) throw affiliatesError;

      // Load pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('affiliate_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      setAffiliates(affiliatesData || []);
      setInvites(invitesData || []);
    } catch (err) {
      console.error('Error loading affiliates:', err);
      setError('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || isInviting) return;

    try {
      setIsInviting(true);
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Failed to initialize Supabase client');

      // Generate invite token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invite
      const { error: inviteError } = await supabase
        .from('affiliate_invites')
        .insert({
          email: newEmail.trim(),
          token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      setSuccess('Invite sent successfully');
      setNewEmail('');
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending invite:', err);
      setError('Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    try {
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Failed to initialize Supabase client');

      // Update invite with new expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: updateError } = await supabase
        .from('affiliate_invites')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      setSuccess('Invite resent successfully');
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error resending invite:', err);
      setError('Failed to resend invite');
    }
  };

  const handleCancelInvite = async (invite: Invite) => {
    if (!confirm('Are you sure you want to cancel this invite?')) return;

    try {
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Failed to initialize Supabase client');

      const { error: deleteError } = await supabase
        .from('affiliate_invites')
        .delete()
        .eq('id', invite.id);

      if (deleteError) throw deleteError;

      setSuccess('Invite cancelled successfully');
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error cancelling invite:', err);
      setError('Failed to cancel invite');
    }
  };

  const handleRemoveAffiliate = async (affiliate: Affiliate) => {
    if (!confirm('Are you sure you want to remove this affiliate?')) return;

    try {
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Failed to initialize Supabase client');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', affiliate.id);

      if (updateError) throw updateError;

      setSuccess('Affiliate removed successfully');
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing affiliate:', err);
      setError('Failed to remove affiliate');
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://jpvvgmvvdfsiruthfkhb.supabase.co/storage/v1/object/public/images/Website%20Design%20Images/LightShowVault%20Darker%20Background.svg?t=2025-01-21T15%3A48%3A42.034Z')] bg-cover bg-center bg-no-repeat">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            Affiliate Management
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-4 bg-green-900/30 border border-green-500 rounded-lg flex items-center gap-3 text-green-200"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}

        {/* Invite Form */}
        <div className="bg-[#260000] rounded-lg p-6 mb-8 border border-yellow-400/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-400" />
            Invite New Affiliate
          </h2>

          <form onSubmit={handleInvite} className="flex gap-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
              required
            />
            <button
              type="submit"
              disabled={isInviting || !newEmail.trim()}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invite
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-[#260000] rounded-lg p-6 mb-8 border border-yellow-400/20">
            <h2 className="text-lg font-semibold text-white mb-4">Pending Invites</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-400/20">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Sent</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Expires</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite.id} className="border-b border-yellow-400/10">
                      <td className="px-6 py-4 text-white">{invite.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400">
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(invite.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResendInvite(invite)}
                            className="text-yellow-400 hover:text-yellow-300"
                            title="Resend invite"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelInvite(invite)}
                            className="text-red-400 hover:text-red-300"
                            title="Cancel invite"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Affiliates List */}
        <div className="bg-[#260000] rounded-lg p-6 border border-yellow-400/20">
          <h2 className="text-lg font-semibold text-white mb-4">Current Affiliates</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            </div>
          ) : affiliates.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No affiliates yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-400/20">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-yellow-400/10">
                      <td className="px-6 py-4 text-white">{affiliate.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400">
                          {affiliate.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(affiliate.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveAffiliate(affiliate)}
                          className="text-red-400 hover:text-red-300"
                          title="Remove affiliate"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}