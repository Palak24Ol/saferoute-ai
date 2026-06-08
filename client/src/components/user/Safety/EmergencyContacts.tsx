import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

interface Contact {
    _id: string;
    name: string;
    phone: string;
    email: string;
    relationship: string;
}

const PersonIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const GroupIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);

const EmergencyContacts: React.FC = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);

    const [contacts, setContacts]   = useState<Contact[]>([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm]           = useState({ name: "", phone: "", email: "", relationship: "Friend" });
    const [saving, setSaving]       = useState(false);

    const fetchContacts = async () => {
        try {
            const res = await axiosUser.get("/safety/contacts");
            setContacts(res.data.contacts);
        } catch { toast.error("Failed to load contacts"); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchContacts(); }, []);

    const handleAdd = async () => {
        if (!form.name || !form.phone || !form.email) { toast.error("Name, phone and email are required"); return; }
        setSaving(true);
        try {
            await axiosUser.post("/safety/contacts", form);
            toast.success("Contact added!");
            setShowForm(false);
            setForm({ name: "", phone: "", email: "", relationship: "Friend" });
            fetchContacts();
        } catch (err: any) { toast.error(err.response?.data?.message || "Failed to add contact"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await axiosUser.delete(`/safety/contacts/${id}`);
            toast.success("Contact removed");
            setContacts(prev => prev.filter(c => c._id !== id));
        } catch { toast.error("Failed to delete contact"); }
    };

    return (
        <>
            <style>{`
                .ec-card {
                    background: white;
                    border: 1px solid #ede9fe;
                    border-radius: 16px;
                    padding: 18px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    box-shadow: 0 1px 8px rgba(99,102,241,0.06);
                    transition: box-shadow 0.2s;
                }
                .ec-card:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.12); }

                .ec-icon-wrap {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    background: #ede9fe;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    margin-right: 14px;
                }

                .ec-contact-name {
                    font-size: 15px; font-weight: 600; color: #1f2937;
                }
                .ec-contact-sub {
                    font-size: 13px; color: #6b7280; margin-top: 2px;
                }

                .ec-action-btn {
                    background: none; border: none; cursor: pointer;
                    padding: 7px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .ec-action-btn:hover { background: #f3f4f6; }

                .ec-add-btn {
                    width: 100%;
                    padding: 16px;
                    border: 2px dashed #c4b5fd;
                    border-radius: 16px;
                    background: #faf5ff;
                    color: #7c3aed;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s;
                    margin-top: 4px;
                }
                .ec-add-btn:hover { background: #f3e8ff; border-color: #7c3aed; }

                .ec-form-card {
                    background: #faf5ff;
                    border: 1px solid #ede9fe;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 16px;
                }
                .ec-input {
                    width: 100%;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: #111827;
                    background: white;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .ec-input:focus { border-color: #7c3aed; }

                .ec-save-btn {
                    background: #e91e8c;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .ec-save-btn:hover { background: #c7176f; }
                .ec-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

                .ec-cancel-btn {
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .ec-cancel-btn:hover { background: #e5e7eb; }
            `}</style>

            {/* Add form */}
            {showForm && (
                <div className="ec-form-card">
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 16 }}>New Emergency Contact</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input className="ec-input" style={{ gridColumn: '1 / -1' }} placeholder="Full Name *"       value={form.name}         onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input className="ec-input" placeholder="Phone Number *"  value={form.phone}        onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <input className="ec-input" placeholder="Email Address *" value={form.email}        onChange={e => setForm({ ...form, email: e.target.value })} />
                        <select className="ec-input" style={{ gridColumn: '1 / -1' }} value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })}>
                            <option>Friend</option><option>Family</option><option>Parent</option>
                            <option>Sibling</option><option>Partner</option><option>Colleague</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button className="ec-save-btn" onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Save Contact"}</button>
                        <button className="ec-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Contact list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading contacts...</div>
            ) : contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', background: '#faf5ff', borderRadius: 20, border: '2px dashed #c4b5fd', marginBottom: 16 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🆘</div>
                    <p style={{ fontWeight: 600, color: '#374151', fontSize: 16 }}>No emergency contacts added yet</p>
                    <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>Add contacts who will be alerted during an SOS</p>
                </div>
            ) : (
                <div>
                    {contacts.map(contact => (
                        <div key={contact._id} className="ec-card">
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <div className="ec-icon-wrap">
                                    {contact.relationship === 'Family' || contact.relationship === 'Sibling' || contact.relationship === 'Parent'
                                        ? <GroupIcon /> : <PersonIcon />}
                                </div>
                                <div>
                                    <div className="ec-contact-name">{contact.name} — +91 {contact.phone}</div>
                                    <div className="ec-contact-sub">{contact.relationship} · {contact.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button className="ec-action-btn" title="Edit"><EditIcon /></button>
                                <button className="ec-action-btn" title="Remove" onClick={() => handleDelete(contact._id)}><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8, marginBottom: 16 }}>
                        {contacts.length}/5 contacts added
                    </p>
                </div>
            )}

            {contacts.length < 5 && (
                <button className="ec-add-btn" onClick={() => setShowForm(!showForm)}>
                    + Add New Contact
                </button>
            )}
        </>
    );
};

export default EmergencyContacts;