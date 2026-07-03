import { useState } from 'react';
import {
  Settings, Globe, Mail, Bell, Shield, Trash2, Key,
  Save, AlertTriangle, ToggleLeft, ToggleRight, ChevronRight,
  Users, CreditCard, Lock, RefreshCw, Database, Sliders
} from 'lucide-react';

/* ── Reusable field components ── */
function FieldGroup({ label, hint, children }) {
  return (
    <div className="grid md:grid-cols-3 gap-4 py-6 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="md:col-span-2 space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, id, type = 'text', defaultValue, placeholder }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>}
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
      />
    </div>
  );
}

function Toggle({ label, description, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
    >
      <div className="text-left">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {on
        ? <ToggleRight className="w-6 h-6 text-teal-500 flex-shrink-0" />
        : <ToggleLeft  className="w-6 h-6 text-slate-300 flex-shrink-0" />
      }
    </button>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        <h2 className="text-base font-black text-slate-900 tracking-tight">{title}</h2>
      </div>
      <div className="px-8 py-2">{children}</div>
    </div>
  );
}

const membershipTiers = [
  { name: 'Student',      price: '$25 / yr',  members: 142, color: 'bg-blue-50 text-blue-600' },
  { name: 'Professional', price: '$75 / yr',  members: 289, color: 'bg-teal-50 text-teal-600' },
  { name: 'Corporate',    price: '$250 / yr', members: 111, color: 'bg-amber-50 text-amber-600' },
];

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col">

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Settings className="w-4 h-4" />
          <span className="mx-2">/</span>
          <span className="text-slate-900">Settings</span>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg ${
            saved
              ? 'bg-green-500 text-white shadow-green-500/20'
              : 'btn-teal text-white shadow-teal-500/20'
          }`}
        >
          {saved ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saved!</>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Save Changes</>
          )}
        </button>
      </header>

      <div className="p-8 space-y-8 animate-fade-in max-w-5xl w-full mx-auto">

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your GST site, membership tiers, notifications, and system security.</p>
        </div>

        {/* General / Site Info */}
        <SectionCard icon={Globe} title="General & Site Info">
          <FieldGroup label="Organization Name" hint="Displayed across the public site and member portal.">
            <Input id="org-name" defaultValue="Geosciences Society of Tulsa" />
          </FieldGroup>
          <FieldGroup label="Contact Email" hint="Used for member correspondence and system notifications.">
            <Input id="contact-email" type="email" defaultValue="contact@gstulsa.org" />
          </FieldGroup>
          <FieldGroup label="Site URL" hint="Canonical URL for SEO and email links.">
            <Input id="site-url" defaultValue="https://gstulsa.org" />
          </FieldGroup>
          <FieldGroup label="Admin Notes" hint="Internal notes — not visible to members.">
            <textarea
              rows={3}
              defaultValue="Active fiscal year: 2025. Board election scheduled for Jan 2026."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
            />
          </FieldGroup>
        </SectionCard>

        {/* Membership Tiers */}
        <SectionCard icon={CreditCard} title="Membership Tiers">
          <div className="py-4 space-y-3">
            {membershipTiers.map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-teal-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${tier.color}`}>
                    {tier.name}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{tier.price}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tier.members} members</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
                  Edit <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> Add New Tier
            </button>
          </div>
        </SectionCard>

        {/* Event Defaults */}
        <SectionCard icon={Sliders} title="Event Defaults">
          <FieldGroup label="Default Capacity" hint="Pre-fill new events with this attendee limit.">
            <Input id="default-capacity" type="number" defaultValue="200" />
          </FieldGroup>
          <FieldGroup label="Registration Cut-off" hint="Hours before event start time when registration closes.">
            <Input id="reg-cutoff" type="number" defaultValue="24" />
          </FieldGroup>
          <FieldGroup label="Auto-close Registration" hint="Automatically close registration when capacity is reached.">
            <Toggle label="Auto-close on full capacity" defaultOn={true} />
          </FieldGroup>
          <FieldGroup label="Waitlist" hint="Allow members to join a waitlist when the event is full.">
            <Toggle label="Enable event waitlist" defaultOn={false} />
          </FieldGroup>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications">
          <div className="py-4 space-y-3">
            <Toggle label="New membership application" description="Email admin when a new member applies." defaultOn={true} />
            <Toggle label="Event registration" description="Notify admin on each new event sign-up." defaultOn={false} />
            <Toggle label="Payment received" description="Send confirmation when dues payment clears." defaultOn={true} />
            <Toggle label="Capacity alerts" description="Alert when an event reaches 80% capacity." defaultOn={true} />
            <Toggle label="Weekly digest" description="Receive a weekly summary of site activity." defaultOn={false} />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={Shield} title="Security & Access">
          <FieldGroup label="Two-Factor Auth" hint="Require 2FA for all admin accounts.">
            <Toggle label="Enforce 2FA for admins" defaultOn={false} />
          </FieldGroup>
          <FieldGroup label="Session Timeout" hint="Automatically log out admins after inactivity.">
            <div className="flex items-center gap-3">
              <Input id="session-timeout" type="number" defaultValue="60" />
              <span className="text-sm text-slate-400 font-bold whitespace-nowrap">minutes</span>
            </div>
          </FieldGroup>
          <FieldGroup label="Password Policy" hint="Minimum requirements for member passwords.">
            <Toggle label="Require uppercase and numbers" defaultOn={true} />
            <Toggle label="Minimum 12 characters" defaultOn={false} />
          </FieldGroup>
          <FieldGroup label="Change Admin Password" hint="Update the current admin account credentials.">
            <Input id="current-pass" type="password" placeholder="Current password" />
            <Input id="new-pass"     type="password" placeholder="New password" />
            <Input id="confirm-pass" type="password" placeholder="Confirm new password" />
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-all mt-1">
              <Key className="w-3.5 h-3.5" /> Update Password
            </button>
          </FieldGroup>
        </SectionCard>

        {/* API / Integrations */}
        <SectionCard icon={Database} title="API & Integrations">
          <FieldGroup label="API Key" hint="Use this key to integrate with external services.">
            <div className="flex gap-3">
              <input
                type="password"
                defaultValue="gst_sk_live_xxxxxxxxxxxxxxxx"
                readOnly
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 focus:outline-none"
              />
              <button className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Rotate
              </button>
            </div>
          </FieldGroup>
          <FieldGroup label="Stripe Integration" hint="Payment gateway for membership dues and event fees.">
            <Toggle label="Live mode (production)" defaultOn={true} />
            <Toggle label="Send receipts automatically" defaultOn={true} />
          </FieldGroup>
          <FieldGroup label="Email Provider" hint="SMTP or transactional email service.">
            <Input id="smtp-host" placeholder="smtp.sendgrid.net" defaultValue="smtp.sendgrid.net" />
            <div className="grid grid-cols-2 gap-3">
              <Input id="smtp-port" placeholder="587" defaultValue="587" />
              <Input id="smtp-user" placeholder="apikey" defaultValue="apikey" />
            </div>
          </FieldGroup>
        </SectionCard>

        {/* Danger Zone */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] overflow-hidden">
          <div className="px-8 py-5 border-b border-rose-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-base font-black text-rose-700 tracking-tight">Danger Zone</h2>
          </div>
          <div className="px-8 py-6 space-y-4">
            {[
              {
                title: 'Purge Inactive Members',
                desc: "Permanently remove members who haven't renewed in 2+ years.",
                label: 'Purge', Icon: Trash2,
              },
              {
                title: 'Reset All Settings',
                desc: 'Restore all settings to factory defaults. This cannot be undone.',
                label: 'Reset', Icon: RefreshCw,
              },
              {
                title: 'Lock Site (Maintenance Mode)',
                desc: 'Take the public site offline temporarily for maintenance.',
                label: 'Enable', Icon: Lock,
              },
            ].map(({ title, desc, label, Icon }) => (
              <div
                key={title}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-rose-200 rounded-2xl"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2 border-2 border-rose-300 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
