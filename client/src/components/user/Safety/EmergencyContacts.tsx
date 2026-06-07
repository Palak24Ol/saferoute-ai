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

const EmergencyContacts: React.FC = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", email: "", relationship: "Friend" });
    const [saving, setSaving] = useState(false);

    const fetchContacts = async () => {
        try {
            const res = await axiosUser.get("/safety/contacts");
            setContacts(res.data.contacts);
        } catch {
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContacts(); }, []);

    const handleAdd = async () => {
        if (!form.name || !form.phone || !form.email) {
            toast.error("Name, phone and email are required");
            return;
        }
        setSaving(true);
        try {
            await axiosUser.post("/safety/contacts", form);
            toast.success("Contact added!");
            setShowForm(false);
            setForm({ name: "", phone: "", email: "", relationship: "Friend" });
            fetchContacts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add contact");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axiosUser.delete(`/safety/contacts/${id}`);
            toast.success("Contact removed");
            setContacts(prev => prev.filter(c => c._id !== id));
        } catch {
            toast.error("Failed to delete contact");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
                    <p className="text-sm text-gray-500 mt-1">These contacts will be notified when you trigger an SOS alert</p>
                </div>
                {contacts.length < 5 && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                        + Add Contact
                    </button>
                )}
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-4">New Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="Full Name *"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-blue-400"
                        />
                        <input
                            placeholder="Phone Number *"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                        />
                        <input
                            placeholder="Email Address *"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                        />
                        <select
                            value={form.relationship}
                            onChange={e => setForm({ ...form, relationship: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-blue-400"
                        >
                            <option>Friend</option>
                            <option>Family</option>
                            <option>Parent</option>
                            <option>Sibling</option>
                            <option>Partner</option>
                            <option>Colleague</option>
                        </select>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleAdd}
                            disabled={saving}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Contact"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Contact list */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading contacts...</div>
            ) : contacts.length === 0 ? (
                <div className="text-center py-14 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-5xl mb-3">🆘</div>
                    <p className="text-gray-600 font-medium">No emergency contacts added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add contacts who will be alerted during an SOS</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {contacts.map(contact => (
                        <div key={contact._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{contact.name}</p>
                                    <p className="text-sm text-gray-500">{contact.relationship} · {contact.phone}</p>
                                    <p className="text-xs text-gray-400">{contact.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(contact._id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <p className="text-xs text-gray-400 text-center mt-2">{contacts.length}/5 contacts added</p>
                </div>
            )}
        </div>
    );
};

export default EmergencyContacts;
