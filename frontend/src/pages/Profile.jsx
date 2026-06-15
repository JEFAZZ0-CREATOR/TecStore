import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiLogOut,
  FiKey,
  FiUser,
  FiShield,
  FiSettings,
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { usersAPI, purchasesAPI } from "../services/api";
import { useAuthStore } from "../store/store";

const API_BASE = "http://127.0.0.1:3000";

const getAvatarSrc = (url, name) => {
  if (!url)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? "U")}&background=6d28d9&color=fff&size=128`;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const TABS = [
  { id: "perfil", label: "Perfil", icon: FiUser },
  { id: "seguridad", label: "Seguridad", icon: FiShield },
  { id: "preferencias", label: "Preferencias", icon: FiSettings },
];

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-white/10"
      style={{
        background:
          "linear-gradient(135deg,rgba(20,20,60,.85),rgba(12,12,32,.9))",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-display leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Field ────────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, disabled, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={11} />} {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ icon: Icon, disabled, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      )}
      <input
        disabled={disabled}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl text-sm text-white
                    border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20
                    ${
                      disabled
                        ? "bg-white/3 border-white/6 text-slate-400 cursor-not-allowed"
                        : "bg-white/6 border-white/12 focus:border-accent/50 hover:border-white/20"
                    } ${className}`}
        {...props}
      />
    </div>
  );
}

// ── Password field ────────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, name, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <div className="relative">
        <FiKey
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white bg-white/6
                      border transition-all focus:outline-none focus:ring-2 focus:ring-accent/20
                      ${error ? "border-danger/50 focus:border-danger" : "border-white/12 focus:border-accent/50 hover:border-white/20"}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <FiAlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Toggle preference ────────────────────────────────────────────────────────
function PrefToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/6 last:border-0">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
          checked ? "bg-accent" : "bg-white/15"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setTab] = useState("perfil");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoad] = useState(true);
  const fileInputRef = useRef(null);

  // Profile form
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUpload] = useState(false);

  // Security form
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoad] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    offerAlerts: true,
    priceDropAlerts: false,
    weeklyDigest: false,
  });

  // Load stats
  useEffect(() => {
    purchasesAPI
      .getStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null))
      .finally(() => setStatsLoad(false));
  }, []);

  // Sync formData if user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user?._id]);

  const avatarSrc = avatarPreview ?? getAvatarSrc(user?.avatarUrl, user?.name);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    setAvatarUpload(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const updated = await usersAPI.uploadAvatar(fd);
      setUser(updated);
      setAvatarPreview(getAvatarSrc(updated.avatarUrl, updated.name));
      toast.success("Foto de perfil actualizada");
    } catch {
      toast.error("Error al subir la foto");
      setAvatarPreview(null);
    } finally {
      setAvatarUpload(false);
      setAvatarFile(null);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile(formData);
      setUser(updated);
      setIsEditing(false);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passForm.current) errs.current = "Requerida";
    if (passForm.newPass.length < 6) errs.newPass = "Mínimo 6 caracteres";
    if (passForm.newPass !== passForm.confirm)
      errs.confirm = "Las contraseñas no coinciden";
    setPassErrors(errs);
    if (Object.keys(errs).length) return;

    setPassLoad(true);
    try {
      const updated = await usersAPI.updateProfile({
        password: passForm.newPass,
      });
      setUser(updated);
      setPassForm({ current: "", newPass: "", confirm: "" });
      toast.success("Contraseña cambiada correctamente");
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setPassLoad(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const totalOrders =
    stats?.totalSessions ?? stats?.count ?? stats?.totalPurchases ?? 0;
  const totalSpent = stats?.totalSpent ?? stats?.subtotal ?? 0;
  const fmtMoney = (n) =>
    `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ─── Hero card ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/12"
        style={{
          background:
            "linear-gradient(145deg,rgba(20,20,60,.9),rgba(10,10,28,.95))",
        }}
      >
        {/* Top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg,#6d28d9,#3b82f6,#22d3ee)",
          }}
        />

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-accent/40 shadow-neon">
              <img
                src={avatarSrc}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center
                         shadow-lg transition-all hover:scale-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6d28d9,#3b82f6)" }}
              title="Cambiar foto"
            >
              {avatarUploading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCamera size={14} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white font-display">
                {user?.name}
              </h1>
              {user?.role === "admin" && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent-light border border-accent/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            <p className="text-slate-600 text-xs flex items-center gap-1.5 mt-2">
              <FiCalendar size={11} /> Miembro desde {memberSince}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-danger transition-colors px-3 py-2
                       rounded-xl border border-white/8 hover:border-danger/30 hover:bg-danger/8"
          >
            <FiLogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </motion.div>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={FiShoppingBag}
          label="Compras registradas"
          value={statsLoading ? "—" : totalOrders}
          color="#3b82f6"
          delay={0.05}
        />
        <StatCard
          icon={FiDollarSign}
          label="Total invertido"
          value={statsLoading ? "—" : fmtMoney(totalSpent)}
          color="#22d3ee"
          delay={0.1}
        />
        <StatCard
          icon={FiStar}
          label="Puntos de fidelidad"
          value={statsLoading ? "—" : Math.round(totalSpent / 10)}
          color="#f59e0b"
          delay={0.15}
        />
        <StatCard
          icon={FiCalendar}
          label="Último ingreso"
          value={
            user?.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
          color="#10b981"
          delay={0.2}
        />
      </div>

      {/* ─── Tabs ──────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl border border-white/10 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg,rgba(18,18,50,.92),rgba(10,10,28,.96))",
        }}
      >
        {/* Tab bar */}
        <div className="flex border-b border-white/8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200
                          ${
                            activeTab === id
                              ? "text-white border-b-2 border-accent -mb-px"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            {/* ── PERFIL ── */}
            {activeTab === "perfil" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">
                    Información personal
                  </h2>
                  <button
                    onClick={() => {
                      setIsEditing((v) => !v);
                      if (isEditing && user)
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          address: user.address || "",
                        });
                    }}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isEditing
                        ? "text-slate-400 border-white/10 hover:text-white hover:bg-white/5"
                        : "text-accent border-accent/30 bg-accent/8 hover:bg-accent/15"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <FiX size={12} /> Cancelar
                      </>
                    ) : (
                      <>
                        <FiEdit2 size={12} /> Editar
                      </>
                    )}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo" icon={FiUser}>
                    <TextInput
                      icon={FiUser}
                      name="name"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Tu nombre"
                    />
                  </Field>
                  <Field label="Correo electrónico" icon={FiMail}>
                    <TextInput
                      icon={FiMail}
                      name="email"
                      type="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="tu@correo.com"
                    />
                  </Field>
                  <Field label="Teléfono" icon={FiPhone}>
                    <TextInput
                      icon={FiPhone}
                      name="phone"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="Tu teléfono"
                    />
                  </Field>
                  <Field label="Dirección" icon={FiMapPin}>
                    <TextInput
                      icon={FiMapPin}
                      name="address"
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="Tu dirección"
                    />
                  </Field>
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <button
                        onClick={handleProfileSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                            Guardando…
                          </>
                        ) : (
                          <>
                            <FiSave size={14} /> Guardar cambios
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── SEGURIDAD ── */}
            {activeTab === "seguridad" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white mb-0.5">
                    Cambiar contraseña
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Elige una contraseña segura de al menos 6 caracteres.
                  </p>
                </div>

                <form
                  onSubmit={handlePassChange}
                  className="space-y-4 max-w-sm"
                >
                  <Field label="Contraseña actual">
                    <PasswordInput
                      name="current"
                      placeholder="Tu contraseña actual"
                      value={passForm.current}
                      onChange={(e) =>
                        setPassForm((p) => ({ ...p, current: e.target.value }))
                      }
                      error={passErrors.current}
                    />
                  </Field>
                  <Field label="Nueva contraseña">
                    <PasswordInput
                      name="newPass"
                      placeholder="Nueva contraseña"
                      value={passForm.newPass}
                      onChange={(e) =>
                        setPassForm((p) => ({ ...p, newPass: e.target.value }))
                      }
                      error={passErrors.newPass}
                    />
                    {passForm.newPass.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {[6, 8, 12].map((len, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passForm.newPass.length >= len
                                ? ["bg-danger", "bg-warning", "bg-success"][i]
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </Field>
                  <Field label="Confirmar nueva contraseña">
                    <PasswordInput
                      name="confirm"
                      placeholder="Confirmar contraseña"
                      value={passForm.confirm}
                      onChange={(e) =>
                        setPassForm((p) => ({ ...p, confirm: e.target.value }))
                      }
                      error={passErrors.confirm}
                    />
                    {passForm.confirm &&
                      passForm.newPass === passForm.confirm && (
                        <p className="text-xs text-success flex items-center gap-1 mt-1">
                          <FiCheckCircle size={10} /> Las contraseñas coinciden
                        </p>
                      )}
                  </Field>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold mt-2
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Actualizando…
                      </>
                    ) : (
                      <>
                        <FiShield size={14} /> Actualizar contraseña
                      </>
                    )}
                  </button>
                </form>

                {/* Security info */}
                <div className="mt-6 pt-5 border-t border-white/8 space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Estado de la cuenta
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: "Correo verificado", ok: true },
                      { label: "Contraseña configurada", ok: true },
                      { label: "Autenticación 2FA", ok: false },
                      { label: "Sesiones activas", ok: true },
                    ].map(({ label, ok }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-sm"
                      >
                        {ok ? (
                          <FiCheckCircle size={14} className="text-success" />
                        ) : (
                          <FiAlertCircle size={14} className="text-warning" />
                        )}
                        <span
                          className={ok ? "text-slate-300" : "text-slate-500"}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PREFERENCIAS ── */}
            {activeTab === "preferencias" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white mb-0.5">
                    Notificaciones
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Controla qué comunicaciones recibes de TecStore.
                  </p>
                </div>

                <div
                  className="rounded-2xl border border-white/8 px-4 divide-y divide-white/5"
                  style={{ background: "rgba(255,255,255,.03)" }}
                >
                  <PrefToggle
                    label="Notificaciones por correo"
                    description="Recibe confirmaciones y actualizaciones de tus compras."
                    checked={prefs.emailNotifications}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, emailNotifications: v }))
                    }
                  />
                  <PrefToggle
                    label="Alertas de ofertas"
                    description="Entérate de las mejores promociones antes que nadie."
                    checked={prefs.offerAlerts}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, offerAlerts: v }))
                    }
                  />
                  <PrefToggle
                    label="Alertas de bajada de precio"
                    description="Te avisamos cuando baja el precio de un producto favorito."
                    checked={prefs.priceDropAlerts}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, priceDropAlerts: v }))
                    }
                  />
                  <PrefToggle
                    label="Resumen semanal"
                    description="Un correo cada semana con novedades y recomendaciones."
                    checked={prefs.weeklyDigest}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, weeklyDigest: v }))
                    }
                  />
                </div>

                <div className="pt-2">
                  <h2 className="text-base font-bold text-white mb-3">
                    Cuenta
                  </h2>
                  <div className="space-y-2">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8
                                       hover:bg-white/5 hover:border-white/15 transition-all text-left text-sm text-slate-400 hover:text-white"
                    >
                      <FiRefreshCw size={14} className="shrink-0" />
                      Sincronizar datos de compras
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-danger/15
                                       hover:bg-danger/8 hover:border-danger/30 transition-all text-left text-sm text-danger/70 hover:text-danger"
                    >
                      <FiX size={14} className="shrink-0" />
                      Eliminar cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
