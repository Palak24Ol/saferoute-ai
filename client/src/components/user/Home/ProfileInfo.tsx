import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector'
import { useFormik } from 'formik';
import * as Yup from 'yup'
import toast from 'react-hot-toast';
import axiosUser from '../../../services/axios/axiosUser'

// Reusable pink-styled field label
const FieldLabel = ({ text }: { text: string }) => (
    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#c2185b" }}>
        {text}
    </p>
);

// Read-only display field
const DisplayField = ({ value }: { value: string }) => (
    <div
        className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 font-medium"
        style={{ background: "#fce4ec", border: "1px solid #f8bbd0" }}
    >
        {value || "—"}
    </div>
);

// Editable input field
const EditField = ({ name, placeholder, onChange, type = "text" }: {
    name: string;
    placeholder: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    type?: string;
}) => (
    <input
        name={name}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
        style={{
            background: "#fff",
            border: "2px solid #f48fb1",
            color: "#333",
        }}
        onFocus={e => (e.target.style.borderColor = "#e91e63")}
        onBlur={e => (e.target.style.borderColor = "#f48fb1")}
    />
);

const ProfileInfo = () => {
    const { user_id, userToken } = useSelector((store: any) => store.user)
    const [userData, setuserData] = useState<any | {}>({})
    const [editProfile, seteditProfile] = useState(false)

    const getData = async () => {
        try {
            const { data } = await axiosUser(userToken).get(`userData?id=${user_id}`)
            setuserData(data)
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    useEffect(() => { getData() }, [])

    const formik = useFormik({
        initialValues: { name: "", email: "", mobile: "" },
        validationSchema: Yup.object({
            name: Yup.string().min(3, "Type a valid name"),
            email: Yup.string().email("Please enter a valid email"),
            mobile: Yup.string().length(10, "Please enter a valid number"),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const { data } = await axiosUser(userToken).post(`profileUpdate?user_id=${user_id}`, values)
                if (data.message === "Success") {
                    setuserData(data.userData)
                    seteditProfile(false)
                    toast.success("Profile updated successfully!")
                }
            } catch (error) {
                toast.error((error as Error).message);
            } finally {
                setSubmitting(false)
            }
        }
    })

    return (
        <div
            className="w-[96%] mx-auto rounded-2xl overflow-hidden"
            style={{
                background: "#fff",
                border: "1px solid #f8bbd0",
                boxShadow: "0 4px 24px rgba(233,30,99,0.08)",
            }}
        >
            <div className="md:flex items-stretch">

                {/* Left panel — avatar */}
                <div
                    className="md:w-1/3 flex flex-col items-center justify-center py-10 px-6 gap-4"
                    style={{
                        background: "linear-gradient(160deg, #fce4ec 0%, #f8bbd0 100%)",
                        borderRight: "1px solid #f48fb1",
                    }}
                >
                    {/* Avatar ring */}
                    <div
                        className="rounded-full p-1"
                        style={{
                            background: "linear-gradient(135deg, #e91e63, #f48fb1)",
                            boxShadow: "0 4px 18px rgba(233,30,99,0.3)",
                        }}
                    >
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
                            <img
                                src={userData?.userImage}
                                alt={userData?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold" style={{ color: "#880e4f" }}>
                            {userData?.name}
                        </h2>
                        <span
                            className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ background: "#e91e63", color: "#fff" }}
                        >
                            🌸 Active Member
                        </span>
                    </div>

                    {/* Referral badge */}
                    {userData?.referral_code && (
                        <div
                            className="mt-2 px-4 py-2 rounded-xl text-center w-full"
                            style={{ background: "#fff", border: "1px dashed #e91e63" }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c2185b" }}>
                                Referral Code
                            </p>
                            <p className="text-lg font-bold mt-1" style={{ color: "#e91e63" }}>
                                {userData?.referral_code}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right panel — fields */}
                <div className="md:w-2/3 py-8 px-6 md:px-10">
                    {!editProfile ? (
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel text="Name" />
                                    <DisplayField value={userData?.name} />
                                </div>
                                <div>
                                    <FieldLabel text="Mobile" />
                                    <DisplayField value={userData?.mobile?.toString()} />
                                </div>
                                <div>
                                    <FieldLabel text="Email" />
                                    <DisplayField value={userData?.email} />
                                </div>
                                <div>
                                    <FieldLabel text="Account Status" />
                                    <div
                                        className="w-full rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2"
                                        style={{ background: "#fce4ec", border: "1px solid #f8bbd0" }}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full inline-block"
                                            style={{ background: "#e91e63" }}
                                        />
                                        <span style={{ color: "#c2185b" }}>{userData?.account_status || "—"}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel text="Joining Date" />
                                    <DisplayField value={userData?.formattedDate} />
                                </div>
                            </div>

                            {/* Pink divider */}
                            <div
                                className="rounded-full my-1"
                                style={{ height: "2px", background: "linear-gradient(90deg, #f48fb1, transparent)" }}
                            />

                            <div>
                                <button
                                    onClick={() => seteditProfile(true)}
                                    className="px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
                                    style={{
                                        background: "linear-gradient(90deg, #e91e63, #f06292)",
                                        boxShadow: "0 4px 14px rgba(233,30,99,0.35)",
                                    }}
                                >
                                    ✏️ Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel text="Name" />
                                    <EditField name="name" placeholder={userData?.name} onChange={formik.handleChange} />
                                    {formik.errors.name && <p className="text-xs mt-1" style={{ color: "#e91e63" }}>{formik.errors.name}</p>}
                                </div>
                                <div>
                                    <FieldLabel text="Mobile" />
                                    <EditField name="mobile" placeholder={userData?.mobile?.toString()} onChange={formik.handleChange} type="number" />
                                    {formik.errors.mobile && <p className="text-xs mt-1" style={{ color: "#e91e63" }}>{formik.errors.mobile}</p>}
                                </div>
                                <div>
                                    <FieldLabel text="Email" />
                                    <EditField name="email" placeholder={userData?.email} onChange={formik.handleChange} />
                                    {formik.errors.email && <p className="text-xs mt-1" style={{ color: "#e91e63" }}>{formik.errors.email}</p>}
                                </div>
                                <div>
                                    <FieldLabel text="Referral Code" />
                                    <DisplayField value={userData?.referral_code} />
                                </div>
                                <div>
                                    <FieldLabel text="Account Status" />
                                    <DisplayField value={userData?.account_status} />
                                </div>
                                <div>
                                    <FieldLabel text="Joining Date" />
                                    <DisplayField value={userData?.formattedDate} />
                                </div>
                            </div>

                            <div
                                className="rounded-full my-1"
                                style={{ height: "2px", background: "linear-gradient(90deg, #f48fb1, transparent)" }}
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
                                    style={{
                                        background: "linear-gradient(90deg, #e91e63, #f06292)",
                                        boxShadow: "0 4px 14px rgba(233,30,99,0.35)",
                                    }}
                                >
                                    ✅ Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => seteditProfile(false)}
                                    className="px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90"
                                    style={{
                                        background: "#fce4ec",
                                        color: "#c2185b",
                                        border: "1px solid #f48fb1",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;